import { useEffect, useMemo, useState } from 'react';
import { MapPin, Clock3, Phone, Mail, ExternalLink } from 'lucide-react';

type OpeningHour = {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  note: string | null;
  isClosed: boolean;
};

type LocationInfo = {
  name?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  mapEmbedUrl?: string | null;
  reference?: string | null;
  parkingInfo?: string | null;
  openingHours?: OpeningHour[];
};

type ContactInfo = {
  id: string;
  kind: string;
  label: string | null;
  value: string;
  linkUrl: string | null;
};

type SocialLink = {
  id: string;
  platform: string;
  label: string | null;
  url: string;
};

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const formatAddress = (location: LocationInfo | null) => {
  if (!location) {
    return [] as string[];
  }

  return [
    [location.addressLine1, location.addressLine2].filter(Boolean).join(' '),
    [location.city, location.state].filter(Boolean).join(' / '),
    location.postalCode || '',
    location.country || '',
  ].filter((line) => typeof line === 'string' && line.trim().length > 0) as string[];
};

export default function LocationInfoPage() {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [social, setSocial] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [locationRes, contactRes, socialRes] = await Promise.all([
          fetch('/api/location'),
          fetch('/api/contact-info'),
          fetch('/api/social-links'),
        ]);

        if (!active) {
          return;
        }

        if (locationRes.ok) {
          setLocation((await locationRes.json()) as LocationInfo | null);
        }
        if (contactRes.ok) {
          setContacts((await contactRes.json()) as ContactInfo[]);
        }
        if (socialRes.ok) {
          setSocial((await socialRes.json()) as SocialLink[]);
        }
      } catch (error) {
        console.error('Erro ao carregar informacoes da loja', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const addressLines = useMemo(() => formatAddress(location), [location]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
        <button
          type="button"
          onClick={() => {
            window.location.href = '/';
          }}
          className="mb-8 rounded-full border border-neutral-700 px-4 py-2 text-xs uppercase tracking-wide text-neutral-200 hover:border-neutral-400"
        >
          Voltar ao inicio
        </button>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Studios Tatto</p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">Localização e Informações da Loja</h1>
          <p className="mt-4 max-w-3xl text-neutral-300">
            Aqui você encontra endereço, mapa, horários e canais oficiais para falar com o estúdio.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="text-neutral-100" size={22} />
              <h2 className="text-xl font-semibold">Endereço da Loja</h2>
            </div>

            {loading ? <p className="text-neutral-400">Carregando...</p> : null}

            {!loading && addressLines.length === 0 ? (
              <p className="text-neutral-400">Endereço ainda não cadastrado.</p>
            ) : null}

            {addressLines.length > 0 ? (
              <div className="space-y-1 text-neutral-200">
                <p className="font-medium">{location?.name || 'Studios Tatto'}</p>
                {addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}

            {location?.reference ? (
              <p className="mt-4 text-sm text-neutral-300">Referencia: {location.reference}</p>
            ) : null}
            {location?.parkingInfo ? (
              <p className="mt-2 text-sm text-neutral-300">Estacionamento: {location.parkingInfo}</p>
            ) : null}
          </article>

          <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Clock3 className="text-neutral-100" size={22} />
              <h2 className="text-xl font-semibold">Horários</h2>
            </div>

            {(location?.openingHours || []).length === 0 ? (
              <p className="text-neutral-400">Horários ainda não cadastrados.</p>
            ) : (
              <div className="space-y-2">
                {(location?.openingHours || []).map((item) => {
                  const label = dayLabels[item.dayOfWeek] || 'Dia';
                  const value = item.isClosed
                    ? 'Fechado'
                    : `${item.opensAt || ''} - ${item.closesAt || ''}`.trim();
                  return (
                    <div key={`${label}-${item.opensAt}-${item.closesAt}`} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-300">{label}</span>
                      <span className="text-neutral-100">{item.note ? `${value} (${item.note})` : value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Contato e Redes</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-wide text-neutral-400">Contatos</h3>
              {contacts.length === 0 ? <p className="text-neutral-400">Sem contatos cadastrados.</p> : null}
              {contacts.map((item) => {
                const href = item.linkUrl || (item.kind === 'email' ? `mailto:${item.value}` : null);
                const Icon = item.kind === 'email' ? Mail : Phone;
                return (
                  <div key={item.id} className="rounded-lg border border-neutral-800 p-3">
                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">{item.label || item.kind}</p>
                    {href ? (
                      <a href={href} className="inline-flex items-center gap-2 text-neutral-100 hover:text-white">
                        <Icon size={16} />
                        {item.value}
                      </a>
                    ) : (
                      <p className="inline-flex items-center gap-2 text-neutral-100">
                        <Icon size={16} />
                        {item.value}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-wide text-neutral-400">Redes sociais</h3>
              {social.length === 0 ? <p className="text-neutral-400">Sem redes cadastradas.</p> : null}
              {social.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-neutral-800 px-3 py-3 text-neutral-100 hover:border-neutral-500"
                >
                  <span>{item.label || item.platform}</span>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          </div>
        </section>

        {location?.mapEmbedUrl ? (
          <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <iframe
              src={location.mapEmbedUrl}
              title="Mapa Studios Tatto"
              className="h-[360px] w-full"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}
