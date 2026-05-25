import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import logoImg from '../../imports/Logo.png';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [ctaLink, setCtaLink] = useState<{ label: string; href: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCta = async () => {
      try {
        const response = await fetch('/api/site-links?placement=cta');
        if (!response.ok) {
          throw new Error('Falha ao carregar CTA');
        }
        const data = (await response.json()) as Array<{ label: string; href: string }>;
        if (isMounted) {
          setCtaLink(data[0] || null);
        }
      } catch (error) {
        console.error('Erro ao carregar CTA', error);
      }
    };

    loadCta();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCtaClick = () => {
    if (!ctaLink) {
      return;
    }
    if (ctaLink.href.startsWith('#')) {
      scrollToSection(ctaLink.href);
    } else {
      window.setTimeout(() => {
        window.open(ctaLink.href, '_blank');
      }, 140);
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
          <div className="flex items-center justify-between pt-4 pb-4">
            <motion.button
              onClick={() => scrollToSection('#home')}
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <img
                src={logoImg}
                alt="Studios Tatto Logo"
                className="h-16 w-auto object-contain"
                style={{ mixBlendMode: 'lighten' }}
              />
            </motion.button>

            {ctaLink ? (
              <motion.button
                onClick={handleCtaClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2 rounded-full border border-neutral-700 text-neutral-100 text-xs tracking-wide uppercase hover:border-neutral-400 transition-colors"
              >
                {ctaLink.label}
              </motion.button>
            ) : null}
          </div>
        </div>
      </motion.nav>
    </>
  );
}
