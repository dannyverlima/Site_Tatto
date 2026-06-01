import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSiteConfig } from '../hooks/useSiteConfig';

export function Portfolio({ specialistId }: { specialistId?: string | null } = {}) {
  const { config } = useSiteConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const allItems = config.portfolio.items;
  const portfolioItems = specialistId ? allItems.filter((it) => it.specialistId === specialistId) : allItems;

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
