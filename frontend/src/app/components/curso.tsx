import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GraduationCap, Clock, Users, Award } from 'lucide-react';
import { useSiteConfig } from '../hooks/useSiteConfig';

const featureIcons = [Clock, Users, Award, GraduationCap];

export function Course() {
  const { config } = useSiteConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { course } = config;
  const hasFeatures = course.features.length > 0;
  const hasHighlights = course.highlights.length > 0;
  const hasPricing = Boolean(course.price || course.priceNote || course.nextClass);
  const hasDescription = Boolean(course.description);

  return (
    <section id="curso" ref={ref} className="py-20 px-4 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap size={48} className="text-neutral-100" />
            <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 tracking-wide">
              CURSO
            </h2>
          </div>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            {course.description}
          </p>
        </motion.div>

        {hasFeatures ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {course.features.map((feature, index) => {
              const Icon = featureIcons[index % featureIcons.length];
              return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-neutral-800 p-8 rounded-lg text-center hover:bg-neutral-700 transition-colors duration-300"
              >
                <Icon className="w-12 h-12 text-neutral-100 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-neutral-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
              );
            })}
          </div>
        ) : null}

        {(hasDescription || hasHighlights || hasPricing) ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-neutral-800 rounded-2xl p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-neutral-100 mb-4">
                  Informacoes do Curso
                </h3>
                {hasDescription ? (
                  <p className="text-neutral-300 mb-6 text-lg">
                    {course.description}
                  </p>
                ) : null}
                {hasHighlights ? (
                  <ul className="space-y-3 text-neutral-400 mb-8">
                    {course.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {hasPricing ? (
                <div className="bg-neutral-700 rounded-xl p-8 text-center">
                  <p className="text-neutral-100 text-xl font-semibold mb-3">
                    Inscricoes e detalhes
                  </p>
                  <div className="mb-6">
                    {course.price ? (
                      <div className="text-4xl font-bold text-neutral-100">
                        {course.price}
                      </div>
                    ) : null}
                    {course.priceNote ? (
                      <p className="text-neutral-400 text-sm">{course.priceNote}</p>
                    ) : null}
                    {course.nextClass ? (
                      <p className="text-neutral-500 text-xs mt-2">{course.nextClass}</p>
                    ) : null}
                  </div>
                  <motion.a
                    href="/curso.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center px-8 py-4 bg-neutral-100 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-200 transition-colors duration-300"
                  >
                    Abrir pagina de inscricao
                  </motion.a>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
