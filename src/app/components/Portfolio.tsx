import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSiteConfig } from '../hooks/useSiteConfig';



const normalizeAlbumValue = (value?: string | null) => (value || '').trim().toLowerCase();

const makeAlbumKey = (item: { specialistId?: string | null; title?: string; style?: string }) => {
  return [String(item.specialistId || ''), normalizeAlbumValue(item.title), normalizeAlbumValue(item.style)].join('||');
};

 016eb84c5535207e708aad46b3b4bd68b33f8c94
export function Portfolio({ specialistId }: { specialistId?: string | null } = {}) {
  const { config } = useSiteConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const allItems = config.portfolio.items;

  const portfolioItems = specialistId ? allItems.filter((it) => it.specialistId === specialistId) : allItems;

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
 016eb84c5535207e708aad46b3b4bd68b33f8c94

  return (
    <section id="portfolio" ref={ref} className="py-20 px-4 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={`${item.title}-${index}`}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-lg shadow-lg bg-neutral-800"
            >
              <div className="aspect-square overflow-hidden">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6"
              >
                <h3 className="text-neutral-100 text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-neutral-300 text-sm">{item.style}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
