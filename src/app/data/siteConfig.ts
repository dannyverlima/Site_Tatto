export type HeroBackgroundType = 'image' | 'video';

export type CourseFeature = {
  title: string;
  description: string;
};

export type PortfolioItem = {
  title: string;
  style: string;
  image: string;
};

export type SpecialistItem = {
  name: string;
  specialty: string;
  image: string;
  experience: string;
  instagram: string;
  whatsapp: string;
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
    items: PortfolioItem[];
  };
  specialists: {
    items: SpecialistItem[];
  };
};

const STORAGE_KEY = 'site-config-v1';

export const defaultSiteConfig: SiteConfig = {
  hero: {
    backgroundType: 'image',
    backgroundUrl:
      'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBhcnRpc3QlMjBzdHVkaW8lMjBkYXJrfGVufDF8fHx8MTc3OTE3OTM3MXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  course: {
    title: 'CURSO',
    description:
      'Aprenda a arte da tatuagem com profissionais experientes. Do basico ao avancado, formamos os melhores tatuadores do mercado.',
    highlights: [
      'Turmas reduzidas e foco em pratica',
      'Mentoria com profissionais do estudio',
      'Certificado e suporte pos-curso',
    ],
    features: [
      { title: 'Duracao Flexivel', description: 'Cursos de 3 a 6 meses' },
      { title: 'Turmas Pequenas', description: 'Maximo 8 alunos por turma' },
      { title: 'Certificado', description: 'Reconhecido nacionalmente' },
      { title: 'Pratica Intensa', description: 'Mais de 200h de pratica' },
    ],
    nextClass: 'Inscricoes abertas para a turma que inicia em Junho 2026.',
    price: 'R$ 3.500',
    priceNote: 'ou 12x de R$ 350 sem juros',
    extraInfo: [
      'Material completo incluido',
      'Acompanhamento individual',
      'Suporte pos-formacao',
      'Networking com profissionais',
    ],
  },
  portfolio: {
    items: [
      {
        title: 'Manga Completa',
        style: 'Realismo',
        image:
          'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBwb3J0Zm9saW8lMjBzbGVldmV8ZW58MXx8fHwxNzc5MTc5MzcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        title: 'Desenho Geometrico',
        style: 'Blackwork',
        image:
          'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBkZXNpZ24lMjBibGFjayUyMGlua3xlbnwxfHx8fDE3NzkxNzkzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        title: 'Retrato Realista',
        style: 'Realismo',
        image:
          'https://images.unsplash.com/photo-1605647533135-51b5906087d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0YXR0b28lMjBhcnRpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzkxNzkzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        title: 'Arte Oriental',
        style: 'Tradicional Japones',
        image:
          'https://images.unsplash.com/photo-1775135981378-4e7c1767436d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx0YXR0b28lMjBzdHVkaW8lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzkxMzAyOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        title: 'Minimalista',
        style: 'Fine Line',
        image:
          'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx0YXR0b28lMjBhcnRpc3QlMjB3b3JraW5nJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3OTE3OTM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        title: 'Arte Abstrata',
        style: 'Aquarela',
        image:
          'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx0YXR0b28lMjBhcnRpc3QlMjBzdHVkaW8lMjBkYXJrfGVufDF8fHx8MTc3OTE3OTM3MXww&ixlib=rb-4.1.0&q=80&w=1080',
      },
    ],
  },
  specialists: {
    items: [
      {
        name: 'Carlos Silva',
        specialty: 'Realismo',
        image:
          'https://images.unsplash.com/photo-1605647533135-51b5906087d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0YXR0b28lMjBhcnRpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzkxNzkzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        experience: '10+ anos',
        instagram: '@carlostattooist',
        whatsapp: '5527999999999',
      },
      {
        name: 'Ana Rodrigues',
        specialty: 'Fine Line & Minimalista',
        image:
          'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBhcnRpc3QlMjB3b3JraW5nJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3OTE3OTM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        experience: '7+ anos',
        instagram: '@anafinelinetattoo',
        whatsapp: '5527999999999',
      },
      {
        name: 'Bruno Costa',
        specialty: 'Tradicional Japones',
        image:
          'https://images.unsplash.com/photo-1775135981378-4e7c1767436d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBzdHVkaW8lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzkxMzAyOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
        experience: '12+ anos',
        instagram: '@brunoirezumi',
        whatsapp: '5527999999999',
      },
      {
        name: 'Mariana Santos',
        specialty: 'Aquarela & Colorido',
        image:
          'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx0YXR0b28lMjBkZXNpZ24lMjBibGFjayUyMGlua3xlbnwxfHx8fDE3NzkxNzkzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        experience: '8+ anos',
        instagram: '@marianacolorink',
        whatsapp: '5527999999999',
      },
    ],
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

export const loadSiteConfig = (): SiteConfig => {
  if (typeof window === 'undefined') {
    return defaultSiteConfig;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultSiteConfig;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    return mergeConfig(defaultSiteConfig, parsed);
  } catch {
    return defaultSiteConfig;
  }
};

export const saveSiteConfig = (config: SiteConfig) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event('site-config-updated'));
};
