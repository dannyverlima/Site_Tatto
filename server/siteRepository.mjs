import { pool } from './db.mjs';
import { defaultSiteConfig } from './defaultConfig.mjs';

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeArray = (value) => (Array.isArray(value) ? value : []);

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

const hasTableColumn = async (client, tableName, columnName) => {
  const result = await client.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'app'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
    `,
    [tableName, columnName]
  );

  return result.rowCount > 0;
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
      const portfolioResult = await client.query(
        hasPortfolioSpecialistId
          ? 'SELECT id, title, style, image_url, specialist_id FROM app.portfolio_item WHERE site_id = $1 ORDER BY sort_order, created_at'
          : 'SELECT id, title, style, image_url, NULL::uuid AS specialist_id FROM app.portfolio_item WHERE site_id = $1 ORDER BY sort_order, created_at',
        [site.id]
      );
      'SELECT id, title, style, image_url, specialist_id FROM app.portfolio_item WHERE site_id = $1 AND is_published = true ORDER BY sort_order, created_at',
>>>>>>> a52e774cf638540e152caf7a48560aa561ea1a90
      [site.id]
    );
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

    // Compatibility fallback: old portfolio rows may have NULL specialist_id.
    // Attach these rows to the first active specialist so albums continue to
    // render in home and specialist pages until admin updates the association.
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
        'INSERT INTO app.portfolio_item (site_id, title, style, image_url, specialist_id, sort_order) VALUES ($1, $2, $3, $4, $5, $6)',
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

// ============= SPECIALISTS CRUD =============
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

// ============= PORTFOLIO CRUD =============
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
      'INSERT INTO app.portfolio_item (site_id, title, style, image_url, specialist_id, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
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

// ============= COURSE FEATURES CRUD =============
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

// ============= COURSE HIGHLIGHTS CRUD =============
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

// ============= COURSE EXTRA INFO CRUD =============
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
