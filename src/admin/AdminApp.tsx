import { useEffect, useMemo, useState } from 'react';
import { defaultSiteConfig, saveSiteConfig, SiteConfig } from '../app/data/siteConfig';
import { useSiteConfig } from '../app/hooks/useSiteConfig';
import { AdminSpecialists } from './AdminSpecialists';
import { AdminPortfolio } from './AdminPortfolio';
import { AdminCourse } from './AdminCourse';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../app/components/ui/tabs';

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
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const hasChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(config), [draft, config]);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      await saveSiteConfig(draft);
      setStatus('Atualizado com sucesso.');
      setTimeout(() => setStatus(''), 3000);
    } catch (saveError) {
      console.error('Falha ao salvar configuracao', saveError);
      setError('Falha ao salvar. Verifique o servidor.');
    } finally {
      setIsSaving(false);
    }
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
            {error ? <span className="text-sm text-red-400">{error}</span> : null}
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="px-6 py-3 bg-neutral-100 text-neutral-900 rounded-lg font-semibold disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar informacoes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="hero">Início</TabsTrigger>
            <TabsTrigger value="course">Curso</TabsTrigger>
            <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
            <TabsTrigger value="specialists">Especialistas</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-10">
            <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Início (fundo)</h2>
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
          </TabsContent>

          <TabsContent value="course" className="space-y-10">
            <AdminCourse />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-10">
            <AdminPortfolio />
          </TabsContent>

          <TabsContent value="specialists" className="space-y-10">
            <AdminSpecialists />
          </TabsContent>

          <TabsContent value="config" className="space-y-10">
            <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Reset</h2>
              <button
                onClick={() => setDraft(defaultSiteConfig)}
                className="px-6 py-3 border border-neutral-700 rounded-lg text-sm hover:border-neutral-400"
              >
                Restaurar padrão
              </button>
            </section>
          </TabsContent>
        </Tabs>
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
