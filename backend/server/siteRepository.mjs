import { pool } from './db.mjs';
import { defaultSiteConfig } from './defaultConfig.mjs';

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeArray = (value) => (Array.isArray(value) ? value : []);
const normalizePrice = (value) => {
  if (typeof value === 'number') return value;
  const cleaned = String(value ?? '').replace(/[R$\s]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : NaN;
};

const hasTableColumn = async (client, table, column) => {
  const res = await client.query(
    `SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'app' AND table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return res.rowCount > 0;
};

const mergeConfig = (partial) => ({
  hero: {
    ...defaultSiteConfig.hero,
    ...(partial && typeof partial.hero === 'object' ? partial.hero : {}),
  },
  course: {
    ...defaultSiteConfig.course,
    ...(partial && typeof partial.course === 'object' ? partial.course : {}),
    highlights: normalizeArray(partial?.course?.highlights),
    features: normalizeArray(partial?.course?.features),
    extraInfo: normalizeArray(partial?.course?.extraInfo),
  },
  portfolio: {
    items: normalizeArray(partial?.portfolio?.items),
  },
  specialists: {
    items: normalizeArray(partial?.specialists?.items),
  },
});

const getOrCreateSite = async (client) => {
  const existing = await client.query('SELECT id, name, domain FROM app.site ORDER BY created_at LIMIT 1');
  if (existing.rowCount > 0) {
    return existing.rows[0];
  }

  const inserted = await client.query(
    'INSERT INTO app.site (name, domain) VALUES ($1, $2) RETURNING id, name, domain',
    ['Studios Tatto', null]
  );
  return inserted.rows[0];
};

export const getSiteSummary = async () => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    return {
      name: site.name,
      domain: site.domain,
    };
  } finally {
    client.release();
  }
};

export const getContactInfo = async () => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const result = await client.query(
      'SELECT id, kind, label, value, link_url, sort_order, is_primary FROM app.contact_info WHERE site_id = $1 ORDER BY sort_order, created_at',
      [site.id]
    );
    return result.rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      label: row.label,
      value: row.value,
      linkUrl: row.link_url,
      sortOrder: row.sort_order,
      isPrimary: row.is_primary,
    }));
  } finally {
    client.release();
  }
};

export const getSocialLinks = async () => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const result = await client.query(
      'SELECT id, platform, label, url, sort_order, is_primary FROM app.social_link WHERE site_id = $1 ORDER BY sort_order, created_at',
      [site.id]
    );
    return result.rows.map((row) => ({
      id: row.id,
      platform: row.platform,
      label: row.label,
      url: row.url,
      sortOrder: row.sort_order,
      isPrimary: row.is_primary,
    }));
  } finally {
    client.release();
  }
};

export const getSiteLinks = async (placement) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const params = [site.id];
    let query = 'SELECT id, placement, label, href, sort_order, is_primary FROM app.site_link WHERE site_id = $1';
    if (placement) {
      query += ' AND placement = $2';
      params.push(placement);
    }
    query += ' ORDER BY sort_order, created_at';

    const result = await client.query(query, params);
    return result.rows.map((row) => ({
      id: row.id,
      placement: row.placement,
      label: row.label,
      href: row.href,
      sortOrder: row.sort_order,
      isPrimary: row.is_primary,
    }));
  } finally {
    client.release();
  }
};

export const getLocation = async () => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const result = await client.query(
      'SELECT id, name, address_line1, address_line2, city, state, country, postal_code, latitude, longitude, map_embed_url, reference, parking_info FROM app.location WHERE site_id = $1 ORDER BY created_at LIMIT 1',
      [site.id]
    );

    if (result.rowCount === 0) {
      return null;
    }

    const location = result.rows[0];
    const hoursResult = await client.query(
      'SELECT day_of_week, opens_at, closes_at, note, is_closed FROM app.opening_hours WHERE location_id = $1 ORDER BY day_of_week',
      [location.id]
    );

    return {
      name: location.name,
      addressLine1: location.address_line1,
      addressLine2: location.address_line2,
      city: location.city,
      state: location.state,
      country: location.country,
      postalCode: location.postal_code,
      latitude: location.latitude,
      longitude: location.longitude,
      mapEmbedUrl: location.map_embed_url,
      reference: location.reference,
      parkingInfo: location.parking_info,
      openingHours: hoursResult.rows.map((row) => ({
        dayOfWeek: row.day_of_week,
        opensAt: row.opens_at,
        closesAt: row.closes_at,
        note: row.note,
        isClosed: row.is_closed,
      })),
    };
  } finally {
    client.release();
  }
};

export const getReviews = async () => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const result = await client.query(
      'SELECT id, name, rating, comment, display_date FROM app.review WHERE site_id = $1 AND status = $2 ORDER BY submitted_at DESC',
      [site.id, 'published']
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      comment: row.comment,
      displayDate: row.display_date,
    }));
  } finally {
    client.release();
  }
};

export const createReview = async ({ name, rating, comment }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const safeName = normalizeString(name);
    const safeComment = normalizeString(comment);
    const safeRating = Number(rating);

    if (!safeName || !safeComment || Number.isNaN(safeRating)) {
      throw new Error('Dados invalidos');
    }

    await client.query(
      'INSERT INTO app.review (site_id, name, rating, comment, status) VALUES ($1, $2, $3, $4, $5)',
      [site.id, safeName, safeRating, safeComment, 'pending']
    );
  } finally {
    client.release();
  }
};

export const createContactSubmission = async ({ name, email, phone, message }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const safeName = normalizeString(name);
    const safeEmail = normalizeString(email);
    const safePhone = normalizeString(phone);
    const safeMessage = normalizeString(message);

    if (!safeName || !safeEmail || !safeMessage) {
      throw new Error('Dados invalidos');
    }

    await client.query(
      'INSERT INTO app.contact_submission (site_id, name, email, phone, message) VALUES ($1, $2, $3, $4, $5)',
      [site.id, safeName, safeEmail, safePhone, safeMessage]
    );
  } finally {
    client.release();
  }
};

export const createCourseEnrollment = async ({ name, email, phone, message }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const courseResult = await client.query(
      'SELECT id FROM app.course WHERE site_id = $1 ORDER BY created_at DESC LIMIT 1',
      [site.id]
    );

    if (courseResult.rowCount === 0) {
      throw new Error('Curso nao configurado');
    }

    const safeName = normalizeString(name);
    const safeEmail = normalizeString(email);
    const safePhone = normalizeString(phone);
    const safeMessage = normalizeString(message);

    if (!safeName || !safeEmail) {
      throw new Error('Dados invalidos');
    }

    await client.query(
      'INSERT INTO app.course_enrollment (course_id, name, email, phone, message) VALUES ($1, $2, $3, $4, $5)',
      [courseResult.rows[0].id, safeName, safeEmail, safePhone, safeMessage]
    );
  } finally {
    client.release();
  }
};

export const getSiteConfig = async () => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);

    const heroResult = await client.query(
      'SELECT background_type, background_url FROM app.hero WHERE site_id = $1',
      [site.id]
    );
    const courseResult = await client.query(
      'SELECT id, title, description, next_class, price, price_note FROM app.course WHERE site_id = $1',
      [site.id]
    );

    const heroRow = heroResult.rows[0];
    const courseRow = courseResult.rows[0];

    const features = [];
    const highlights = [];
    const extraInfo = [];

    if (courseRow) {
      const featureResult = await client.query(
        'SELECT id, title, description FROM app.course_feature WHERE course_id = $1 ORDER BY sort_order, created_at',
        [courseRow.id]
      );
      const highlightResult = await client.query(
        'SELECT id, text FROM app.course_highlight WHERE course_id = $1 ORDER BY sort_order, created_at',
        [courseRow.id]
      );
      const extraInfoResult = await client.query(
        'SELECT id, text FROM app.course_extra_info WHERE course_id = $1 ORDER BY sort_order, created_at',
        [courseRow.id]
      );

      features.push(...featureResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
      })));
      highlights.push(...highlightResult.rows.map((row) => row.text));
      extraInfo.push(...extraInfoResult.rows.map((row) => row.text));
    }


    const hasPortfolioSpecialistId = await hasTableColumn(client, 'portfolio_item', 'specialist_id');
    const portfolioQuery = hasPortfolioSpecialistId
      ? 'SELECT id, title, style, image_url, specialist_id FROM app.portfolio_item WHERE site_id = $1 AND is_published = true ORDER BY sort_order, created_at'
      : 'SELECT id, title, style, image_url, NULL::uuid AS specialist_id FROM app.portfolio_item WHERE site_id = $1 AND is_published = true ORDER BY sort_order, created_at';

    const portfolioResult = await client.query(portfolioQuery, [site.id]);

    const specialistResult = await client.query(
      'SELECT id, name, specialty, description, image_url, experience, instagram, whatsapp FROM app.specialist WHERE site_id = $1 AND is_active = true ORDER BY sort_order, created_at',
      [site.id]
    );

    const specialists = specialistResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      specialty: row.specialty,
      description: row.description,
      image: row.image_url,
      experience: row.experience,
      instagram: row.instagram,
      whatsapp: row.whatsapp,
    }));

    const fallbackSpecialistId = specialists[0]?.id ?? null;

    return {
      hero: {
        backgroundType: heroRow?.background_type || defaultSiteConfig.hero.backgroundType,
        backgroundUrl: heroRow?.background_url || defaultSiteConfig.hero.backgroundUrl,
      },
      course: {
        title: courseRow?.title || defaultSiteConfig.course.title,
        description: courseRow?.description || defaultSiteConfig.course.description,
        highlights,
        features,
        nextClass: courseRow?.next_class || defaultSiteConfig.course.nextClass,
        price: courseRow?.price || defaultSiteConfig.course.price,
        priceNote: courseRow?.price_note || defaultSiteConfig.course.priceNote,
        extraInfo,
      },
      portfolio: {
        items: portfolioResult.rows.map((row) => ({
          id: row.id,
          title: row.title,
          style: row.style,
          image: row.image_url,
          specialistId: row.specialist_id || fallbackSpecialistId,
        })),
      },
      specialists: {
        items: specialists,
      },
    };
  } finally {
    client.release();
  }
};

export const saveSiteConfig = async (config) => {
  const client = await pool.connect();
  try {
    const safeConfig = mergeConfig(config);
    const site = await getOrCreateSite(client);

    const backgroundType = safeConfig.hero.backgroundType === 'video' ? 'video' : 'image';
    const backgroundUrl = normalizeString(safeConfig.hero.backgroundUrl);

    await client.query('BEGIN');

    await client.query(
      'INSERT INTO app.hero (site_id, background_type, background_url) VALUES ($1, $2, $3) ON CONFLICT (site_id) DO UPDATE SET background_type = EXCLUDED.background_type, background_url = EXCLUDED.background_url',
      [site.id, backgroundType, backgroundUrl]
    );

    const courseResult = await client.query('SELECT id FROM app.course WHERE site_id = $1', [site.id]);
    let courseId = courseResult.rowCount ? courseResult.rows[0].id : null;

    if (!courseId) {
      const inserted = await client.query(
        'INSERT INTO app.course (site_id, title, description, next_class, price, price_note) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [
          site.id,
          normalizeString(safeConfig.course.title),
          normalizeString(safeConfig.course.description),
          normalizeString(safeConfig.course.nextClass),
          normalizeString(safeConfig.course.price),
          normalizeString(safeConfig.course.priceNote),
        ]
      );
      courseId = inserted.rows[0].id;
    } else {
      await client.query(
        'UPDATE app.course SET title = $1, description = $2, next_class = $3, price = $4, price_note = $5 WHERE id = $6',
        [
          normalizeString(safeConfig.course.title),
          normalizeString(safeConfig.course.description),
          normalizeString(safeConfig.course.nextClass),
          normalizeString(safeConfig.course.price),
          normalizeString(safeConfig.course.priceNote),
          courseId,
        ]
      );
    }

    await client.query('DELETE FROM app.course_feature WHERE course_id = $1', [courseId]);
    await client.query('DELETE FROM app.course_highlight WHERE course_id = $1', [courseId]);
    await client.query('DELETE FROM app.course_extra_info WHERE course_id = $1', [courseId]);

    for (const [index, feature] of safeConfig.course.features.entries()) {
      await client.query(
        'INSERT INTO app.course_feature (course_id, title, description, sort_order) VALUES ($1, $2, $3, $4)',
        [
          courseId,
          normalizeString(feature.title),
          normalizeString(feature.description),
          index,
        ]
      );
    }

    for (const [index, item] of safeConfig.course.highlights.entries()) {
      await client.query(
        'INSERT INTO app.course_highlight (course_id, text, sort_order) VALUES ($1, $2, $3)',
        [courseId, normalizeString(item), index]
      );
    }

    for (const [index, item] of safeConfig.course.extraInfo.entries()) {
      await client.query(
        'INSERT INTO app.course_extra_info (course_id, text, sort_order) VALUES ($1, $2, $3)',
        [courseId, normalizeString(item), index]
      );
    }

    await client.query('DELETE FROM app.portfolio_item WHERE site_id = $1', [site.id]);
    for (const [index, item] of safeConfig.portfolio.items.entries()) {
      await client.query(
        'INSERT INTO app.portfolio_item (site_id, title, style, image_url, specialist_id, sort_order, is_published) VALUES ($1, $2, $3, $4, $5, $6, true)',
        [
          site.id,
          normalizeString(item.title),
          normalizeString(item.style),
          normalizeString(item.image || item.imageUrl),
          item.specialistId || null,
          index,
        ]
      );
    }

    await client.query('DELETE FROM app.specialist WHERE site_id = $1', [site.id]);
    for (const [index, item] of safeConfig.specialists.items.entries()) {
      await client.query(
        'INSERT INTO app.specialist (site_id, name, specialty, description, image_url, experience, instagram, whatsapp, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          site.id,
          normalizeString(item.name),
          normalizeString(item.specialty),
          normalizeString(item.description),
          normalizeString(item.image || item.imageUrl),
          normalizeString(item.experience),
          normalizeString(item.instagram),
          normalizeString(item.whatsapp),
          index,
        ]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getSpecialists = async () => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const result = await client.query(
      'SELECT id, name, specialty, description, image_url, experience, instagram, whatsapp, sort_order, is_active FROM app.specialist WHERE site_id = $1 ORDER BY sort_order, created_at',
      [site.id]
    );
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      specialty: row.specialty,
      description: row.description,
      imageUrl: row.image_url,
      experience: row.experience,
      instagram: row.instagram,
      whatsapp: row.whatsapp,
      sortOrder: row.sort_order,
      isActive: row.is_active,
    }));
  } finally {
    client.release();
  }
};

export const createSpecialist = async ({ name, specialty, description, imageUrl, experience, instagram, whatsapp }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const safeName = normalizeString(name);
    const safeSpecialty = normalizeString(specialty);
    const safeDescription = normalizeString(description);
    const safeImageUrl = normalizeString(imageUrl);
    const safeExperience = normalizeString(experience);
    const safeInstagram = normalizeString(instagram);
    const safeWhatsapp = normalizeString(whatsapp);

    if (!safeName || !safeSpecialty || !safeImageUrl) {
      throw new Error('Nome, especialidade e imagem são obrigatórios');
    }

    const countResult = await client.query('SELECT COUNT(*) as count FROM app.specialist WHERE site_id = $1', [site.id]);
    const sortOrder = parseInt(countResult.rows[0].count);

    const result = await client.query(
      'INSERT INTO app.specialist (site_id, name, specialty, description, image_url, experience, instagram, whatsapp, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [site.id, safeName, safeSpecialty, safeDescription, safeImageUrl, safeExperience, safeInstagram, safeWhatsapp, sortOrder]
    );

    return result.rows[0].id;
  } finally {
    client.release();
  }
};

export const updateSpecialist = async (id, { name, specialty, description, imageUrl, experience, instagram, whatsapp, sortOrder, isActive }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const safeName = normalizeString(name);
    const safeSpecialty = normalizeString(specialty);
    const safeDescription = normalizeString(description);
    const safeImageUrl = normalizeString(imageUrl);
    const safeExperience = normalizeString(experience);
    const safeInstagram = normalizeString(instagram);
    const safeWhatsapp = normalizeString(whatsapp);

    if (!safeName || !safeSpecialty || !safeImageUrl) {
      throw new Error('Nome, especialidade e imagem são obrigatórios');
    }

    await client.query(
      'UPDATE app.specialist SET name = $1, specialty = $2, description = $3, image_url = $4, experience = $5, instagram = $6, whatsapp = $7, sort_order = $8, is_active = $9 WHERE id = $10 AND site_id = $11',
      [safeName, safeSpecialty, safeDescription, safeImageUrl, safeExperience, safeInstagram, safeWhatsapp, sortOrder ?? 0, isActive ?? true, id, site.id]
    );
  } finally {
    client.release();
  }
};

export const deleteSpecialist = async (id) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    await client.query('DELETE FROM app.specialist WHERE id = $1 AND site_id = $2', [id, site.id]);
  } finally {
    client.release();
  }
};


export const getPortfolioItems = async () => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const result = await client.query(
      'SELECT id, title, style, image_url, specialist_id, sort_order, is_published FROM app.portfolio_item WHERE site_id = $1 ORDER BY sort_order, created_at',
      [site.id]
    );
    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      style: row.style,
      imageUrl: row.image_url,
      specialistId: row.specialist_id,
      sortOrder: row.sort_order,
      isPublished: row.is_published,
    }));
  } finally {
    client.release();
  }
};

export const createPortfolioItem = async ({ title, style, imageUrl, specialistId }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const safeTitle = normalizeString(title);
    const safeStyle = normalizeString(style);
    const safeImageUrl = normalizeString(imageUrl);
    const safeSpecialistId = specialistId || null;

    if (!safeTitle || !safeImageUrl) {
      throw new Error('Título e imagem são obrigatórios');
    }

    const countResult = await client.query('SELECT COUNT(*) as count FROM app.portfolio_item WHERE site_id = $1', [site.id]);
    const sortOrder = parseInt(countResult.rows[0].count);

    const result = await client.query(
      'INSERT INTO app.portfolio_item (site_id, title, style, image_url, specialist_id, sort_order, is_published) VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id',
      [site.id, safeTitle, safeStyle, safeImageUrl, safeSpecialistId, sortOrder]
    );

    return result.rows[0].id;
  } finally {
    client.release();
  }
};

export const updatePortfolioItem = async (id, { title, style, imageUrl, sortOrder, isPublished, specialistId }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const safeTitle = normalizeString(title);
    const safeStyle = normalizeString(style);
    const safeImageUrl = normalizeString(imageUrl);
    const safeSpecialistId = specialistId || null;

    if (!safeTitle || !safeImageUrl) {
      throw new Error('Título e imagem são obrigatórios');
    }

    await client.query(
      'UPDATE app.portfolio_item SET title = $1, style = $2, image_url = $3, specialist_id = $4, sort_order = $5, is_published = $6 WHERE id = $7 AND site_id = $8',
      [safeTitle, safeStyle, safeImageUrl, safeSpecialistId, sortOrder ?? 0, isPublished ?? true, id, site.id]
    );
  } finally {
    client.release();
  }
};

export const deletePortfolioItem = async (id) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    await client.query('DELETE FROM app.portfolio_item WHERE id = $1 AND site_id = $2', [id, site.id]);
  } finally {
    client.release();
  }
};

// ============= COURSE CRUD =============
export const getCourse = async () => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const result = await client.query('SELECT id, title, description, next_class, price, price_note FROM app.course WHERE site_id = $1', [site.id]);

    if (result.rowCount === 0) {
      return null;
    }

    const course = result.rows[0];
    const featureResult = await client.query(
      'SELECT id, title, description, sort_order FROM app.course_feature WHERE course_id = $1 ORDER BY sort_order, created_at',
      [course.id]
    );
    const highlightResult = await client.query(
      'SELECT id, text, sort_order FROM app.course_highlight WHERE course_id = $1 ORDER BY sort_order, created_at',
      [course.id]
    );
    const extraInfoResult = await client.query(
      'SELECT id, text, sort_order FROM app.course_extra_info WHERE course_id = $1 ORDER BY sort_order, created_at',
      [course.id]
    );

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      nextClass: course.next_class,
      price: course.price,
      priceNote: course.price_note,
      features: featureResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        sortOrder: row.sort_order,
      })),
      highlights: highlightResult.rows.map((row) => ({
        id: row.id,
        text: row.text,
        sortOrder: row.sort_order,
      })),
      extraInfo: extraInfoResult.rows.map((row) => ({
        id: row.id,
        text: row.text,
        sortOrder: row.sort_order,
      })),
    };
  } finally {
    client.release();
  }
};

export const updateCourse = async (courseId, { title, description, nextClass, price, priceNote }) => {
  const client = await pool.connect();
  try {
    const safeTitle = normalizeString(title);
    const safeDescription = normalizeString(description);
    const safeNextClass = normalizeString(nextClass);
    const safePrice = normalizeString(price);
    const safePriceNote = normalizeString(priceNote);

    if (!safeTitle || !safeDescription) {
      throw new Error('Título e descrição são obrigatórios');
    }

    await client.query(
      'UPDATE app.course SET title = $1, description = $2, next_class = $3, price = $4, price_note = $5 WHERE id = $6',
      [safeTitle, safeDescription, safeNextClass, safePrice, safePriceNote, courseId]
    );
  } finally {
    client.release();
  }
};

export const createCourseFeature = async (courseId, { title, description }) => {
  const client = await pool.connect();
  try {
    const safeTitle = normalizeString(title);
    const safeDescription = normalizeString(description);

    if (!safeTitle || !safeDescription) {
      throw new Error('Título e descrição são obrigatórios');
    }

    const countResult = await client.query('SELECT COUNT(*) as count FROM app.course_feature WHERE course_id = $1', [courseId]);
    const sortOrder = parseInt(countResult.rows[0].count);

    const result = await client.query(
      'INSERT INTO app.course_feature (course_id, title, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
      [courseId, safeTitle, safeDescription, sortOrder]
    );

    return result.rows[0].id;
  } finally {
    client.release();
  }
};

export const updateCourseFeature = async (featureId, { title, description, sortOrder }) => {
  const client = await pool.connect();
  try {
    const safeTitle = normalizeString(title);
    const safeDescription = normalizeString(description);

    if (!safeTitle || !safeDescription) {
      throw new Error('Título e descrição são obrigatórios');
    }

    await client.query(
      'UPDATE app.course_feature SET title = $1, description = $2, sort_order = $3 WHERE id = $4',
      [safeTitle, safeDescription, sortOrder ?? 0, featureId]
    );
  } finally {
    client.release();
  }
};

export const deleteCourseFeature = async (featureId) => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM app.course_feature WHERE id = $1', [featureId]);
  } finally {
    client.release();
  }
};

export const createCourseHighlight = async (courseId, { text }) => {
  const client = await pool.connect();
  try {
    const safeText = normalizeString(text);

    if (!safeText) {
      throw new Error('Highlight é obrigatório');
    }

    const countResult = await client.query('SELECT COUNT(*) as count FROM app.course_highlight WHERE course_id = $1', [courseId]);
    const sortOrder = parseInt(countResult.rows[0].count);

    const result = await client.query(
      'INSERT INTO app.course_highlight (course_id, text, sort_order) VALUES ($1, $2, $3) RETURNING id',
      [courseId, safeText, sortOrder]
    );

    return result.rows[0].id;
  } finally {
    client.release();
  }
};

export const updateCourseHighlight = async (highlightId, { text, sortOrder }) => {
  const client = await pool.connect();
  try {
    const safeText = normalizeString(text);

    if (!safeText) {
      throw new Error('Highlight é obrigatório');
    }

    await client.query('UPDATE app.course_highlight SET text = $1, sort_order = $2 WHERE id = $3', [safeText, sortOrder ?? 0, highlightId]);
  } finally {
    client.release();
  }
};

export const deleteCourseHighlight = async (highlightId) => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM app.course_highlight WHERE id = $1', [highlightId]);
  } finally {
    client.release();
  }
};


export const createCourseExtraInfo = async (courseId, { text }) => {
  const client = await pool.connect();
  try {
    const safeText = normalizeString(text);

    if (!safeText) {
      throw new Error('Informação extra é obrigatória');
    }

    const countResult = await client.query('SELECT COUNT(*) as count FROM app.course_extra_info WHERE course_id = $1', [courseId]);
    const sortOrder = parseInt(countResult.rows[0].count);

    const result = await client.query(
      'INSERT INTO app.course_extra_info (course_id, text, sort_order) VALUES ($1, $2, $3) RETURNING id',
      [courseId, safeText, sortOrder]
    );

    return result.rows[0].id;
  } finally {
    client.release();
  }
};

export const updateCourseExtraInfo = async (extraInfoId, { text, sortOrder }) => {
  const client = await pool.connect();
  try {
    const safeText = normalizeString(text);

    if (!safeText) {
      throw new Error('Informação extra é obrigatória');
    }

    await client.query('UPDATE app.course_extra_info SET text = $1, sort_order = $2 WHERE id = $3', [safeText, sortOrder ?? 0, extraInfoId]);
  } finally {
    client.release();
  }
};

export const deleteCourseExtraInfo = async (extraInfoId) => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM app.course_extra_info WHERE id = $1', [extraInfoId]);
  } finally {
    client.release();
  }
};

// ============= JEWELRY STORE =============
export const getJewelryItems = async ({ includeInactive = false, featuredOnly = false, category = null } = {}) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const useCategory = category && category !== 'geral';
    const params = [site.id];
    if (useCategory) params.push(category);
    const catClause = useCategory ? ` AND category = $${params.length}` : '';

    let query;
    if (featuredOnly) {
      query = `SELECT id, name, description, price, is_active, stock, discount_percent, is_featured, category FROM app.jewelry_item WHERE site_id = $1 AND is_active = true AND is_featured = true${catClause} ORDER BY created_at DESC`;
    } else if (includeInactive) {
      query = `SELECT id, name, description, price, is_active, stock, discount_percent, is_featured, category FROM app.jewelry_item WHERE site_id = $1${catClause} ORDER BY created_at DESC`;
    } else {
      query = `SELECT id, name, description, price, is_active, stock, discount_percent, is_featured, category FROM app.jewelry_item WHERE site_id = $1 AND is_active = true${catClause} ORDER BY created_at DESC`;
    }
    const result = await client.query(query, params);

    if (result.rowCount === 0) {
      return [];
    }

    const itemIds = result.rows.map((row) => row.id);
    const photoResult = await client.query(
      'SELECT item_id, image_url, sort_order FROM app.jewelry_photo WHERE item_id = ANY($1::uuid[]) ORDER BY sort_order, created_at',
      [itemIds]
    );

    const photosByItem = new Map();
    for (const row of photoResult.rows) {
      if (!photosByItem.has(row.item_id)) {
        photosByItem.set(row.item_id, []);
      }
      photosByItem.get(row.item_id).push(row.image_url);
    }

    return result.rows.map((row) => {
      const imageUrls = photosByItem.get(row.id) || [];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        isActive: row.is_active,
        stock: Number(row.stock ?? 0),
        discountPercent: Number(row.discount_percent ?? 0),
        isFeatured: Boolean(row.is_featured),
        category: row.category || 'geral',
        imageUrls,
        primaryImageUrl: imageUrls[0] || '',
      };
    });
  } finally {
    client.release();
  }
};

export const createJewelryItem = async ({ name, description, price, imageUrls, isActive, stock, discountPercent, isFeatured, category }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const safeName = normalizeString(name);
    const safeDescription = normalizeString(description);
    const safePrice = normalizePrice(price);
    const safeIsActive = typeof isActive === 'boolean' ? isActive : true;
    const safeImages = normalizeArray(imageUrls).map(normalizeString).filter(Boolean);
    const safeStock = Number.isFinite(Number(stock)) ? Math.max(0, Math.floor(Number(stock))) : 0;
    const safeDiscount = Number.isFinite(Number(discountPercent)) ? Math.min(100, Math.max(0, Number(discountPercent))) : 0;
    const safeIsFeatured = typeof isFeatured === 'boolean' ? isFeatured : false;
    const validCategories = ['geral', 'homem', 'mulher', 'crianca'];
    const safeCategory = validCategories.includes(category) ? category : 'geral';

    if (!safeName || Number.isNaN(safePrice)) {
      throw new Error('Nome e preço são obrigatórios');
    }

    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO app.jewelry_item (site_id, name, description, price, is_active, stock, discount_percent, is_featured, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [site.id, safeName, safeDescription, safePrice, safeIsActive, safeStock, safeDiscount, safeIsFeatured, safeCategory]
    );
    const itemId = result.rows[0].id;

    for (const [index, imageUrl] of safeImages.entries()) {
      await client.query(
        'INSERT INTO app.jewelry_photo (item_id, image_url, sort_order) VALUES ($1, $2, $3)',
        [itemId, imageUrl, index]
      );
    }

    await client.query('COMMIT');
    return itemId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateJewelryItem = async (id, { name, description, price, imageUrls, isActive, stock, discountPercent, isFeatured, category }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const safeName = normalizeString(name);
    const safeDescription = normalizeString(description);
    const safePrice = normalizePrice(price);
    const safeIsActive = typeof isActive === 'boolean' ? isActive : true;
    const safeImages = normalizeArray(imageUrls).map(normalizeString).filter(Boolean);
    const safeStock = Number.isFinite(Number(stock)) ? Math.max(0, Math.floor(Number(stock))) : 0;
    const safeDiscount = Number.isFinite(Number(discountPercent)) ? Math.min(100, Math.max(0, Number(discountPercent))) : 0;
    const safeIsFeatured = typeof isFeatured === 'boolean' ? isFeatured : false;
    const validCategories2 = ['geral', 'homem', 'mulher', 'crianca'];
    const safeCategory2 = validCategories2.includes(category) ? category : 'geral';

    if (!safeName || Number.isNaN(safePrice)) {
      throw new Error('Nome e preço são obrigatórios');
    }

    await client.query('BEGIN');
    await client.query(
      'UPDATE app.jewelry_item SET name = $1, description = $2, price = $3, is_active = $4, stock = $5, discount_percent = $6, is_featured = $7, category = $8, updated_at = now() WHERE id = $9 AND site_id = $10',
      [safeName, safeDescription, safePrice, safeIsActive, safeStock, safeDiscount, safeIsFeatured, safeCategory2, id, site.id]
    );

    if (Array.isArray(imageUrls)) {
      await client.query('DELETE FROM app.jewelry_photo WHERE item_id = $1', [id]);
      for (const [index, imageUrl] of safeImages.entries()) {
        await client.query(
          'INSERT INTO app.jewelry_photo (item_id, image_url, sort_order) VALUES ($1, $2, $3)',
          [id, imageUrl, index]
        );
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deleteJewelryItem = async (id) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    await client.query('DELETE FROM app.jewelry_item WHERE id = $1 AND site_id = $2', [id, site.id]);
  } finally {
    client.release();
  }
};

export const createJewelryOrder = async ({
  customerName,
  email,
  phone,
  deliveryMethod,
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  notes,
  items,
  paymentMethod,
  pickupDate,
  initialStatus,
}) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const safeName = normalizeString(customerName);
    const safeEmail = normalizeString(email);
    const safePhone = normalizeString(phone);
    const safeDelivery = deliveryMethod === 'pickup' ? 'pickup' : 'delivery';
    const safePaymentMethod = ['pix', 'cartao'].includes(paymentMethod) ? paymentMethod : 'dinheiro';
    const safeAddressLine1 = normalizeString(addressLine1);
    const safeAddressLine2 = normalizeString(addressLine2);
    const safeCity = normalizeString(city);
    const safeState = normalizeString(state);
    const safePostalCode = normalizeString(postalCode);
    const safeNotes = normalizeString(notes);

    const safeItems = normalizeArray(items)
      .map((item) => ({
        id: normalizeString(item?.id),
        quantity: Number.parseInt(item?.quantity, 10),
      }))
      .filter((item) => item.id && Number.isFinite(item.quantity) && item.quantity > 0);

    if (!safeName) {
      throw new Error('Nome é obrigatório');
    }

    // Items can be empty for custom/encomenda orders (no catalog items selected)
    let productMap = new Map();
    if (safeItems.length > 0) {
      const uniqueIds = Array.from(new Set(safeItems.map((item) => item.id)));
      const productResult = await client.query(
        'SELECT id, name, price FROM app.jewelry_item WHERE site_id = $1 AND id = ANY($2::uuid[]) AND is_active = true',
        [site.id, uniqueIds]
      );
      if (productResult.rowCount !== uniqueIds.length) {
        throw new Error('Uma ou mais joias nao foram encontradas');
      }
      productMap = new Map(productResult.rows.map((row) => [row.id, row]));
    }

    const safePickupDate = normalizeString(pickupDate);
    const allowedStatuses = ['nulo', 'pago', 'encomendado_pago', 'entregue', 'pegar_na_loja'];
    const safeInitialStatus = allowedStatuses.includes(initialStatus) ? initialStatus : 'nulo';

    await client.query('BEGIN');
    const orderResult = await client.query(
      `
        INSERT INTO app.jewelry_order
          (site_id, customer_name, email, phone, delivery_method, address_line1, address_line2, city, state, postal_code, notes, payment_method, pickup_date, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `,
      [
        site.id,
        safeName,
        safeEmail,
        safePhone,
        safeDelivery,
        safeAddressLine1,
        safeAddressLine2,
        safeCity,
        safeState,
        safePostalCode,
        safeNotes,
        safePaymentMethod,
        safePickupDate,
        safeInitialStatus,
      ]
    );

    const orderId = orderResult.rows[0].id;
    for (const item of safeItems) {
      const product = productMap.get(item.id);
      if (!product) {
        continue;
      }

      await client.query(
        'INSERT INTO app.jewelry_order_item (order_id, jewelry_item_id, name, price, quantity) VALUES ($1, $2, $3, $4, $5)',
        [orderId, product.id, product.name, product.price, item.quantity]
      );
    }

    // Update shipping fee and total on order
    const shippingFeeResult = await client.query(
      "SELECT value FROM app.site_setting WHERE site_id = $1 AND key = 'jewelry_shipping_fee'",
      [site.id]
    );
    const shippingFee = shippingFeeResult.rowCount > 0 ? Number(shippingFeeResult.rows[0].value) || 0 : 0;
    const orderTotal = safeItems.reduce((acc, item) => {
      const product = productMap.get(item.id);
      return acc + (product ? Number(product.price) * item.quantity : 0);
    }, 0) + (safeDelivery === 'delivery' ? shippingFee : 0);

    await client.query(
      'UPDATE app.jewelry_order SET shipping_fee = $1, total = $2 WHERE id = $3',
      [safeDelivery === 'delivery' ? shippingFee : 0, orderTotal, orderId]
    );

    await client.query('COMMIT');
    return orderId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// ============= JEWELRY ORDERS ADMIN =============
export const getJewelryOrders = async () => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const result = await client.query(
      `SELECT id, customer_name, email, phone, delivery_method, address_line1, city, state,
              postal_code, notes, status, shipping_fee, total, submitted_at, updated_at, paid_at, pickup_date
       FROM app.jewelry_order WHERE site_id = $1 ORDER BY submitted_at DESC`,
      [site.id]
    );

    if (result.rowCount === 0) {
      return [];
    }

    const orderIds = result.rows.map((row) => row.id);
    const itemsResult = await client.query(
      'SELECT order_id, name, price, quantity FROM app.jewelry_order_item WHERE order_id = ANY($1::uuid[]) ORDER BY id',
      [orderIds]
    );

    const itemsByOrder = new Map();
    for (const row of itemsResult.rows) {
      if (!itemsByOrder.has(row.order_id)) {
        itemsByOrder.set(row.order_id, []);
      }
      itemsByOrder.get(row.order_id).push({
        name: row.name,
        price: Number(row.price),
        quantity: row.quantity,
      });
    }

    return result.rows.map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      email: row.email,
      phone: row.phone,
      deliveryMethod: row.delivery_method,
      addressLine1: row.address_line1,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      notes: row.notes,
      status: row.status,
      shippingFee: Number(row.shipping_fee ?? 0),
      total: Number(row.total ?? 0),
      submittedAt: row.submitted_at,
      updatedAt: row.updated_at,
      paidAt: row.paid_at,
      pickupDate: row.pickup_date || null,
      items: itemsByOrder.get(row.id) || [],
    }));
  } finally {
    client.release();
  }
};

export const updateJewelryOrderStatus = async (id, { status }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const allowed = ['nulo', 'pago', 'encomendado_pago', 'entregue', 'pegar_na_loja'];
    const safeStatus = allowed.includes(status) ? status : 'nulo';
    const setPaidAt = safeStatus === 'pago' || safeStatus === 'encomendado_pago' || safeStatus === 'entregue';

    await client.query(
      `UPDATE app.jewelry_order SET status = $1, updated_at = now(), paid_at = ${setPaidAt ? 'COALESCE(paid_at, now())' : 'paid_at'} WHERE id = $2 AND site_id = $3`,
      [safeStatus, id, site.id]
    );
  } finally {
    client.release();
  }
};

export const deleteJewelryOrder = async (id) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    await client.query('BEGIN');
    await client.query('DELETE FROM app.jewelry_order_item WHERE order_id = $1', [id]);
    await client.query('DELETE FROM app.jewelry_order WHERE id = $1 AND site_id = $2', [id, site.id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const createManualSale = async ({ customerName, description, total, paidAt }) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    await client.query('BEGIN');
    const safeTotal = Math.max(0, Number(total) || 0);
    const safeName = String(customerName || 'Venda manual').slice(0, 200);
    const safeDesc = String(description || 'Lançamento manual').slice(0, 200);
    const safePaidAt = paidAt ? new Date(paidAt) : new Date();

    const { rows } = await client.query(
      `INSERT INTO app.jewelry_order
         (site_id, customer_name, email, phone, delivery_method, payment_method, status, total, submitted_at, paid_at, updated_at)
       VALUES ($1, $2, '', '', 'pickup', 'dinheiro', 'done', $3, $4, $4, $4)
       RETURNING id`,
      [site.id, safeName, safeTotal, safePaidAt]
    );
    const orderId = rows[0].id;
    await client.query(
      'INSERT INTO app.jewelry_order_item (order_id, jewelry_item_id, name, price, quantity) VALUES ($1, NULL, $2, $3, 1)',
      [orderId, safeDesc, safeTotal]
    );
    await client.query('COMMIT');
    return orderId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ============= SITE SETTINGS =============
export const getSiteSettings = async (keys = []) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const result = keys.length > 0
      ? await client.query('SELECT key, value FROM app.site_setting WHERE site_id = $1 AND key = ANY($2)', [site.id, keys])
      : await client.query('SELECT key, value FROM app.site_setting WHERE site_id = $1', [site.id]);
    const settings = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    return settings;
  } finally {
    client.release();
  }
};

export const setSiteSetting = async (key, value) => {
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);
    const safeKey = String(key || '').trim().slice(0, 128);
    const safeValue = String(value ?? '').slice(0, 2048);
    if (!safeKey) {
      throw new Error('Chave inválida');
    }
    await client.query(
      'INSERT INTO app.site_setting (site_id, key, value) VALUES ($1, $2, $3) ON CONFLICT (site_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()',
      [site.id, safeKey, safeValue]
    );
  } finally {
    client.release();
  }
};

export const getJewelryItemsByIds = async (ids) => {
  if (!ids || !ids.length) return [];
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, name, price, discount_percent FROM app.jewelry_item WHERE id = ANY($1::uuid[])',
      [ids]
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      price: Number(r.price),
      discountPercent: Number(r.discount_percent) || 0,
    }));
  } finally {
    client.release();
  }
};

// ============= JEWELRY SALES / FATURAMENTO =============
export const getJewelrySales = async ({ year } = {}) => {
  const targetYear = Number(year) || new Date().getFullYear();
  const client = await pool.connect();
  try {
    const site = await getOrCreateSite(client);

    // Monthly revenue from completed orders in the target year
    const monthlyResult = await client.query(
      `SELECT
         date_trunc('month', o.paid_at) AS month,
         COUNT(DISTINCT o.id) AS orders_count,
         COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue
       FROM app.jewelry_order o
       JOIN app.jewelry_order_item oi ON oi.order_id = o.id
       WHERE o.site_id = $1
         AND o.status = 'done'
         AND EXTRACT(YEAR FROM o.paid_at) = $2
       GROUP BY date_trunc('month', o.paid_at)
       ORDER BY month ASC`,
      [site.id, targetYear]
    );

    // Build map by month index (0-11) and fill all 12 months
    const monthMap = new Map();
    for (const row of monthlyResult.rows) {
      const idx = new Date(row.month).getMonth();
      monthMap.set(idx, { month: row.month, ordersCount: Number(row.orders_count), revenue: Number(row.revenue) });
    }
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const iso = new Date(targetYear, i, 1).toISOString();
      return monthMap.get(i) || { month: iso, ordersCount: 0, revenue: 0 };
    });

    // Recent completed orders
    const ordersResult = await client.query(
      `SELECT o.id, o.customer_name, o.total, o.paid_at, o.delivery_method,
              array_agg(oi.name || ' x' || oi.quantity) AS items_summary
       FROM app.jewelry_order o
       JOIN app.jewelry_order_item oi ON oi.order_id = o.id
       WHERE o.site_id = $1 AND o.status = 'done'
       GROUP BY o.id
       ORDER BY o.paid_at DESC
       LIMIT 50`,
      [site.id]
    );

    return {
      monthly,
      recentSales: ordersResult.rows.map((row) => ({
        id: row.id,
        customerName: row.customer_name,
        total: Number(row.total),
        paidAt: row.paid_at,
        deliveryMethod: row.delivery_method,
        itemsSummary: row.items_summary || [],
      })),
    };
  } finally {
    client.release();
  }
};
