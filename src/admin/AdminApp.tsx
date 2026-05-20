import { useEffect, useMemo, useState } from 'react';
import { defaultSiteConfig, saveSiteConfig, SiteConfig } from '../app/data/siteConfig';
import { useSiteConfig } from '../app/hooks/useSiteConfig';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Admin@tatto';
const AUTH_KEY = 'admin-auth';

const normalizeLines = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const AdminLogin = ({ onSuccess }: { onSuccess: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onSuccess();
      return;
    }
    setError('Nome ou senha incorretos.');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8"
      >
        <h1 className="text-2xl font-bold mb-6">Area Admin</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-2">Nome</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
              placeholder="Admin@tatto"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-neutral-100 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
          >
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminPanel = () => {
  const { config } = useSiteConfig();
  const [draft, setDraft] = useState<SiteConfig>(config);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const hasChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(config), [draft, config]);

  const handleSave = () => {
    saveSiteConfig(draft);
    setStatus('Atualizado com sucesso.');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Admin</p>
            <h1 className="text-3xl font-bold">Controle do site</h1>
          </div>
          <div className="flex items-center gap-4">
            {status ? <span className="text-sm text-green-400">{status}</span> : null}
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-6 py-3 bg-neutral-100 text-neutral-900 rounded-lg font-semibold disabled:opacity-50"
            >
              Salvar informacoes
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Inicio (fundo)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">Tipo</label>
              <select
                value={draft.hero.backgroundType}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    hero: { ...draft.hero, backgroundType: event.target.value as SiteConfig['hero']['backgroundType'] },
                  })
                }
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                <option value="image">Imagem</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-2">URL</label>
              <input
                value={draft.hero.backgroundUrl}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    hero: { ...draft.hero, backgroundUrl: event.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Curso</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">Descricao</label>
              <textarea
                value={draft.course.description}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    course: { ...draft.course, description: event.target.value },
                  })
                }
                rows={3}
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Preco</label>
                <input
                  value={draft.course.price}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      course: { ...draft.course, price: event.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Parcelamento</label>
                <input
                  value={draft.course.priceNote}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      course: { ...draft.course, priceNote: event.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Proxima turma</label>
                <input
                  value={draft.course.nextClass}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      course: { ...draft.course, nextClass: event.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-2">Destaques (1 por linha)</label>
              <textarea
                value={draft.course.highlights.join('\n')}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    course: { ...draft.course, highlights: normalizeLines(event.target.value) },
                  })
                }
                rows={3}
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-2">Informacoes extras (1 por linha)</label>
              <textarea
                value={draft.course.extraInfo.join('\n')}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    course: { ...draft.course, extraInfo: normalizeLines(event.target.value) },
                  })
                }
                rows={4}
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
              />
            </div>
          </div>
        </section>

        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Portfolio</h2>
          <div className="grid gap-6">
            {draft.portfolio.items.map((item, index) => (
              <div key={`${item.title}-${index}`} className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Titulo</label>
                  <input
                    value={item.title}
                    onChange={(event) => {
                      const items = [...draft.portfolio.items];
                      items[index] = { ...items[index], title: event.target.value };
                      setDraft({ ...draft, portfolio: { items } });
                    }}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Estilo</label>
                  <input
                    value={item.style}
                    onChange={(event) => {
                      const items = [...draft.portfolio.items];
                      items[index] = { ...items[index], style: event.target.value };
                      setDraft({ ...draft, portfolio: { items } });
                    }}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">URL da foto</label>
                  <input
                    value={item.image}
                    onChange={(event) => {
                      const items = [...draft.portfolio.items];
                      items[index] = { ...items[index], image: event.target.value };
                      setDraft({ ...draft, portfolio: { items } });
                    }}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Especialistas</h2>
          <div className="grid gap-6">
            {draft.specialists.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Nome</label>
                  <input
                    value={item.name}
                    onChange={(event) => {
                      const items = [...draft.specialists.items];
                      items[index] = { ...items[index], name: event.target.value };
                      setDraft({ ...draft, specialists: { items } });
                    }}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Especialidade</label>
                  <input
                    value={item.specialty}
                    onChange={(event) => {
                      const items = [...draft.specialists.items];
                      items[index] = { ...items[index], specialty: event.target.value };
                      setDraft({ ...draft, specialists: { items } });
                    }}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Experiencia</label>
                  <input
                    value={item.experience}
                    onChange={(event) => {
                      const items = [...draft.specialists.items];
                      items[index] = { ...items[index], experience: event.target.value };
                      setDraft({ ...draft, specialists: { items } });
                    }}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Instagram</label>
                  <input
                    value={item.instagram}
                    onChange={(event) => {
                      const items = [...draft.specialists.items];
                      items[index] = { ...items[index], instagram: event.target.value };
                      setDraft({ ...draft, specialists: { items } });
                    }}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">WhatsApp (somente numeros)</label>
                  <input
                    value={item.whatsapp}
                    onChange={(event) => {
                      const items = [...draft.specialists.items];
                      items[index] = { ...items[index], whatsapp: event.target.value };
                      setDraft({ ...draft, specialists: { items } });
                    }}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">URL da foto</label>
                  <input
                    value={item.image}
                    onChange={(event) => {
                      const items = [...draft.specialists.items];
                      items[index] = { ...items[index], image: event.target.value };
                      setDraft({ ...draft, specialists: { items } });
                    }}
                    className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Reset</h2>
          <button
            onClick={() => setDraft(defaultSiteConfig)}
            className="px-6 py-3 border border-neutral-700 rounded-lg text-sm hover:border-neutral-400"
          >
            Restaurar padrao
          </button>
        </section>
      </main>
    </div>
  );
};

export default function AdminApp() {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');

  if (!isAuthed) {
    return <AdminLogin onSuccess={() => setIsAuthed(true)} />;
  }

  return <AdminPanel />;
}
