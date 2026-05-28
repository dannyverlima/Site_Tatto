export type HeroBackgroundType = 'image' | 'video';

const SITE_CONFIG_UPDATED_KEY = 'site-config-updated-at';

export type CourseFeature = {
  title: string;
  description: string;
};

export type SiteConfig = {
  hero: {
    backgroundType: HeroBackgroundType;
    backgroundUrl: string;
  };
  course: {
    title: string;
    description: string;
    highlights: string[];
    features: CourseFeature[];
    nextClass: string;
    price: string;
    priceNote: string;
    extraInfo: string[];
  };
  portfolio: {
    items: Array<{
      title: string;
      style: string;
      image: string;
      specialistId?: string | null;
    }>;
  };
  specialists: {
    items: Array<{
      id?: string;
      name: string;
      specialty: string;
      description: string;
      image: string;
      experience: string;
      instagram: string;
      whatsapp: string;
    }>;
  };
};

export const defaultSiteConfig: SiteConfig = {
  hero: {
    backgroundType: 'image',
    backgroundUrl: '',
  },
  course: {
    title: 'Curso de Tatuagem',
    description: 'Aprenda as técnicas profissionais de tatuagem com os melhores artistas',
    highlights: [],
    features: [],
    nextClass: '',
    price: '',
    priceNote: '',
    extraInfo: [],
  },
  portfolio: {
    items: [],
  },
  specialists: {
    items: [],
  },
};

const UUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UploadItem = {
  id: string;
  filename?: string;
  mimetype?: string;
  url?: string;
};

const normalizeMediaUrl = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('api/uploads/')) {
    return `/${trimmed}`;
  }

  if (UUID_RX.test(trimmed)) {
    return `/api/uploads/${trimmed}`;
  }

  return trimmed;
};

const normalizeFilename = (value: string) => value.trim().toLowerCase();

const extractFilename = (value: string) => {
  const clean = value.split('?')[0].split('#')[0];
  const lastPart = clean.split('/').pop();
  return lastPart ? lastPart.trim() : '';
};

const buildUploadIndex = (uploads: UploadItem[]) => {
  const byFilename = new Map<string, UploadItem>();
  let firstVisual: UploadItem | null = null;

  for (const upload of uploads) {
    if (upload.filename) {
      byFilename.set(normalizeFilename(upload.filename), upload);
    }
    if (!firstVisual && upload.mimetype && /^(image|video)\//i.test(upload.mimetype)) {
      firstVisual = upload;
    }
  }

  return { byFilename, firstVisual };
};

const isLocalMediaUrl = (value: string) =>
  value.startsWith('/') && !value.startsWith('/api/uploads/') && !value.startsWith('/uploads/');

const checkUrlExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

const resolveMediaUrl = (value: unknown, uploadIndex: ReturnType<typeof buildUploadIndex>) => {
  const normalized = normalizeMediaUrl(value);
  if (!normalized) {
    return uploadIndex.firstVisual?.url || '';
  }

  const filename = extractFilename(normalized);
  if (filename) {
    const match = uploadIndex.byFilename.get(normalizeFilename(filename));
    if (match?.url) {
      return match.url;
    }
  }

  return normalized;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const mergeConfig = (base: SiteConfig, partial: Partial<SiteConfig>): SiteConfig => {
  return {
    hero: {
      ...base.hero,
      ...(isRecord(partial.hero) ? partial.hero : {}),
    },
    course: {
      ...base.course,
      ...(isRecord(partial.course) ? partial.course : {}),
    },
    portfolio: {
      items:
        isRecord(partial.portfolio) && Array.isArray(partial.portfolio.items)
          ? partial.portfolio.items
          : base.portfolio.items,
    },
    specialists: {
      items:
        isRecord(partial.specialists) && Array.isArray(partial.specialists.items)
          ? partial.specialists.items
          : base.specialists.items,
    },
  };
};

export const loadSiteConfig = async (): Promise<SiteConfig> => {
  if (typeof window === 'undefined') {
    return defaultSiteConfig;
  }

  try {
    const response = await fetch('/api/site-config');
    if (!response.ok) {
      throw new Error(`Falha ao carregar config (${response.status})`);
    }
    const parsed = (await response.json()) as Partial<SiteConfig>;
    const merged = mergeConfig(defaultSiteConfig, parsed);

    let uploadIndex = buildUploadIndex([]);
    try {
      const uploadsResponse = await fetch('/api/uploads');
      if (uploadsResponse.ok) {
        const uploads = (await uploadsResponse.json()) as UploadItem[];
        uploadIndex = buildUploadIndex(Array.isArray(uploads) ? uploads : []);
      }
    } catch {
      // ignore upload lookup failures
    }

    let resolvedHeroUrl = resolveMediaUrl(merged.hero.backgroundUrl, uploadIndex);
    if (resolvedHeroUrl && isLocalMediaUrl(resolvedHeroUrl)) {
      const exists = await checkUrlExists(resolvedHeroUrl);
      if (!exists && uploadIndex.firstVisual?.url) {
        resolvedHeroUrl = uploadIndex.firstVisual.url;
      }
    }

    merged.hero.backgroundUrl = resolvedHeroUrl;
    if (merged.hero.backgroundUrl) {
      const heroFilename = extractFilename(merged.hero.backgroundUrl);
      if (heroFilename) {
        const match = uploadIndex.byFilename.get(normalizeFilename(heroFilename));
        if (match?.mimetype?.startsWith('video/')) {
          merged.hero.backgroundType = 'video';
        }
        if (match?.mimetype?.startsWith('image/')) {
          merged.hero.backgroundType = 'image';
        }
      }
    }

    if (!merged.hero.backgroundUrl && uploadIndex.firstVisual?.url) {
      merged.hero.backgroundUrl = normalizeMediaUrl(uploadIndex.firstVisual.url);
      if (uploadIndex.firstVisual.mimetype?.startsWith('video/')) {
        merged.hero.backgroundType = 'video';
      }
    }

    const portfolioWithResolved = await Promise.all(
      merged.portfolio.items.map(async (item) => {
        let resolved = resolveMediaUrl(item.image, uploadIndex);
        if (resolved && isLocalMediaUrl(resolved)) {
          const exists = await checkUrlExists(resolved);
          if (!exists && uploadIndex.firstVisual?.url) {
            resolved = uploadIndex.firstVisual.url;
          }
        }
        return { ...item, image: resolved };
      })
    );

    const specialistsWithResolved = await Promise.all(
      merged.specialists.items.map(async (item) => {
        let resolved = resolveMediaUrl(item.image, uploadIndex);
        if (resolved && isLocalMediaUrl(resolved)) {
          const exists = await checkUrlExists(resolved);
          if (!exists && uploadIndex.firstVisual?.url) {
            resolved = uploadIndex.firstVisual.url;
          }
        }
        return { ...item, image: resolved };
      })
    );

    merged.portfolio.items = portfolioWithResolved;
    merged.specialists.items = specialistsWithResolved;

    return merged;
  } catch {
    return defaultSiteConfig;
  }
};

export const saveSiteConfig = async (config: SiteConfig): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  const response = await fetch('/api/site-config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`Falha ao salvar config (${response.status})`);
  }

  const updateStamp = String(Date.now());
  window.localStorage.setItem(SITE_CONFIG_UPDATED_KEY, updateStamp);
  if ('BroadcastChannel' in window) {
    const broadcastChannel = new BroadcastChannel('site-config');
    broadcastChannel.postMessage(updateStamp);
    broadcastChannel.close();
  }
  window.dispatchEvent(new Event('site-config-updated'));
};
