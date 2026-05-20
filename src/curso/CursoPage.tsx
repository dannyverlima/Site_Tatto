import { useSiteConfig } from '../app/hooks/useSiteConfig';

export default function CursoPage() {
  const { config } = useSiteConfig();
  const { course } = config;
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
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Sobre o curso</h2>
            <p className="text-neutral-300">{course.description}</p>
            <ul className="mt-5 space-y-2 text-neutral-400 text-sm">
              {course.features.map((item) => (
                <li key={item.title}>• {item.title}: {item.description}</li>
              ))}
            </ul>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Destaques do curso</h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-neutral-400">
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-neutral-200 font-semibold">Duracao flexivel</p>
                <p>Cursos de 3 a 6 meses</p>
              </div>
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-neutral-200 font-semibold">Turmas pequenas</p>
                <p>Maximo 8 alunos por turma</p>
              </div>
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-neutral-200 font-semibold">Certificado</p>
                <p>Reconhecido nacionalmente</p>
              </div>
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-neutral-200 font-semibold">Pratica intensa</p>
                <p>Mais de 200h de pratica</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Conteudo e metodologia</h2>
            <p className="text-neutral-300">
              Aulas teoricas e praticas com foco em higiene, seguranca e
              desenvolvimento artistico.
            </p>
            <ul className="mt-5 space-y-2 text-neutral-400 text-sm">
              <li>• Biosseguranca e materiais</li>
              <li>• Desenho e composicao</li>
              <li>• Maquinas e tecnicas de aplicacao</li>
              <li>• Atendimento ao cliente e cuidados pos tatuagem</li>
            </ul>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Proxima turma</h2>
            <p className="text-neutral-300">{course.nextClass}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-neutral-400">
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-neutral-200 font-semibold">Carga horaria</p>
                <p>200h de pratica supervisionada</p>
              </div>
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-neutral-200 font-semibold">Investimento</p>
                <p>{course.price} {course.priceNote}</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Inscricao</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Nome completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Telefone</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="(27) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Mensagem</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
                  placeholder="Conte um pouco sobre sua experiencia"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-neutral-100 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
              >
                Enviar inscricao
              </button>
            </form>
            <p className="text-neutral-500 text-xs mt-4">
              Entraremos em contato para confirmar sua vaga.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
