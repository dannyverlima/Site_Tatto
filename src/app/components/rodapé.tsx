import { motion } from 'motion/react';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-neutral-400 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-neutral-100 mb-4 tracking-wider">
              STUDIOS TATTO
            </h3>
            <p className="text-sm mb-4 max-w-md">
              Transformando ideias em arte permanente. Com mais de 15 anos de experiência, 
              nosso estúdio é referência em qualidade e profissionalismo.
            </p>
            <div className="flex gap-4">
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="bg-neutral-800 p-3 rounded-full hover:bg-neutral-700 transition-colors"
              >
                <Instagram size={20} className="text-neutral-100" />
              </motion.a>
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="bg-neutral-800 p-3 rounded-full hover:bg-neutral-700 transition-colors"
              >
                <Facebook size={20} className="text-neutral-100" />
              </motion.a>
              <motion.a
                href="mailto:contato@studiostatto.com"
                whileHover={{ scale: 1.1 }}
                className="bg-neutral-800 p-3 rounded-full hover:bg-neutral-700 transition-colors"
              >
                <Mail size={20} className="text-neutral-100" />
              </motion.a>
              <motion.a
                href="tel:+351211234567"
                whileHover={{ scale: 1.1 }}
                className="bg-neutral-800 p-3 rounded-full hover:bg-neutral-700 transition-colors"
              >
                <Phone size={20} className="text-neutral-100" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-neutral-100 font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#portfolio" className="hover:text-neutral-100 transition-colors">Portfólio</a></li>
              <li><a href="#especialistas" className="hover:text-neutral-100 transition-colors">Especialistas</a></li>
              <li><a href="#curso" className="hover:text-neutral-100 transition-colors">Curso</a></li>
              <li><a href="#avaliacoes" className="hover:text-neutral-100 transition-colors">Avaliações</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-neutral-100 font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>+351 21 123 4567</li>
              <li>contato@studiostatto.com</li>
              <li>Rua das Artes, 123</li>
              <li>1200-001 Lisboa</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 text-center text-sm">
          <p>© {currentYear} Studios Tatto. Todos os direitos reservados.</p>
          <p className="mt-2 text-xs">
            A qualidade e elegancia que seu corpo merece.
          </p>
        </div>
      </div>
    </footer>
  );
}
