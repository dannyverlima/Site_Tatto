import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import logoImg from '../../imports/Logo.jpeg';

const navItems = [
  { name: 'Contate-nos', href: '#contato' },
  { name: 'Catalogo', href: '#catalogo' },
  { name: 'Portfólio', href: '#portfolio' },
  { name: 'Especialistas', href: '#especialistas' },
  { name: 'Instagram', href: '#instagram' },
  { name: 'Curso', href: '#curso' },
  { name: 'Avaliações', href: '#avaliacoes' },
  { name: 'Localização', href: '#localizacao' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-neutral-900/98 backdrop-blur-sm shadow-lg' : 'bg-neutral-900/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo e Slogan */}
          <div className="flex flex-col items-center pt-4 pb-2">
            <motion.button
              onClick={() => scrollToSection('#home')}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center"
            >
              <img
                src={logoImg}
                alt="Studios Tatto Logo"
                className="h-24 w-auto object-contain"
                style={{ mixBlendMode: 'lighten' }}
              />
              <p className="text-neutral-400 text-sm mt-1 tracking-wide">Arte na Pele, Memórias para a Vida</p>
            </motion.button>
          </div>

          {/* Desktop Menu - Abaixo da Logo */}
          <div className="hidden md:flex items-center justify-center gap-8 pb-4 pt-2">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-neutral-300 hover:text-neutral-100 transition-colors duration-200 text-sm tracking-wide"
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden absolute top-6 right-4 text-neutral-100 p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 bg-neutral-900 md:hidden"
        >
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-neutral-100 text-2xl hover:text-neutral-400 transition-colors duration-200"
              >
                {item.name}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}
