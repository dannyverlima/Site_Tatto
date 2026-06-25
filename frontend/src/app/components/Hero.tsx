import { motion, useScroll, useTransform } from 'framer-motion';
const logoImg = '/media/Logo.png';
import { HeroBackground } from './HeroBackground';

export function Hero() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  const goToCoursePage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const targetHref = '/curso.html';
    window.setTimeout(() => {
      window.location.href = targetHref;
    }, 140);
  };

  const goToLocationPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const targetHref = '/localizacao';
    window.setTimeout(() => {
      window.location.href = targetHref;
    }, 140);
  };

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background Image com Opacidade Baixa */}
      <div className="absolute inset-0 z-0">
        <HeroBackground />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Logo e Conteúdo com animação de scroll */}
      <motion.div
        style={{ opacity, scale }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 text-center px-4 mt-10 sm:mt-20 md:mt-32"
      >
        <motion.img
          src={logoImg}
          alt="Studios Tatto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mb-4 sm:mb-6 h-40 sm:h-52 md:h-60 lg:h-80 w-auto"
          style={{ mixBlendMode: 'lighten' }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-base sm:text-xl md:text-2xl text-neutral-300 tracking-wide"
        >
          A qualidade e elegância que seu corpo merece
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.15 }}
          className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          <motion.a
            href="#especialistas"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-full border border-neutral-800 text-neutral-200 text-xs tracking-wide uppercase hover:border-neutral-500 transition-colors"
          >
            Especialistas
          </motion.a>
          <motion.a
            href="/joalheria"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-full border border-neutral-800 text-neutral-200 text-xs tracking-wide uppercase hover:border-neutral-500 transition-colors"
          >
            Joalheria
          </motion.a>
          <motion.a
            href="/curso.html"
            onClick={goToCoursePage}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-full border border-neutral-800 text-neutral-200 text-xs tracking-wide uppercase hover:border-neutral-500 transition-colors"
          >
            Curso
          </motion.a>
          <motion.a
            href="#avaliacoes"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-full border border-neutral-800 text-neutral-200 text-xs tracking-wide uppercase hover:border-neutral-500 transition-colors"
          >
            Avaliações
          </motion.a>
          <motion.a
            href="/localizacao"
            onClick={goToLocationPage}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-full border border-neutral-800 text-neutral-200 text-xs tracking-wide uppercase hover:border-neutral-500 transition-colors"
          >
            Localização
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
