import { useState } from 'react';
import { AdminJewelry } from './AdminJewelry';
import { AdminOrders } from './AdminOrders';
import { AdminRevenue } from './AdminRevenue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../app/components/ui/tabs';
import { Input } from '../app/components/ui/input';
import { Gem, ArrowLeft } from 'lucide-react';

const AUTH_KEY = 'joalheria-admin-auth';

const shellClassName = 'relative min-h-screen overflow-hidden bg-[#050505] text-white';
const fieldClassName = 'border-white/10 bg-white/5 text-white placeholder:text-white/35';

function AdminJoalheriaLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, role: 'joalheria' }),
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
      <form onSubmit={handleSubmit} className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
            <Gem className="h-5 w-5 text-white/70" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Admin Joalheria</h2>
            <p className="text-xs text-white/40 mt-0.5">Painel de gestão</p>
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
        {error && <p className="text-sm text-red-300 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-white px-4 py-2.5 text-black font-semibold hover:bg-white/90 transition disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="mt-4 text-center text-xs text-white/30">
          <a href="/" className="hover:text-white/60 transition">← Voltar ao site</a>
        </p>
      </form>
    </div>
  );
}

function AdminJoalheriaPanel() {
  return (
    <div className={shellClassName}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-10%] h-[26rem] w-[26rem] rounded-full bg-white/8 blur-3xl animate-pulse" />
        <div className="absolute right-[-8%] top-[18%] h-[32rem] w-[32rem] rounded-full bg-white/5 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.03),_transparent_28%)]" />
      </div>

      <header className="relative border-b border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:py-5 lg:px-8 flex items-center gap-3 sm:gap-4">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8">
            <Gem className="h-4 w-4 sm:h-5 sm:w-5 text-white/70" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-semibold md:text-2xl truncate">Admin Joalheria</h1>
            <p className="text-xs text-white/40 hidden sm:block">Gestão da loja de joias</p>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="/joalheria"
              className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ver loja
            </a>
            <button
              onClick={() => { sessionStorage.removeItem('joalheria-admin-auth'); window.location.reload(); }}
              className="text-xs text-white/30 hover:text-white/60 transition px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">
        <Tabs defaultValue="jewelry" className="w-full">
          <div className="mb-7 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex justify-center">
            <TabsList className="!h-auto flex min-w-max sm:grid sm:w-full sm:max-w-md sm:grid-cols-3 gap-1.5 rounded-full border border-white/10 bg-[linear-gradient(120deg,rgba(255,255,255,0.07),rgba(255,255,255,0.01)_45%,rgba(0,0,0,0.22))] p-1.5 shadow-2xl shadow-black/35 backdrop-blur-2xl">
              <TabsTrigger
                value="jewelry"
                className="!h-10 sm:!h-11 px-5 sm:px-2 rounded-full text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)] whitespace-nowrap"
              >
                Joalheria
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="!h-10 sm:!h-11 px-5 sm:px-2 rounded-full text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)] whitespace-nowrap"
              >
                Encomendas
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="!h-10 sm:!h-11 px-5 sm:px-2 rounded-full text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)] whitespace-nowrap"
              >
                Faturamento
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="jewelry" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-3 sm:p-4 backdrop-blur-xl">
              <AdminJewelry />
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-3 sm:p-4 backdrop-blur-xl">
              <AdminOrders />
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-3 sm:p-4 backdrop-blur-xl">
              <AdminRevenue />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AdminJoalheriaApp() {
  const [isAuthed, setIsAuthed] = useState(() => Boolean(sessionStorage.getItem(AUTH_KEY)));

  if (!isAuthed) {
    return <AdminJoalheriaLogin onSuccess={() => setIsAuthed(true)} />;
  }

  return <AdminJoalheriaPanel />;
}
