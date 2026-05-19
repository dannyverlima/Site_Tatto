import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const catalogItems = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBza2V0Y2h8ZW58MXx8fHwxNzc5MTc5MzcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Flash Tradicional',
    description: 'Desenhos classicos com linhas fortes e cores marcantes.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBsaW5lJTIwYXJ0fGVufDF8fHx8MTc3OTE3OTM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Fine Line',
    description: 'Traços delicados para quem busca sutileza.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBibGFja3dvcmt8ZW58MXx8fHwxNzc5MTc5MzczfDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Blackwork',
    description: 'Sombras profundas e contraste intenso.',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBmbG9yYWx8ZW58MXx8fHwxNzc5MTc5Mzc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Floral Contemporaneo',
    description: 'Composicoes organicas e modernas.',
  },
];

export function Catalog() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="catalogo" ref={ref} className="py-20 px-4 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-4 tracking-wide">
            CATALOGO
          </h2>
          <p className="text-neutral-400 text-lg">
            Selecao rapida de estilos para inspirar sua proxima tattoo
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {catalogItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/60"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
