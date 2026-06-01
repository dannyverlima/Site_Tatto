import { useEffect, useMemo, useState } from 'react';
import { defaultSiteConfig, saveSiteConfig, SiteConfig } from '../app/data/siteConfig';
import { useSiteConfig } from '../app/hooks/useSiteConfig';
import { AdminSpecialists } from './AdminSpecialists';
import { AdminPortfolio } from './AdminPortfolio';
import { AdminCourse } from './AdminCourse';
import { AdminJewelry } from './AdminJewelry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../app/components/ui/tabs';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { ChevronRight, Upload, Wand2 } from 'lucide-react';
import { uploadImageFile } from './uploadImage';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Admin@tatto';
const AUTH_KEY = 'admin-auth';

const shellClassName = 'relative min-h-screen overflow-hidden bg-[#050505] text-white';
const panelClassName = 'border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30 backdrop-blur-xl';
const fieldClassName = 'border-white/10 bg-white/5 text-white placeholder:text-white/35';

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
    <div className={`${shellClassName} flex items-center justify-center px-4`}>
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6">
        <h2 className="mb-4 text-xl font-semibold">Admin</h2>
        <div className="mb-3">
          <label className="block mb-1 text-sm">Nome</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className={`${fieldClassName} w-full rounded px-3 py-2`} />
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-sm">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${fieldClassName} w-full rounded px-3 py-2`} />
        </div>
        {error ? <p className="text-sm text-red-300 mb-2">{error}</p> : null}
        <button type="submit" className="rounded-full bg-white px-4 py-2 text-black">Entrar</button>
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
      const backgroundUrl = await uploadImageFile(file);
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
        await saveSiteConfig(updatedDraft);
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
    <div className={shellClassName}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-10%] h-[26rem] w-[26rem] rounded-full bg-white/8 blur-3xl animate-pulse" />
        <div className="absolute right-[-8%] top-[18%] h-[32rem] w-[32rem] rounded-full bg-white/5 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.03),_transparent_28%)]" />
      </div>

      <header className="relative border-b border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <h1 className="text-2xl font-semibold md:text-3xl">Controle do site</h1>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Tabs defaultValue="hero" className="w-full">
          <div className="mb-7 flex justify-center">
            <TabsList className="!h-auto grid w-full max-w-6xl grid-cols-6 gap-1.5 rounded-full border border-white/10 bg-[linear-gradient(120deg,rgba(255,255,255,0.07),rgba(255,255,255,0.01)_45%,rgba(0,0,0,0.22))] p-1.5 shadow-2xl shadow-black/35 backdrop-blur-2xl">
              <TabsTrigger value="hero" className="!h-11 rounded-full text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)]">Início</TabsTrigger>
              <TabsTrigger value="course" className="!h-11 rounded-full text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)]">Curso</TabsTrigger>
              <TabsTrigger value="portfolio" className="!h-11 rounded-full text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)]">Portfólio</TabsTrigger>
              <TabsTrigger value="specialists" className="!h-11 rounded-full text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)]">Especialistas</TabsTrigger>
              <TabsTrigger value="jewelry" className="!h-11 rounded-full text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)]">Joias</TabsTrigger>
              <TabsTrigger value="config" className="!h-11 rounded-full text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)]">Config</TabsTrigger>
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
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <AdminCourse />
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <AdminPortfolio />
            </div>
          </TabsContent>

          <TabsContent value="specialists" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <AdminSpecialists />
            </div>
          </TabsContent>

          <TabsContent value="jewelry" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <AdminJewelry />
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