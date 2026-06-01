
import { motion } from 'motion/react';

import { motion } from 'framer-motion';
 016eb84c5535207e708aad46b3b4bd68b33f8c94
import { ArrowLeft, Instagram, MessageCircle } from 'lucide-react';
import { LoadingScreen } from '../app/components/LoadingScreen';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';
import { toWhatsappLink } from '../app/utils/formatters';
import { normalizeHtml } from '../app/utils/html';
import { slugify } from '../app/utils/slugify';
import { useSpecialists } from '../app/hooks/useSpecialists';
import { Portfolio } from '../app/components/Portfolio';

export function SpecialistPage() {
  const { specialists, loading } = useSpecialists();
  // extrai o último segmento da URL, por exemplo '/especialista/markin' -> 'markin'
  const slug = (window.location.pathname.split('/').filter(Boolean).pop() ?? '').toString();
  const specialist =
    specialists.find((item) => slugify(item.name) === slug) ?? specialists[0] ?? null;

  if (loading) {
    return <LoadingScreen message="Carregando perfil..." />;
  }

  if (!specialist) {
    return (
      <div className="min-h-screen bg-neutral-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-white/45">Especialista</p>
          <h1 className="mt-4 text-3xl font-semibold">Perfil não encontrado</h1>
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a home
          </button>
        </div>
      </div>
    );
  }

  const whatsappLink = toWhatsappLink(specialist.whatsapp);
  const instagramLink = specialist.instagram
    ? specialist.instagram.startsWith('http')
      ? specialist.instagram
      : `https://instagram.com/${specialist.instagram.replace('@', '')}`
    : '';

  const descriptionHtml = normalizeHtml(specialist.description?.trim() ?? '');

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_34%),linear-gradient(180deg,_#111111,_#050505)] px-4 py-6 text-white">
      <div className="mx-auto mb-6 flex max-w-7xl items-center justify-between">
        <button
          type="button"
          onClick={() => (window.location.href = '/')}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <p className="text-xs uppercase tracking-[0.3em] text-white/35">Especialista</p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mx-auto grid max-w-7xl overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.10),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(0,0,0,0.88))] shadow-2xl shadow-black/50 backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="relative min-h-[520px] bg-black/40">
          <ImageWithFallback src={specialist.image ?? specialist.imageUrl ?? ''} alt={specialist.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Especialista selecionado</p>
            <h1 className="mt-2 text-4xl font-bold md:text-5xl">{specialist.name}</h1>
            <p className="mt-2 text-sm text-white/75">{specialist.specialty}</p>
          </div>
        </div>

        <div className="p-6 md:p-8 lg:p-10">
          <div className="mb-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              {specialist.experience || 'Experiência não informada'}
            </span>
            {specialist.instagram ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
                <Instagram size={15} />
                {specialist.instagram}
              </span>
            ) : null}
          </div>

          {/* Descrição removida conforme solicitado */}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {instagramLink ? (
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                <Instagram size={16} />
                Instagram
              </a>
            ) : null}

            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            ) : null}
          </div>

          {/* Botão Portfólio centralizado abaixo do Instagram/WhatsApp */}
          <div className="mt-4 flex justify-center">
            <a

              href={`/especialista/${slug}/portfolio`}

              href={`/portifolio/${slug}`}
 016eb84c5535207e708aad46b3b4bd68b33f8c94
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Portfólio
            </a>
          </div>

        </div>
      </motion.section>

      {/* Se a URL terminar com /portfolio, renderiza o portfólio filtrado pelo especialista */}
      {window.location.pathname.endsWith('/portfolio') ? (
        <div className="mt-8">
          <Portfolio specialistId={specialist.id as any} />
        </div>
      ) : null}
    </main>
  );
}
