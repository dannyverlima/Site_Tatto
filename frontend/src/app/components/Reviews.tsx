import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Star, Send, ChevronRight } from 'lucide-react';

const MAX_MAIN = 5;

type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  displayDate?: string | null;
};

type ReviewsProps = {
  showAll?: boolean;
};

export function Reviews({ showAll = false }: ReviewsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', rating: 5, comment: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/reviews')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<ReviewItem[]>;
      })
      .then((data) => { if (isMounted) setReviews(data); })
      .catch(() => { if (isMounted) setLoadError('Não foi possível carregar as avaliações.'); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const r = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!r.ok) throw new Error();
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', rating: 5, comment: '' });
      }, 3000);
    } catch {
      setSubmitError('Não foi possível enviar sua avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayed = showAll ? reviews : reviews.slice(0, MAX_MAIN);
  const hasMore = !showAll && reviews.length > MAX_MAIN;

  return (
    <section id="avaliacoes" ref={ref} className="py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-4 tracking-wide">
            AVALIAÇÕES
          </h2>
          <p className="text-neutral-400 text-lg">
            O que nossos clientes dizem sobre nós
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {isLoading ? (
            <div className="md:col-span-3 text-center text-neutral-400">
              Carregando avaliações...
            </div>
          ) : loadError ? (
            <div className="md:col-span-3 text-center text-red-400">{loadError}</div>
          ) : displayed.length === 0 ? (
            <div className="md:col-span-3 text-center text-neutral-500">
              Ainda não há avaliações publicadas.
            </div>
          ) : (
            displayed.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-neutral-900 border border-white/5 p-6 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-700'}
                    />
                  ))}
                </div>
                <p className="text-neutral-300 mb-4 italic text-sm leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center justify-between">
                  <p className="text-neutral-100 font-semibold text-sm">{review.name}</p>
                  {review.displayDate && (
                    <p className="text-neutral-600 text-xs">{review.displayDate}</p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Botão "Ver todas" — só aparece na home quando há mais de 5 */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-10"
          >
            <a
              href="/Avalia%C3%A7%C3%A3o"
              className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 transition-colors border-b border-white/10 hover:border-white/30 pb-0.5"
            >
              Ver todas as avaliações
              <ChevronRight size={14} />
            </a>
          </motion.div>
        )}

        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto bg-neutral-900 border border-white/5 p-8 rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-neutral-100 mb-6 text-center">
            Deixe sua Avaliação
          </h3>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="text-5xl mb-4">✓</div>
              <p className="text-neutral-100 text-xl font-semibold">
                Obrigado pela sua avaliação!
              </p>
              <p className="text-neutral-400 text-sm mt-2">Será publicada em breve.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-neutral-400 mb-1.5 text-sm">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-neutral-100 rounded-xl focus:outline-none focus:border-white/30 transition-colors text-sm placeholder-neutral-600"
                  placeholder="Digite seu nome"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5 text-sm">Avaliação</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={30}
                        className={star <= formData.rating ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-700'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5 text-sm">Seu Comentário</label>
                <textarea
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-neutral-100 rounded-xl focus:outline-none focus:border-white/30 transition-colors resize-none text-sm placeholder-neutral-600"
                  placeholder="Conte-nos sobre sua experiência..."
                />
              </div>

              {submitError && <p className="text-sm text-red-400">{submitError}</p>}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-neutral-100 text-neutral-900 rounded-full font-semibold hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}</span>
                <Send size={18} />
              </motion.button>
            </form>
          )}
        </motion.div>

      </div>
    </section>
  );
}
