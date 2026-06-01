import { useState } from 'react';
import { AdminJewelry } from './AdminJewelry';
import { AdminOrders } from './AdminOrders';
import { AdminRevenue } from './AdminRevenue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../app/components/ui/tabs';
import { Input } from '../app/components/ui/input';
import { Gem, ArrowLeft } from 'lucide-react';

const ADMIN_PASS = 'Admin@joia';
const AUTH_KEY = 'joalheria-admin-auth';

const shellClassName = 'relative min-h-screen overflow-hidden bg-[#050505] text-white';
const fieldClassName = 'border-white/10 bg-white/5 text-white placeholder:text-white/35';

function AdminJoalheriaLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === ADMIN_PASS) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onSuccess();
      return;
    }
    setError('Nome ou senha incorretos.');
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
            <Gem className="h-5 w-5 text-white/70" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Admin Joalheria</h2>
            <p className="text-xs text-white/40 mt-0.5">Painel de gestão</p>
          </div>
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-sm text-white/65">Nome</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`${fieldClassName} w-full rounded-xl px-3 py-2.5 outline-none ring-1 ring-inset ring-white/10 focus:ring-white/25 transition`}
          />
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
          className="w-full rounded-full bg-white px-4 py-2.5 text-black font-semibold hover:bg-white/90 transition"
        >
          Entrar
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
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
            <Gem className="h-5 w-5 text-white/70" />
          </div>
          <div>
            <h1 className="text-xl font-semibold md:text-2xl">Admin Joalheria</h1>
            <p className="text-xs text-white/40">Gestão da loja de joias</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/joalheria"
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition"
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

      <main className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Tabs defaultValue="jewelry" className="w-full">
          <div className="mb-7 flex justify-center">
            <TabsList className="!h-auto grid w-full max-w-md grid-cols-3 gap-1.5 rounded-full border border-white/10 bg-[linear-gradient(120deg,rgba(255,255,255,0.07),rgba(255,255,255,0.01)_45%,rgba(0,0,0,0.22))] p-1.5 shadow-2xl shadow-black/35 backdrop-blur-2xl">
              <TabsTrigger
                value="jewelry"
                className="!h-11 rounded-full text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)]"
              >
                Joalheria
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="!h-11 rounded-full text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)]"
              >
                Encomendas
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="!h-11 rounded-full text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:!border-white/20 data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:shadow-[0_8px_20px_rgba(255,255,255,0.18)]"
              >
                Faturamento
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="jewelry" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <AdminJewelry />
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <AdminOrders />
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-10">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <AdminRevenue />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AdminJoalheriaApp() {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');

  if (!isAuthed) {
    return <AdminJoalheriaLogin onSuccess={() => setIsAuthed(true)} />;
  }

  return <AdminJoalheriaPanel />;
}
