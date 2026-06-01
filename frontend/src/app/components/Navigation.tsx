import { motion } from 'framer-motion';
import logoImg from '../../imports/Logo.png';

export function Navigation() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center pt-3 pb-3">
            <motion.button
              onClick={() => scrollToSection('#home')}
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <img
                src={logoImg}
                alt="Studios Tatto Logo"
                className="h-10 w-auto object-contain"
                style={{ mixBlendMode: 'lighten' }}
              />
            </motion.button>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
