import { useEffect, useState } from 'react';
import { Link, MessageCircle, Instagram, Save } from 'lucide-react';

const AUTH_KEY = 'admin-auth';

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-white/25 transition';

interface SpecialistRecord {
  id: number;
  name: string;
  specialty: string;
  imageUrl: string;
  experience?: string;
  description?: string;
  whatsapp?: string;
  instagram?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function AdminUrls() {
  const [specialists, setSpecialists] = useState<SpecialistRecord[]>([]);
  const [mainWhatsapp, setMainWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const token = () => sessionStorage.getItem(AUTH_KEY) || '';

  const flash = (msg: string, isErr = false) => {
    if (isErr) setErrorMsg(msg);
    else setStatusMsg(msg);
    setTimeout(() => { setStatusMsg(''); setErrorMsg(''); }, 3500);
  };

  useEffect(() => {
    (async () => {
      try {
        const [specRes, settingsRes] = await Promise.all([
          fetch('/api/specialists'),
          fetch('/api/site-settings?keys=main_whatsapp'),
        ]);
        const specs: SpecialistRecord[] = await specRes.json();
        const settings: Record<string, string> = await settingsRes.json();
        setSpecialists(Array.isArray(specs) ? specs : []);
        setMainWhatsapp(settings.main_whatsapp || '');
      } catch {
        flash('Erro ao carregar dados', true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveMainWhatsapp = async () => {
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ main_whatsapp: mainWhatsapp }),
      });
      if (!res.ok) throw new Error();
      flash('WhatsApp geral salvo!');
    } catch {
      flash('Erro ao salvar WhatsApp geral', true);
    }
  };

  const saveSpecialist = async (spec: SpecialistRecord) => {
    try {
      const res = await fetch(`/api/specialists/${spec.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          name: spec.name,
          specialty: spec.specialty,
          description: spec.description || '',
          imageUrl: spec.imageUrl,
          experience: spec.experience || '',
          instagram: spec.instagram || '',
          whatsapp: spec.whatsapp || '',
          sortOrder: spec.sortOrder ?? 0,
          isActive: spec.isActive ?? true,
        }),
      });
      if (!res.ok) throw new Error();
      flash(`URLs de ${spec.name} salvas!`);
    } catch {
      flash(`Erro ao salvar URLs de ${spec.name}`, true);
    }
  };

  const updateSpec = (id: number, field: 'whatsapp' | 'instagram', value: string) => {
    setSpecialists((ss) => ss.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  if (loading) {
    return <p className="text-white/40 text-sm py-8 text-center">Carregando...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Status / error */}
      {statusMsg && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-300">
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {errorMsg}
        </div>
      )}

      {/* ── WhatsApp Geral ── */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
            <MessageCircle className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">WhatsApp Geral do Site</h3>
            <p className="text-xs text-white/45">Usado nos botões de WhatsApp do rodapé e contatos do site</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            className={fieldClass}
            placeholder="https://wa.me/5527999999999"
            value={mainWhatsapp}
            onChange={(e) => setMainWhatsapp(e.target.value)}
          />
          <button
            onClick={saveMainWhatsapp}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition whitespace-nowrap"
          >
            <Save className="h-4 w-4" />
            Salvar
          </button>
        </div>
        {mainWhatsapp && (
          <a
            href={mainWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition"
          >
            <Link className="h-3 w-3" /> Testar link
          </a>
        )}
      </div>

      {/* ── Especialistas ── */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/35 mb-4">URLs por especialista</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {specialists.map((spec) => (
            <div
              key={spec.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="font-semibold text-white mb-4 truncate">{spec.name}</p>

              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-white/45 uppercase tracking-wider mb-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-green-400" />
                    WhatsApp
                  </label>
                  <input
                    className={fieldClass}
                    placeholder="https://wa.me/5527..."
                    value={spec.whatsapp || ''}
                    onChange={(e) => updateSpec(spec.id, 'whatsapp', e.target.value)}
                  />
                  {spec.whatsapp && (
                    <a href={spec.whatsapp} target="_blank" rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/55 transition">
                      <Link className="h-3 w-3" /> Testar
                    </a>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs text-white/45 uppercase tracking-wider mb-1.5">
                    <Instagram className="h-3.5 w-3.5 text-pink-400" />
                    Instagram
                  </label>
                  <input
                    className={fieldClass}
                    placeholder="https://instagram.com/..."
                    value={spec.instagram || ''}
                    onChange={(e) => updateSpec(spec.id, 'instagram', e.target.value)}
                  />
                  {spec.instagram && (
                    <a href={spec.instagram.startsWith('http') ? spec.instagram : `https://instagram.com/${spec.instagram.replace('@', '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/55 transition">
                      <Link className="h-3 w-3" /> Testar
                    </a>
                  )}
                </div>

                <button
                  onClick={() => saveSpecialist(spec)}
                  className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  Salvar {spec.name}
                </button>
              </div>
            </div>
          ))}

          {specialists.length === 0 && (
            <p className="text-white/35 text-sm col-span-full">Nenhum especialista cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
