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
    return mergeConfig(defaultSiteConfig, parsed);
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
