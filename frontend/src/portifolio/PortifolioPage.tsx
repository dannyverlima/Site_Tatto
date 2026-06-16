import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useSiteConfig } from '../app/hooks/useSiteConfig';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';
import { slugify } from '../app/utils/slugify';

export function PortifolioPage() {
  // Extrai o slug do caminho: /portifolio/markin → "markin"
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const slug = pathParts[1] ?? null; // índice 1: ["portifolio", "markin"]

  const { config, loading } = useSiteConfig();

  const specialist = slug
    ? config.specialists.items.find((s) => slugify(s.name) === slug) ?? null
    : null;

  const items = specialist
    ? config.portfolio.items.filter((it) => String(it.specialistId) === String(specialist.id))
    : config.portfolio.items;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-4 bg-black/90 backdrop-blur-md border-b border-white/10">
        <motion.a
          href="/"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={15} />
          Voltar
        </motion.a>

        {specialist ? (
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Portfólio de</p>
            <h1 className="text-lg font-bold text-white leading-tight">{specialist.name}</h1>
          </div>
        ) : (
          <h1 className="text-lg font-bold text-white">Portfólio Completo</h1>
        )}
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-white/40 py-20">Nenhuma foto no portfólio ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, index) => (
              <motion.div
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg"
              >
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-base font-semibold text-white leading-tight drop-shadow">{item.title}</h3>
                  {item.style ? (
                    <p className="text-sm text-white/70 mt-0.5">{item.style}</p>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
