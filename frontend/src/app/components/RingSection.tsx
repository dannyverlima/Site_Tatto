import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Ring3DCanvas } from '../../joalheria/Ring3DCanvas';

export function RingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollVal, setScrollVal] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // scroll progress 0→1 conforme a seção passa pela viewport
  const scaleRing = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.3, 1, 1, 1.3]);
  const opacity   = useTransform(scrollYProgress, [0, 0.18, 0.75, 1], [0, 1, 1, 0]);
  const textY     = useTransform(scrollYProgress, [0, 0.4], ['40px', '0px']);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.35, 0.7, 0.9], [0, 1, 1, 0]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1.4, 0.8]);

  // Alimenta o ringVal (rotação via scroll) para o RingModel
  scrollYProgress.on('change', setScrollVal);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-neutral-950 py-24 md:py-36"
    >
      {/* Radial background glow */}
      <motion.div
        style={{ scale: glowScale, opacity }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-[600px] w-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.04) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </motion.div>

      {/* Linha decorativa topo */}
      <div className="mx-auto mb-16 max-w-6xl px-6">
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400/60">
            Joalheria Exclusiva
          </span>
          <h2 className="text-4xl font-light tracking-tight text-white md:text-5xl lg:text-6xl">
            Joias que contam
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              a sua história
            </span>
          </h2>
          <p className="mt-2 max-w-md text-base text-white/50">
            Peças artesanais feitas sob encomenda, para quem valoriza elegância e unicidade.
          </p>
        </motion.div>
      </div>

      {/* Anel 3D com expansão */}
      <motion.div
        style={{ scale: scaleRing, opacity }}
        className="mx-auto flex items-center justify-center"
      >
        <Ring3DCanvas
          scrollProgress={scrollVal}
          size={380}
          fov={34}
          cameraZ={4}
        />
      </motion.div>

      {/* CTA */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="mt-12 flex justify-center"
      >
        <motion.a
          href="/joalheria"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full border border-amber-400/30 bg-amber-400/5 px-7 py-3 text-sm font-medium tracking-wide text-amber-300 backdrop-blur-sm transition hover:border-amber-400/60 hover:bg-amber-400/10"
        >
          Ver coleção completa →
        </motion.a>
      </motion.div>
    </section>
  );
}
