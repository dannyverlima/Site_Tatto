import { useState } from 'react';
import { useSiteConfig } from '../app/hooks/useSiteConfig';

export default function CursoPage() {
  const { config } = useSiteConfig();
  const { course } = config;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFeatures = course.features.length > 0;
  const hasHighlights = course.highlights.length > 0;
  const hasExtraInfo = course.extraInfo.length > 0;
  const hasNextClass = Boolean(course.nextClass || course.price || course.priceNote);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/course-enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar inscricao');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Erro ao enviar inscricao', error);
      setSubmitError('Nao foi possivel enviar sua inscricao.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Curso</p>
            <h1 className="text-3xl md:text-4xl font-bold">Inscricao e Informacoes</h1>
          </div>
          <a
            href="/"
            className="px-4 py-2 rounded-full border border-neutral-700 text-xs uppercase tracking-wide hover:border-neutral-400 transition-colors"
          >
            Voltar ao site
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 grid gap-10 lg:grid-cols-5">
        <section className="lg:col-span-3 space-y-6">
          {(course.description || hasFeatures) ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-3">Sobre o curso</h2>
              {course.description ? (
                <p className="text-neutral-300">{course.description}</p>
              ) : null}
              {hasFeatures ? (
                <ul className="mt-5 space-y-2 text-neutral-400 text-sm">
                  {course.features.map((item) => (
                    <li key={item.title}>• {item.title}: {item.description}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {hasHighlights ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-3">Destaques do curso</h2>
              <div className="grid gap-3 sm:grid-cols-2 text-sm text-neutral-400">
                {course.highlights.map((item) => (
                  <div key={item} className="bg-neutral-800 rounded-lg p-4">
                    <p className="text-neutral-200 font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {hasExtraInfo ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-3">Conteudo e metodologia</h2>
              <ul className="mt-5 space-y-2 text-neutral-400 text-sm">
                {course.extraInfo.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasNextClass ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-3">Proxima turma</h2>
              {course.nextClass ? (
                <p className="text-neutral-300">{course.nextClass}</p>
              ) : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-neutral-400">
                {course.price ? (
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <p className="text-neutral-200 font-semibold">Investimento</p>
                    <p>{course.price} {course.priceNote}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        <aside className="lg:col-span-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Inscricao</h2>
            {submitted ? (
              <p className="text-neutral-300 text-sm">
                Inscricao enviada. Entraremos em contato para confirmar sua vaga.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Nome completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Telefone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    placeholder="(27) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Mensagem</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
                    placeholder="Conte um pouco sobre sua experiencia"
                  />
                </div>
                {submitError ? (
                  <p className="text-sm text-red-400">{submitError}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-neutral-100 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar inscricao'}
                </button>
              </form>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
