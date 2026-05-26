import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { slugify } from '../utils/slugify';

const normalizeAlbumValue = (value?: string | null) => (value || '').trim().toLowerCase();

const makeAlbumKey = (item: { specialistId?: string | null; title?: string; style?: string }) => {
  return [String(item.specialistId || ''), normalizeAlbumValue(item.title), normalizeAlbumValue(item.style)].join('||');
};

export function Portfolio({ specialistId }: { specialistId?: string | null } = {}) {
  const { config } = useSiteConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const allItems = config.portfolio.items;
  const specialistsById = new Map(
    config.specialists.items
      .filter((specialist) => Boolean(specialist.id))
      .map((specialist) => [String(specialist.id), specialist])
  );

  const portfolioItems = specialistId
    ? allItems.filter((it) => String(it.specialistId) === String(specialistId))
    : allItems;

  const groupedBySpecialist = new Map<string, typeof portfolioItems>();
  for (const item of portfolioItems) {
    const key = makeAlbumKey(item);
    if (!groupedBySpecialist.has(key)) {
      groupedBySpecialist.set(key, []);
    }
    groupedBySpecialist.get(key)!.push(item);
  }

  const albums = Array.from(groupedBySpecialist.entries())
    .map(([key, items]) => {
      const first = items[0];
      const specialist = specialistsById.get(String(first.specialistId));
      return {
        key,
        title: first.title,
        description: first.style,
        coverImage: first.image,
        specialistId: first.specialistId,
        specialistName: specialist?.name || 'Especialista',
        specialistSlug: specialist ? slugify(specialist.name) : '',
        photos: items.slice(0, 5),
      };
    })
    .filter((album) => Boolean(album.coverImage));

  const albumsToRender = albums.filter((album) => album.specialistId).slice(0, 12);
  const photosToRender = albums.flatMap((album) => album.photos).slice(0, 20);

  return (
    <section id="portfolio" ref={ref} className="py-20 px-4 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        {!specialistId ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-4 tracking-wide">
              PORTFOLIO
            </h2>
            <p className="text-neutral-400 text-lg">
              Conheca alguns dos nossos trabalhos mais marcantes
            </p>
          </motion.div>
        ) : null}

        {specialistId ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photosToRender.map((item, index) => {
              return (
                <motion.div
                  key={`${item.title}-${index}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="group relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-neutral-800 shadow-lg shadow-black/20"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.12)_35%,rgba(0,0,0,0.78)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <div className="space-y-2 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
                      <h3 className="text-lg font-semibold leading-tight md:text-xl">{item.title}</h3>
                      <p className="text-sm text-white/80">{item.style}</p>
                      <p className="text-xs text-white/65">Foto do álbum</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albumsToRender.map((album, index) => {
              return (
                <motion.div
                  key={`${album.key}-${index}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-neutral-800 shadow-lg shadow-black/20"
                  onClick={() => {
                    if (album.specialistSlug) {
                      window.location.href = `/portifolio/${album.specialistSlug}`;
                    }
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <ImageWithFallback
                      src={album.coverImage}
                      alt={album.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.12)_35%,rgba(0,0,0,0.78)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <div className="space-y-2 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">{album.specialistName}</p>
                      <h3 className="text-lg font-semibold leading-tight md:text-xl">{album.title}</h3>
                      <p className="text-sm text-white/80">{album.description}</p>
                      <p className="text-xs text-white/65">Clique para abrir o álbum completo</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
