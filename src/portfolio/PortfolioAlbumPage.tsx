import { ArrowLeft } from 'lucide-react';
import { LoadingScreen } from '../app/components/LoadingScreen';
import { Portfolio } from '../app/components/Portfolio';
import { useSiteConfig } from '../app/hooks/useSiteConfig';
import { slugify } from '../app/utils/slugify';

export function PortfolioAlbumPage() {
  const { config } = useSiteConfig();
  const slug = (window.location.pathname.split('/').filter(Boolean).pop() ?? '').toString();

  const specialist = config.specialists.items.find((item) => slugify(item.name) === slug) ?? null;

  if (!config.specialists.items.length) {
    return <LoadingScreen message="Carregando álbum..." />;
  }

  if (!specialist) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-white/45">Portfólio</p>
          <h1 className="mt-4 text-3xl font-semibold">Álbum não encontrado</h1>
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
      <div className="mx-auto mb-6 flex max-w-7xl items-center justify-between">
        <button
          type="button"
          onClick={() => (window.location.href = `/especialista/${slugify(specialist.name)}`)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <p className="text-xs uppercase tracking-[0.3em] text-white/35">Álbum do especialista</p>
      </div>

      <div className="mx-auto max-w-7xl rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Portfólio</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{specialist.name}</h1>
        <p className="mt-2 text-sm text-white/65">Confira até 5 fotos do álbum deste especialista.</p>
      </div>

      <Portfolio specialistId={specialist.id as any} />
    </main>
  );
}
