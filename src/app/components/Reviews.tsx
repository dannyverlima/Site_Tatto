import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Star, Send } from 'lucide-react';

type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  displayDate?: string | null;
};

export function Reviews() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (!response.ok) {
          throw new Error('Falha ao carregar avaliacoes');
        }
        const data = (await response.json()) as ReviewItem[];
        if (isMounted) {
          setReviews(data);
        }
      } catch (error) {
        console.error('Erro ao carregar avaliacoes', error);
        if (isMounted) {
          setLoadError('Nao foi possivel carregar as avaliacoes.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar avaliacao');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', rating: 5, comment: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar avaliacao', error);
      setSubmitError('Nao foi possivel enviar sua avaliacao.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="avaliacoes" ref={ref} className="py-20 px-4 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-4 tracking-wide">
            AVALIACOES
          </h2>
          <p className="text-neutral-400 text-lg">
            O que nossos clientes dizem sobre nos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {isLoading ? (
            <div className="md:col-span-3 text-center text-neutral-400">
              Carregando avaliacoes...
            </div>
          ) : loadError ? (
            <div className="md:col-span-3 text-center text-red-400">
              {loadError}
            </div>
          ) : reviews.length === 0 ? (
            <div className="md:col-span-3 text-center text-neutral-500">
              Ainda nao ha avaliacoes publicadas.
            </div>
          ) : (
            reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-neutral-800 p-6 rounded-lg"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-600'}
                    />
                  ))}
                </div>
                <p className="text-neutral-300 mb-4 italic">"{review.comment}"</p>
                <div className="flex items-center justify-between">
                  <p className="text-neutral-100 font-semibold">{review.name}</p>
                  {review.displayDate ? (
                    <p className="text-neutral-500 text-sm">{review.displayDate}</p>
                  ) : null}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto bg-neutral-800 p-8 rounded-lg"
        >
          <h3 className="text-2xl font-bold text-neutral-100 mb-6 text-center">
            Deixe sua Avaliacao
          </h3>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="text-6xl mb-4">✓</div>
              <p className="text-neutral-100 text-xl font-semibold">
                Obrigado pela sua avaliacao!
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-neutral-300 mb-2 text-sm">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-700 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Digite seu nome"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-2 text-sm">
                  Avaliacao
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={star <= formData.rating ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-600'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-2 text-sm">
                  Seu Comentario
                </label>
                <textarea
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-700 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
                  placeholder="Conte-nos sobre sua experiencia..."
                />
              </div>

              {submitError ? (
                <p className="text-sm text-red-400">{submitError}</p>
              ) : null}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-neutral-100 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-200 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Avaliacao'}</span>
                <Send size={20} />
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
