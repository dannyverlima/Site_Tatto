import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Instagram } from 'lucide-react';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { toWhatsappLink } from '../utils/formatters';

export function Specialists() {
  const { config } = useSiteConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const specialists = config.specialists.items;

  return (
    <section id="especialistas" ref={ref} className="py-20 px-4 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-4 tracking-wide">
            ESPECIALISTAS
          </h2>
          <p className="text-neutral-400 text-lg">
            Conheça nosso time de artistas profissionais
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {specialists.map((specialist, index) => {
            const whatsappLink = toWhatsappLink(specialist.whatsapp);
            return (
            <motion.div
              key={`${specialist.name}-${index}`}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="overflow-hidden rounded-lg shadow-xl bg-neutral-800">
                <div className="aspect-[3/4] overflow-hidden">
                  <ImageWithFallback
                    src={specialist.image}
                    alt={specialist.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="p-6 text-neutral-100">
                  <h3 className="text-xl font-bold mb-1">{specialist.name}</h3>
                  <p className="text-neutral-300 text-sm mb-2">{specialist.specialty}</p>
                  <p className="text-neutral-400 text-xs mb-3">{specialist.experience}</p>
                  <div className="flex items-center gap-2 text-neutral-300 text-sm">
                    <Instagram size={16} />
                    <span>{specialist.instagram}</span>
                  </div>
                  {whatsappLink ? (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-full border border-neutral-700 text-xs uppercase tracking-wide hover:border-neutral-400 transition-colors"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
