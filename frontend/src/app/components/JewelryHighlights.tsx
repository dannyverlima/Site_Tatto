import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type JewelryItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  imageUrls: string[];
  primaryImageUrl: string;
};

export function JewelryHighlights() {
  const [featured, setFeatured] = useState<JewelryItem[]>([]);
  const [promo, setPromo] = useState<JewelryItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [resFeatured, resAll] = await Promise.all([
          fetch('/api/jewelry?featured=1'),
          fetch('/api/jewelry'),
        ]);
        const dataFeatured = resFeatured.ok ? await resFeatured.json() : [];
        const dataAll = resAll.ok ? await resAll.json() : [];
        if (isMounted) {
          setFeatured(Array.isArray(dataFeatured) ? dataFeatured.slice(0, 2) : []);
          const discounted = (Array.isArray(dataAll) ? dataAll : [])
            .filter((i: JewelryItem) => i.discountPercent > 0)
            .slice(0, 3);
          setPromo(discounted);
        }
      } catch {
        // silent fail
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const allItems = [...featured, ...promo];
  if (allItems.length === 0) return null;

  return (
    <section ref={ref} id="joalheria" className="py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-3">Joalheria</p>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-100 tracking-wide">
            JOIAS EM DESTAQUE
          </h2>
          <p className="text-neutral-400 text-sm mt-3">Peças exclusivas, criadas com arte e dedicação</p>
        </motion.div>

        {featured.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-[0.35em] text-white/35 mb-5">Destaques</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {featured.map((item, index) => (
                <JewelryCard key={`f-${item.id}`} item={item} index={index} isInView={isInView} badge="Destaque" />
              ))}
            </div>
          </>
        )}

        {promo.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-[0.35em] text-white/35 mb-5">Promoções</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promo.map((item, index) => (
                <JewelryCard key={`p-${item.id}`} item={item} index={index} isInView={isInView} badge="Promoção" />
              ))}
            </div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="/joalheria"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all"
          >
            Ir para loja
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function JewelryCard({
  item, index, isInView, badge,
}: {
  item: JewelryItem; index: number; isInView: boolean; badge: string;
}) {
  const finalPrice = item.discountPercent > 0
    ? item.price * (1 - item.discountPercent / 100)
    : item.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      onClick={() => (window.location.href = '/joalheria')}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-lg shadow-black/30 hover:border-white/20 transition-all duration-300"
    >
      {item.discountPercent > 0 && (
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[10px] font-bold uppercase tracking-wide">
          -{Math.round(item.discountPercent)}%
        </div>
      )}
      <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-black/60 border border-white/15 text-white/70 text-[10px] uppercase tracking-widest">
        {badge}
      </div>

      <div className="relative h-52 overflow-hidden bg-black/30">
        {item.primaryImageUrl ? (
          <ImageWithFallback
            src={item.primaryImageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/20 text-xs uppercase tracking-widest">
            Sem foto
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-white text-sm leading-tight">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-neutral-400 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <div>
            {item.discountPercent > 0 ? (
              <>
                <p className="text-[10px] text-neutral-500 line-through">{currency.format(item.price)}</p>
                <p className="text-sm font-bold text-white">{currency.format(finalPrice)}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-white">{currency.format(item.price)}</p>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/30 group-hover:text-white/60 transition">
            Ver loja →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
