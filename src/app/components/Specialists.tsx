import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Instagram, Sparkles } from 'lucide-react';
import { useSpecialists } from '../hooks/useSpecialists';
import { slugify } from '../utils/slugify';

export function Specialists() {
  const { specialists } = useSpecialists();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

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
            const targetHref = `/especialista/${slugify(specialist.name)}`;
            return (
            <motion.div
              key={`${specialist.name}-${index}`}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <button
                type="button"
                onClick={() => {
                  window.location.href = targetHref;
                }}
                className="w-full overflow-hidden rounded-[28px] border border-white/10 bg-neutral-800/90 text-left shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/5"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <ImageWithFallback
                    src={specialist.image ?? specialist.imageUrl ?? ''}
                    alt={specialist.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="p-6 text-neutral-100">
                  <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/55">
                    <Sparkles size={12} />
                    Especialista
                  </p>
                  <h3 className="text-xl font-bold mb-1">{specialist.name}</h3>
                  <p className="text-neutral-300 text-sm mb-2">{specialist.specialty}</p>
                  {specialist.description ? (
                    (() => {
                      try {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = specialist.description;
                        const text = tmp.textContent || tmp.innerText || '';
                        return (
                          <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{text}</p>
                        );
                      } catch (e) {
                        return (
                          <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{specialist.description}</p>
                        );
                      }
                    })()
                  ) : null}
                  <p className="text-neutral-400 text-xs mb-3">{specialist.experience}</p>
                  <div className="flex items-center gap-2 text-neutral-300 text-sm">
                    <Instagram size={16} />
                    <span>{specialist.instagram}</span>
                  </div>
                  <span className="mt-4 inline-flex items-center justify-center rounded-full border border-neutral-700 px-4 py-2 text-xs uppercase tracking-wide transition-colors group-hover:border-neutral-400">
                    Ver detalhes
                  </span>
                </div>
              </button>
            </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center text-sm uppercase tracking-[0.28em] text-neutral-400"
        >
          Clique no especialista para abrir a página completa.
        </motion.p>
      </div>
    </section>
  );
}
