import { ArrowLeft } from 'lucide-react';
import { Reviews } from './components/Reviews';

export function AvaliacaoPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-2">
        <button
          type="button"
          onClick={() => (window.location.href = '/')}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
        </button>
      </div>
      <Reviews showAll />
    </main>
  );
}
