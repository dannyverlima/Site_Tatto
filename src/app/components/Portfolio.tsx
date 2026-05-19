import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const portfolioItems = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBwb3J0Zm9saW8lMjBzbGVldmV8ZW58MXx8fHwxNzc5MTc5MzcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Manga Completa',
    style: 'Realismo',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBkZXNpZ24lMjBibGFjayUyMGlua3xlbnwxfHx8fDE3NzkxNzkzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Desenho Geométrico',
    style: 'Blackwork',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1605647533135-51b5906087d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0YXR0b28lMjBhcnRpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzkxNzkzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Retrato Realista',
    style: 'Realismo',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1775135981378-4e7c1767436d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBzdHVkaW8lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzkxMzAyOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Arte Oriental',
    style: 'Tradicional Japonês',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBhcnRpc3QlMjB3b3JraW5nJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3OTE3OTM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Minimalista',
    style: 'Fine Line',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBhcnRpc3QlMjBzdHVkaW8lMjBkYXJrfGVufDF8fHx8MTc3OTE3OTM3MXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Arte Abstrata',
    style: 'Aquarela',
  },
];

export function Portfolio() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

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
            PORTFÓLIO
          </h2>
          <p className="text-neutral-400 text-lg">
            Conheça alguns dos nossos trabalhos mais marcantes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
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
