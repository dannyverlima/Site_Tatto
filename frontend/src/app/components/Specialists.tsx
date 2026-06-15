import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Instagram, MessageCircle, Sparkles, X, Briefcase } from 'lucide-react';
import { useSpecialists, SpecialistRecord } from '../hooks/useSpecialists';
import { toWhatsappLink } from '../utils/formatters';
import { normalizeHtml } from '../utils/html';
import { slugify } from '../utils/slugify';

const spring = { type: 'spring', stiffness: 380, damping: 18 } as const;

function extractInstagramHandle(instagram: string | undefined): string {
  if (!instagram) return '';
  if (instagram.includes('instagram.com/')) {
    const handle = instagram.split('instagram.com/')[1]?.split('/')[0]?.split('?')[0] ?? '';
    return handle ? `@${handle}` : '';
  }
  return instagram.startsWith('@') ? instagram : `@${instagram}`;
}

function buildInstagramLink(instagram: string | undefined): string {
  if (!instagram) return '';
  if (instagram.startsWith('http')) return instagram;
  return `https://instagram.com/${instagram.replace('@', '')}`;
}

function buildWhatsappLink(whatsapp: string | undefined): string {
  if (!whatsapp) return '';
  if (whatsapp.startsWith('http')) return whatsapp;
  const digits = whatsapp.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

/* ─── Botão reutilizável com animação ─── */
function Btn({
  href,
  onClick,
  variant = 'secondary',
  children,
  className = '',
}: {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors select-none cursor-pointer';
  const styles =
    variant === 'primary'
      ? 'bg-white text-black hover:bg-neutral-200'
      : 'border border-white/15 bg-white/5 text-white hover:bg-white/10';

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={spring}
        className={`${base} ${styles} ${className}`}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={spring}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* ─── Modal com foto grande à esquerda ─── */
function SpecialistModal({
  specialist,
  onClose,
}: {
  specialist: SpecialistRecord;
  onClose: () => void;
}) {
  const slug = slugify(specialist.name);
  const whatsappLink = buildWhatsappLink(specialist.whatsapp);
  const instaLink = buildInstagramLink(specialist.instagram);
  const instaHandle = extractInstagramHandle(specialist.instagram);
  const descriptionHtml = normalizeHtml(specialist.description?.trim() ?? '');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[32px] border border-white/10 bg-[#111] shadow-2xl shadow-black/60 grid lg:grid-cols-[0.9fr_1.1fr]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Fechar ── */}
        <motion.button
          type="button"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={spring}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/70 backdrop-blur-sm hover:bg-white/10 hover:text-white"
        >
          <X size={17} />
        </motion.button>

        {/* ── Foto ── */}
        <div className="relative min-h-[220px] sm:min-h-[280px] lg:min-h-[520px]">
          <ImageWithFallback
            src={specialist.image ?? specialist.imageUrl ?? ''}
            alt={specialist.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mb-1">
              Especialista
            </p>
            <h2 className="text-2xl font-bold text-white leading-tight">{specialist.name}</h2>
            <p className="mt-1 text-sm text-white/70">{specialist.specialty}</p>
          </div>
        </div>

        {/* ── Conteúdo ── */}
        <div className="flex flex-col overflow-y-auto p-7 lg:p-9">
          {/* badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {specialist.experience ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70">
                {specialist.experience}
              </span>
            ) : null}
            {instaHandle ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70">
                <Instagram size={13} />
                {instaHandle}
              </span>
            ) : null}
          </div>

          {/* descrição */}
          {descriptionHtml ? (
            <div
              className="mb-8 text-sm text-neutral-300 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : null}

          {/* botões sofisticados */}
          <div className="mt-auto space-y-3">
            {/* linha 1: Instagram + WhatsApp */}
            <div className="grid grid-cols-2 gap-3">
              {/* Instagram — gradiente roxo/rosa */}
              <motion.a
                href={instaLink || '#'}
                target={instaLink ? '_blank' : undefined}
                rel="noopener noreferrer"
                whileHover={instaLink ? { scale: 1.03, y: -2 } : {}}
                whileTap={instaLink ? { scale: 0.97 } : {}}
                transition={spring}
                className={`
                  relative group overflow-hidden flex items-center justify-center gap-2
                  rounded-2xl px-5 py-3.5 text-sm font-semibold text-white
                  ${instaLink ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                `}
                style={{
                  background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
                  boxShadow: instaLink ? '0 4px 24px rgba(131,58,180,0.35)' : 'none',
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, #9b4dca 0%, #ff3b3b 50%, #ffd166 100%)' }}
                />
                <span className="relative flex items-center gap-2">
                  <Instagram size={16} />
                  Instagram
                </span>
              </motion.a>

              {/* WhatsApp — gradiente verde */}
              <motion.a
                href={whatsappLink || '#'}
                target={whatsappLink ? '_blank' : undefined}
                rel="noopener noreferrer"
                whileHover={whatsappLink ? { scale: 1.03, y: -2 } : {}}
                whileTap={whatsappLink ? { scale: 0.97 } : {}}
                transition={spring}
                className={`
                  relative group overflow-hidden flex items-center justify-center gap-2
                  rounded-2xl px-5 py-3.5 text-sm font-semibold text-white
                  ${whatsappLink ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                `}
                style={{
                  background: 'linear-gradient(135deg, #128c7e 0%, #25d366 100%)',
                  boxShadow: whatsappLink ? '0 4px 24px rgba(37,211,102,0.30)' : 'none',
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, #1a9e8f 0%, #2eea71 100%)' }}
                />
                <span className="relative flex items-center gap-2">
                  <MessageCircle size={16} />
                  WhatsApp
                </span>
              </motion.a>
            </div>

            {/* linha 2: Portfólio — fullwidth elegante */}
            <motion.a
              href={`/portifolio/${slug}`}
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.985 }}
              transition={spring}
              className="relative group overflow-hidden flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
              <span className="relative flex items-center gap-2">
                <Briefcase size={15} />
                Ver Portfólio
              </span>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Seção principal ─── */
export function Specialists() {
  const { specialists } = useSpecialists();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [selected, setSelected] = useState<SpecialistRecord | null>(null);

  const colClass =
    specialists.length === 1
      ? 'grid-cols-1 max-w-sm mx-auto'
      : specialists.length === 2
      ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
      : specialists.length === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section id="especialistas" ref={ref} className="py-14 md:py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-neutral-100 mb-4 tracking-wide">
            ESPECIALISTAS
          </h2>
          <p className="text-neutral-400 text-lg">
            Conheça nosso time de artistas profissionais
          </p>
        </motion.div>

        <div className={`grid gap-4 sm:gap-6 ${colClass}`}>
          {specialists.map((specialist, index) => {
            const handle = extractInstagramHandle(specialist.instagram);
            return (
              <motion.div
                key={specialist.id ?? `${specialist.name}-${index}`}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.55, delay: index * 0.12 }}
                className="group flex"
              >
                <motion.button
                  type="button"
                  onClick={() => setSelected(specialist)}
                  whileHover={{ y: -4 }}
                  transition={spring}
                  className="w-full flex flex-col overflow-hidden rounded-[24px] border border-white/10 bg-neutral-900 text-left shadow-xl hover:border-white/20 hover:shadow-2xl"
                >
                  {/* imagem proporção fixa */}
                  <div className="aspect-[3/4] w-full overflow-hidden">
                    <motion.div
                      className="h-full w-full"
                      whileHover={{ scale: 1.07 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <ImageWithFallback
                        src={specialist.image ?? specialist.imageUrl ?? ''}
                        alt={specialist.name}
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  </div>

                  {/* info — flex-1 para todos os cards terem o mesmo tamanho */}
                  <div className="flex flex-1 flex-col p-5 text-neutral-100">
                    <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
                      <Sparkles size={11} />
                      Especialista
                    </p>
                    <h3 className="text-lg font-bold leading-snug mb-0.5 line-clamp-2">{specialist.name}</h3>
                    <p className="text-neutral-400 text-sm mb-1 line-clamp-1">{specialist.specialty}</p>
                    <p className="text-neutral-500 text-xs mb-3">{specialist.experience ?? ' '}</p>
                    {/* links rápidos nas cartas */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {handle ? (
                        <motion.a
                          href={buildInstagramLink(specialist.instagram)}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.06, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          transition={spring}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
                          style={{
                            background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
                            boxShadow: '0 2px 12px rgba(131,58,180,0.3)',
                          }}
                        >
                          <Instagram size={11} />
                          {handle}
                        </motion.a>
                      ) : null}
                      {buildWhatsappLink(specialist.whatsapp) ? (
                        <motion.a
                          href={buildWhatsappLink(specialist.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.06, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          transition={spring}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
                          style={{
                            background: 'linear-gradient(135deg,#128c7e,#25d366)',
                            boxShadow: '0 2px 12px rgba(37,211,102,0.25)',
                          }}
                        >
                          <MessageCircle size={11} />
                          WhatsApp
                        </motion.a>
                      ) : null}
                    </div>
                    {/* "Ver detalhes" sempre no fundo */}
                    <div className="mt-auto">
                      <span className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-wide text-white/60 transition-colors group-hover:border-white/35 group-hover:text-white/90">
                        Ver detalhes
                      </span>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center text-xs uppercase tracking-[0.28em] text-neutral-600"
        >
          Clique para ver mais detalhes
        </motion.p>
      </div>

      <AnimatePresence>
        {selected ? (
          <SpecialistModal specialist={selected} onClose={() => setSelected(null)} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
