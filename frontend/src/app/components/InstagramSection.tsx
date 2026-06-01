import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Instagram, ExternalLink } from 'lucide-react';

export function InstagramSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const instagramPosts = [
    { id: 1, likes: '2.5k', comments: '120' },
    { id: 2, likes: '3.1k', comments: '205' },
    { id: 3, likes: '1.9k', comments: '89' },
    { id: 4, likes: '4.2k', comments: '310' },
  ];

  return (
    <section id="instagram" ref={ref} className="py-20 px-4 bg-neutral-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram size={48} className="text-neutral-100" />
            <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 tracking-wide">
              Instragram
            </h2>
          </div>
          <p className="text-neutral-400 text-lg mb-6">
            Acompanhe nosso trabalho diário nas redes sociais
          </p>
          <motion.a
            href="https://instagram.com/studiostatto"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-neutral-100 rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
          >
            <span>@studiostatto</span>
            <ExternalLink size={20} />
          </motion.a>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {instagramPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="aspect-square bg-neutral-700 rounded-lg overflow-hidden cursor-pointer relative group"
            >
              <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                <Instagram size={48} className="text-neutral-600" />
              </div>
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">❤️</span>
                  <span className="font-semibold">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  <span className="font-semibold">{post.comments}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-neutral-400 text-sm">
            Siga-nos para ver mais de nossos trabalhos e promoções exclusivas
          </p>
        </motion.div>
      </div>
    </section>
  );
}
