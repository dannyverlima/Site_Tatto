import { useEffect, useMemo, useState } from 'react';
import { defaultSiteConfig, saveSiteConfig, SiteConfig } from '../app/data/siteConfig';
import { useSiteConfig } from '../app/hooks/useSiteConfig';
import { AdminSpecialists } from './AdminSpecialists';
import { AdminCourse } from './AdminCourse';
import { AdminPortfolio } from './AdminPortfolio';
import { AdminUrls } from './AdminUrls';
import { AdminReviews } from './AdminReviews';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../app/components/ui/tabs';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { ChevronRight, Upload, Wand2, Gem, Link2, Star } from 'lucide-react';
import { uploadImageFile } from './uploadImage';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';

const AUTH_KEY = 'admin-auth';

const shellClassName = 'relative min-h-screen overflow-hidden bg-[#050505] text-white';
const panelClassName = 'border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30 backdrop-blur-xl';
const fieldClassName = 'border-white/10 bg-white/5 text-white placeholder:text-white/35';

const AdminLogin = ({ onSuccess }: { onSuccess: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, role: 'admin' }),
      });
      if (res.ok) {
        const { token } = await res.json();
        sessionStorage.setItem(AUTH_KEY, token);
        onSuccess();
      } else {
        setError('Senha incorreta.');
      }
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${shellClassName} flex items-center justify-center px-4`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-10%] h-[26rem] w-[26rem] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute right-[-8%] top-[18%] h-[32rem] w-[32rem] rounded-full bg-white/3 blur-3xl" />
      </div>
      <form onSubmit={handleSubmit} className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
            <Wand2 className="h-5 w-5 text-white/70" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Admin Studios Tatto</h2>
            <p className="text-xs text-white/40 mt-0.5">Painel de controle do site</p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm text-white/65">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${fieldClassName} w-full rounded-xl px-3 py-2.5 outline-none ring-1 ring-inset ring-white/10 focus:ring-white/25 transition`}
          />
        </div>
        {error ? <p className="text-sm text-red-300 mb-3">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-white px-4 py-2.5 text-black font-semibold hover:bg-white/90 transition disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="mt-4 text-center text-xs text-white/30">
          <a href="/joalheria" className="hover:text-white/60 transition">← Ir para a Joalheria</a>
        </p>
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
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const hasChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(config), [draft, config]);

  const handleHeroMediaFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    const backgroundType = file.type.startsWith('video/') ? 'video' : 'image';
    const previousBackgroundUrl = draft.hero.backgroundUrl;
    const previousBackgroundType = draft.hero.backgroundType;

    setDraft({
      ...draft,
      hero: {
        ...draft.hero,
        backgroundType,
        backgroundUrl: localPreviewUrl,
      },
    });
    setStatus('Prévia aplicada. Enviando mídia para o servidor...');
    setError('');
    setIsUploadingHeroImage(true);
    try {
      const backgroundUrl = await uploadImageFile(file, sessionStorage.getItem(AUTH_KEY) || '');
      const updatedDraft = {
        ...draft,
        hero: {
          ...draft.hero,
          backgroundType,
          backgroundUrl,
        },
      } as SiteConfig;
      setDraft(updatedDraft);
      setStatus('Mídia enviada. Salvando automaticamente...');
      try {
        setIsSaving(true);
        await saveSiteConfig(updatedDraft, sessionStorage.getItem(AUTH_KEY) || '');
        setStatus('Atualizado com sucesso.');
        setTimeout(() => setStatus(''), 3000);
      } catch (saveErr) {
        console.error('Falha ao salvar automaticamente', saveErr);
        setStatus('Mídia enviada. Clique em Salvar informações para gravar no site.');
        setTimeout(() => setStatus(''), 3000);
      } finally {
        setIsSaving(false);
      }
    } catch (uploadError) {
      console.error('Falha ao enviar mídia do hero', uploadError);
      setDraft((currentDraft) => ({
        ...currentDraft,
        hero: {
          ...currentDraft.hero,
          backgroundType: previousBackgroundType,
          backgroundUrl: previousBackgroundUrl,
        },
      }));
      setError(uploadError?.message ? String(uploadError.message) : 'Não foi possível enviar a mídia do hero.');
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
      setIsUploadingHeroImage(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    if (isUploadingHeroImage) {
      setError('Aguarde o upload da mídia antes de salvar.');
      setIsSaving(false);
      return;
    }

    if (draft.hero.backgroundUrl && draft.hero.backgroundUrl.startsWith('blob:')) {
      setError('A mídia ainda está em pré-visualização. Aguarde o envio completo antes de salvar.');
      setIsSaving(false);
      return;
    }
    try {
      await saveSiteConfig(draft, sessionStorage.getItem(AUTH_KEY) || '');
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
    <div className={shellClassName}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-10%] h-[26rem] w-[26rem] rounded-full bg-white/8 blur-3xl animate-pulse" />
        <div className="absolute right-[-8%] top-[18%] h-[32rem] w-[32rem] rounded-full bg-white/5 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.03),_transparent_28%)]" />
      </div>

      <header className="relative border-b border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold sm:text-2xl md:text-3xl">Controle do site</h1>
          <button
            onClick={() => { sessionStorage.removeItem(AUTH_KEY); window.location.reload(); }}
            className="text-xs text-white/30 hover:text-white/60 transition px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">
        <Tabs defaultValue="hero" className="w-full">
          <div className="mb-7 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex justify-center">
            <TabsList className="!h-auto flex min-w-max sm:grid sm:w-full sm:max-w-4xl sm:grid-cols-6 gap-1.5 rounded-full border border-white/10 bg-[linear-gradient(120deg,rgba(255,255,255,0.07),rgba(255,255,255,0.01)_45%,rgba(0,0,0,0.22))] p-1.5 shadow-2xl shadow-black/35 backdrop-blur-2xl">
              <TabsTrigger value="hero" className="!h-10 sm:!h-11 px-4 sm:px-2 rounded-full text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)] whitespace-nowrap">Início</TabsTrigger>
              <TabsTrigger value="course" className="!h-10 sm:!h-11 px-4 sm:px-2 rounded-full text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)] whitespace-nowrap">Curso</TabsTrigger>
              <TabsTrigger value="specialists" className="!h-10 sm:!h-11 px-4 sm:px-2 rounded-full text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)] whitespace-nowrap">Especialistas</TabsTrigger>
              <TabsTrigger value="portfolio" className="!h-10 sm:!h-11 px-4 sm:px-2 rounded-full text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)] whitespace-nowrap">Portfólio</TabsTrigger>
              <TabsTrigger value="urls" className="!h-10 sm:!h-11 px-4 sm:px-2 rounded-full text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)] whitespace-nowrap inline-flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" />URLs</TabsTrigger>
              <TabsTrigger value="reviews" className="!h-10 sm:!h-11 px-4 sm:px-2 rounded-full text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)] whitespace-nowrap inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5" />Avaliações</TabsTrigger>
              <TabsTrigger value="config" className="!h-10 sm:!h-11 px-4 sm:px-2 rounded-full text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)] whitespace-nowrap">Config</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="hero" className="space-y-10">
            <section className={`rounded-[28px] border border-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl ${panelClassName}`}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white/80">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Início</h2>
                  <p className="text-sm text-white/55">Ajuste o fundo principal do site sem sair do fluxo visual escuro.</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-white/65">Tipo</label>
                    <select
                      value={draft.hero.backgroundType}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          hero: { ...draft.hero, backgroundType: event.target.value as SiteConfig['hero']['backgroundType'] },
                        })
                      }
                      className={`w-full rounded-2xl px-4 py-3 outline-none ring-1 ring-inset ring-white/10 transition focus:ring-2 focus:ring-white/30 ${fieldClassName}`}
                    >
                      <option value="image">Imagem</option>
                      <option value="video">Video</option>
                    </select>
                  </div>

                  {draft.hero.backgroundType === 'image' ? (
                    <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition hover:border-white/30 hover:bg-black/30">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                          <Upload size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Enviar foto por arquivo</p>
                          <p className="text-xs text-white/45">PNG, JPG ou WEBP. O arquivo fica salvo no servidor.</p>
                        </div>
                      </div>
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleHeroMediaFile}
                        className="border-white/10 bg-white/5 text-white file:border-0 file:bg-white/10 file:text-white file:rounded-full file:px-3 file:py-1.5 file:text-xs"
                      />
                    </label>
                  ) : (
                    <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition hover:border-white/30 hover:bg-black/30">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                          <Upload size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Enviar vídeo por arquivo</p>
                          <p className="text-xs text-white/45">MP4, WEBM ou MOV. O vídeo fica salvo no servidor.</p>
                        </div>
                      </div>
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleHeroMediaFile}
                        className="border-white/10 bg-white/5 text-white file:border-0 file:bg-white/10 file:text-white file:rounded-full file:px-3 file:py-1.5 file:text-xs"
                      />
                    </label>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/65">
                    {isUploadingHeroImage ? 'Enviando mídia do hero...' : 'A mídia enviada é salva no servidor e reaproveitada no site.'}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/40">
                  <div className="border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.28em] text-white/45">
                    Prévia do hero
                  </div>
                  <div className="aspect-[16/10] bg-black">
                    {draft.hero.backgroundType === 'image' && draft.hero.backgroundUrl ? (
                      <ImageWithFallback src={draft.hero.backgroundUrl} alt="Prévia do fundo" className="h-full w-full object-cover" />
                    ) : draft.hero.backgroundType === 'video' && draft.hero.backgroundUrl ? (
                      <video src={draft.hero.backgroundUrl} className="h-full w-full object-cover" autoPlay loop muted playsInline />
                    ) : (
                      <div className="flex h-full items-center justify-center px-8 text-center text-white/50">
                        Envie uma imagem ou vídeo para ver a prévia aqui.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {status ? <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">{status}</span> : null}
                {error ? <span className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</span> : null}
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="rounded-full border border-white/10 bg-white px-5 text-black hover:bg-white/90 disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar informações'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="course" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-3 sm:p-4 backdrop-blur-xl">
              <AdminCourse />
            </div>
          </TabsContent>

          <TabsContent value="specialists" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-3 sm:p-4 backdrop-blur-xl">
              <AdminSpecialists />
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-3 sm:p-4 backdrop-blur-xl">
              <AdminPortfolio />
            </div>
          </TabsContent>

          <TabsContent value="urls" className="space-y-10">
            <section className={`rounded-[28px] border border-white/10 p-6 ${panelClassName}`}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white/80">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">URLs</h2>
                  <p className="text-sm text-white/55">WhatsApp e Instagram do site e de cada especialista</p>
                </div>
              </div>
              <AdminUrls />
            </section>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-4">Gerenciar Avaliações</h2>
              <AdminReviews />
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-10">
            <section className={`rounded-[28px] border border-white/10 p-6 ${panelClassName}`}>
              <h2 className="text-2xl font-semibold">Reset</h2>
              <p className="mt-2 text-sm text-white/55">Restaura a configuração base do painel.</p>
              <Button
                onClick={() => setDraft(defaultSiteConfig)}
                className="mt-4 rounded-full border border-white/10 bg-white text-black hover:bg-white/90"
              >
                Restaurar padrão
              </Button>
              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                    <Gem className="h-4 w-4 text-white/60" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Admin Joalheria</h3>
                    <p className="text-xs text-white/40">Gerencie joias, encomendas e faturamento</p>
                  </div>
                </div>
                <a
                  href="/Admin@joalheria"
                  className="inline-flex items-center gap-2 mt-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                >
                  Ir para Admin Joalheria →
                </a>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default function AdminApp() {
  const [isAuthed, setIsAuthed] = useState(() => Boolean(sessionStorage.getItem(AUTH_KEY)));

  if (!isAuthed) {
    return <AdminLogin onSuccess={() => setIsAuthed(true)} />;
  }

  return <AdminPanel />;
}