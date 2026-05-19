import { motion, useScroll, useTransform } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-neutral-950">
      {/* Background Image com Opacidade Baixa */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXR0b28lMjBhcnRpc3QlMjBzdHVkaW8lMjBkYXJrfGVufDF8fHx8MTc3OTE3OTM3MXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Tattoo Studio Background"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Logo e Conteúdo com animação de scroll */}
      <motion.div
        style={{ opacity, scale }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 text-center px-4 mt-32"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-6xl md:text-8xl font-bold text-neutral-100 mb-6 tracking-wider"
        >
          STUDIOS TATTO
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-xl md:text-2xl text-neutral-300 tracking-wide"
        >
          Arte na Pele, Memórias para a Vida
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-full border border-neutral-700 text-neutral-100 text-sm tracking-wide uppercase hover:border-neutral-400 transition-colors"
          >
            Instagram
          </motion.a>
          <motion.a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-full border border-neutral-700 text-neutral-100 text-sm tracking-wide uppercase hover:border-neutral-400 transition-colors"
          >
            WhatsApp
          </motion.a>
          <motion.a
            href="#catalogo"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-full bg-neutral-100 text-neutral-900 text-sm tracking-wide uppercase hover:bg-white transition-colors"
          >
            Catalogo
          </motion.a>
          <motion.a
            href="#localizacao"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-full border border-neutral-700 text-neutral-100 text-sm tracking-wide uppercase hover:border-neutral-400 transition-colors"
          >
            Localizacao
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
