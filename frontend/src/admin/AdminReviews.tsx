import { useEffect, useState } from 'react';
import { Star, Check, X, Trash2, Clock } from 'lucide-react';
import { getAdminToken } from './adminAuth';

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published' | 'rejected';
  submittedAt: string;
  displayDate: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  published: 'Publicada',
  rejected: 'Rejeitada',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  published: 'bg-green-500/15 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}
        />
      ))}
    </span>
  );
}

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('pending');

  const token = getAdminToken();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setReviews(await res.json());
    } catch {
      setError('Não foi possível carregar as avaliações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Apagar esta avaliação permanentemente?')) return;
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);
  const pending = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        {(['all', 'pending', 'published', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f
                ? 'bg-white text-black border-white'
                : 'border-white/15 text-white/60 hover:text-white hover:border-white/30'
            }`}
          >
            {f === 'all' ? 'Todas' : STATUS_LABEL[f]}
            {f === 'pending' && pending > 0 ? (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] text-black font-bold">
                {pending}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/50 text-sm">Carregando...</p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/40 text-sm">Nenhuma avaliação {filter !== 'all' ? STATUS_LABEL[filter].toLowerCase() : ''}.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
            >
              {/* Cabeçalho */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{review.name}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${STATUS_COLOR[review.status]}`}>
                      {review.status === 'pending' && <Clock size={9} />}
                      {review.status === 'published' && <Check size={9} />}
                      {review.status === 'rejected' && <X size={9} />}
                      {STATUS_LABEL[review.status]}
                    </span>
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                <span className="text-white/30 text-[11px] shrink-0">
                  {review.submittedAt ? new Date(review.submittedAt).toLocaleDateString('pt-BR') : '—'}
                </span>
              </div>

              {/* Comentário */}
              <p className="text-white/70 text-sm leading-relaxed italic">"{review.comment}"</p>

              {/* Ações */}
              <div className="flex gap-2 pt-1">
                {review.status !== 'published' && (
                  <button
                    onClick={() => updateStatus(review.id, 'published')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 text-xs hover:bg-green-600/30 transition-colors"
                  >
                    <Check size={12} /> Publicar
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(review.id, 'rejected')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 text-xs hover:bg-red-600/30 transition-colors"
                  >
                    <X size={12} /> Rejeitar
                  </button>
                )}
                {review.status === 'published' && (
                  <button
                    onClick={() => updateStatus(review.id, 'pending')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 text-xs hover:bg-yellow-600/30 transition-colors"
                  >
                    <Clock size={12} /> Despublicar
                  </button>
                )}
                <button
                  onClick={() => remove(review.id)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs hover:text-red-400 hover:border-red-500/30 transition-colors"
                >
                  <Trash2 size={12} /> Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
