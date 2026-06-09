import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GraduationCap, Clock, Users, Award, ArrowRight } from 'lucide-react';
import { useSiteConfig } from '../hooks/useSiteConfig';
import cursoBg from '../../imports/curso-bg.png';

const featureIcons = [Clock, Users, Award, GraduationCap];

export function Course() {
  const { config } = useSiteConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef(null);
  const isInView = useInView(contentRef, { once: true, amount: 0.15 });
  const { course } = config;

  const hasFeatures = course.features.length > 0;
  const hasHighlights = course.highlights.length > 0;
  const hasPricing = Boolean(course.price || course.priceNote || course.nextClass);

  /* ── Parallax: scroll relativo à seção ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  /* Imagem se move mais devagar → efeito parallax */
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  /* Título surge com um leve zoom */
  const titleScale = useTransform(scrollYProgress, [0, 0.35], [0.88, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section
      id="curso"
      ref={sectionRef}
      className="relative overflow-hidden bg-black"
    >
      {/* ── FUNDO COM PARALLAX ── */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: bgY }}
      >
        <img
          src={cursoBg}
          alt=""
          aria-hidden
          className="h-[120%] w-full object-cover object-center"
        />
        {/* Overlay: escurece bordas, deixa centro mais transparente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/85" />
      </motion.div>

      {/* ── CONTEÚDO ── */}
      <div ref={contentRef} className="relative z-10 px-4 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">

          {/* TÍTULO IMPACTANTE */}
          <motion.div
            style={{ scale: titleScale, opacity: titleOpacity }}
            className="mb-16 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-white/60 backdrop-blur-sm"
            >
              <GraduationCap size={13} />
              Studios Tatto
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[clamp(4rem,12vw,9rem)] font-black leading-none tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
            >
              CURSO DE
            </motion.h2>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-[clamp(3rem,9vw,7rem)] font-black leading-none tracking-tight text-white/90 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
            >
              TATUAGEM
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto mt-5 max-w-lg text-base text-white/55 md:text-lg"
            >
              {course.description || 'Aprenda as técnicas profissionais de tatuagem com os melhores artistas'}
            </motion.p>
          </motion.div>

          {/* FEATURES */}
          {hasFeatures && (
            <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {course.features.map((feature, index) => {
                const Icon = featureIcons[index % featureIcons.length];
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.55, delay: 0.3 + index * 0.08 }}
                    className="rounded-2xl border border-white/10 bg-black/40 p-6 text-center backdrop-blur-md"
                  >
                    <Icon className="mx-auto mb-3 h-9 w-9 text-white/70" />
                    <h3 className="mb-1 text-base font-bold text-white">{feature.title}</h3>
                    <p className="text-xs text-white/50">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* INFO + PREÇO */}
          {(hasHighlights || hasPricing) && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.5 }}
              className="grid gap-8 rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl md:grid-cols-2 md:p-12"
            >
              {/* Destaques */}
              {hasHighlights && (
                <div>
                  <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-white/40">
                    O que você vai aprender
                  </p>
                  <ul className="space-y-2.5">
                    {course.highlights.map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -12 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.4, delay: 0.55 + i * 0.07 }}
                        className="flex items-start gap-2.5 text-sm text-white/75"
                      >
                        <span className="mt-0.5 text-emerald-400">✓</span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Inscrição */}
              {hasPricing && (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-white/40">
                    Inscrições
                  </p>
                  {course.price && (
                    <p className="mb-1 text-5xl font-black text-white">{course.price}</p>
                  )}
                  {course.priceNote && (
                    <p className="mb-1 text-sm text-white/50">{course.priceNote}</p>
                  )}
                  {course.nextClass && (
                    <p className="mb-6 text-xs text-white/35">{course.nextClass}</p>
                  )}
                  <motion.a
                    href="/curso.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition-shadow hover:shadow-[0_8px_40px_rgba(255,255,255,0.3)]"
                  >
                    Quero me inscrever
                    <ArrowRight size={15} />
                  </motion.a>
                </div>
              )}

              {/* Fallback: só botão quando não tem preço nem destaques separados */}
              {!hasPricing && !hasHighlights && (
                <div className="flex items-center justify-center md:col-span-2">
                  <motion.a
                    href="/curso.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black"
                  >
                    Ver detalhes do curso
                    <ArrowRight size={15} />
                  </motion.a>
                </div>
              )}
            </motion.div>
          )}

          {/* Botão isolado quando não há card de info */}
          {!hasHighlights && !hasPricing && (
            <div className="mt-10 text-center">
              <motion.a
                href="/curso.html"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black"
              >
                Saiba mais
                <ArrowRight size={15} />
              </motion.a>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
