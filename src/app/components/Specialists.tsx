import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Instagram } from 'lucide-react';

const specialists = [
  {
    id: 1,
    name: 'Carlos Silva',
    specialty: 'Realismo',
    image: 'https://images.unsplash.com/photo-1605647533135-51b5906087d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0YXR0b28lMjBhcnRpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzkxNzkzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '10+ anos',
    instagram: '@carlostattooist',
  },
  {
    id: 2,
    name: 'Ana Rodrigues',
    specialty: 'Fine Line & Minimalista',
    image: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBhcnRpc3QlMjB3b3JraW5nJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3OTE3OTM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '7+ anos',
    instagram: '@anafinelinetattoo',
  },
  {
    id: 3,
    name: 'Bruno Costa',
    specialty: 'Tradicional Japonês',
    image: 'https://images.unsplash.com/photo-1775135981378-4e7c1767436d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBzdHVkaW8lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzkxMzAyOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '12+ anos',
    instagram: '@brunoirezumi',
  },
  {
    id: 4,
    name: 'Mariana Santos',
    specialty: 'Aquarela & Colorido',
    image: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBkZXNpZ24lMjBibGFjayUyMGlua3xlbnwxfHx8fDE3NzkxNzkzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '8+ anos',
    instagram: '@marianacolorink',
  },
];

export function Specialists() {
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
          {specialists.map((specialist, index) => (
            <motion.div
              key={specialist.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg shadow-xl bg-neutral-800">
                <div className="aspect-[3/4] overflow-hidden">
                  <ImageWithFallback
                    src={specialist.image}
                    alt={specialist.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-neutral-100">
                  <h3 className="text-xl font-bold mb-1">{specialist.name}</h3>
                  <p className="text-neutral-300 text-sm mb-2">{specialist.specialty}</p>
                  <p className="text-neutral-400 text-xs mb-3">{specialist.experience}</p>
                  <div className="flex items-center gap-2 text-neutral-300 text-sm">
                    <Instagram size={16} />
                    <span>{specialist.instagram}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
