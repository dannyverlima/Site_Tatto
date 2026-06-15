import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function RingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const textY = useTransform(scrollYProgress, [0, 0.5], ['30px', '0px']);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.35, 0.75, 0.95], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-black"
      style={{ height: '90vh', minHeight: 520 }}
    >
      {/* Imagem de fundo com parallax suave */}
      <motion.div
        style={{ scale: imgScale }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="/media/Piercing-fim-page.jpg"
          alt="Piercings"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

      {/* Texto centralizado */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-amber-400/70">
          Joalheria Exclusiva
        </span>
        <h2 className="text-4xl font-light tracking-tight text-white md:text-5xl lg:text-6xl">
          Joias que contam
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            a sua história
          </span>
        </h2>
        <p className="max-w-md text-base text-white/50">
          Peças artesanais feitas sob encomenda, para quem valoriza elegância e unicidade.
        </p>
        <motion.a
          href="/joalheria"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 rounded-full border border-amber-400/30 bg-amber-400/5 px-7 py-3 text-sm font-medium tracking-wide text-amber-300 backdrop-blur-sm transition hover:border-amber-400/60 hover:bg-amber-400/10"
        >
          Ver coleção completa →
        </motion.a>
      </motion.div>
    </section>
  );
}
