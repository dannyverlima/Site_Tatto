import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  Mail, Phone, MapPin, Clock, Send,
  Instagram, Facebook, MessageCircle,
} from 'lucide-react';
import { toWhatsappLink } from '../utils/formatters';

/* ─── tipos ─── */
type ContactInfoItem = {
  id: string;
  kind: string;
  label?: string | null;
  value: string;
  linkUrl?: string | null;
};

type OpeningHour = {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  note: string | null;
  isClosed: boolean;
};

type LocationInfo = {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  mapEmbedUrl?: string | null;
  reference?: string | null;
  openingHours?: OpeningHour[];
};

/* ─── helpers ─── */
const labelByKind: Record<string, string> = {
  phone: 'Telefone', email: 'Email', address: 'Endereço',
  hours: 'Horário', whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook',
};

const iconByKind: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  phone: Phone, email: Mail, address: MapPin,
  hours: Clock, whatsapp: MessageCircle, instagram: Instagram, facebook: Facebook,
};

const buildLink = (info: ContactInfoItem): string | null => {
  if (info.linkUrl) return info.linkUrl;
  if (info.kind === 'phone') return `tel:${info.value}`;
  if (info.kind === 'email') return `mailto:${info.value}`;
  if (info.kind === 'whatsapp') return toWhatsappLink(info.value);
  return null;
};

const formatAddress = (loc: LocationInfo): string[] =>
  [
    [loc.addressLine1, loc.addressLine2].filter(Boolean).join(' '),
    [loc.city, loc.state].filter(Boolean).join(' / '),
    loc.postalCode,
    loc.country,
  ].filter((v): v is string => !!v && v.trim().length > 0);

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const spring = { type: 'spring', stiffness: 380, damping: 18 } as const;

/* ═══════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════ */
export function ContatoLocalizacao() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  /* — dados contato — */
  const [contactInfo, setContactInfo] = useState<ContactInfoItem[]>([]);
  const [mainWhatsapp, setMainWhatsapp] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* — dados localização — */
  const [location, setLocation] = useState<LocationInfo | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch('/api/contact-info')
      .then((r) => r.json())
      .then((d) => { if (mounted) setContactInfo(Array.isArray(d) ? d : []); })
      .catch(() => {});

    fetch('/api/location')
      .then((r) => r.json())
      .then((d) => { if (mounted) setLocation(d as LocationInfo | null); })
      .catch(() => {});

    fetch('/api/site-settings?keys=main_whatsapp')
      .then((r) => r.json())
      .then((d) => { if (mounted && d.main_whatsapp) setMainWhatsapp(d.main_whatsapp); })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const r = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!r.ok) throw new Error();
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
      }, 3000);
    } catch {
      setSubmitError('Não foi possível enviar sua mensagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoItems = contactInfo
    .filter((i) => i.kind !== 'other')
    .map((i) => i.kind === 'whatsapp' && mainWhatsapp ? { ...i, linkUrl: mainWhatsapp } : i);
  const addressLines = location ? formatAddress(location) : [];
  const openingHours = location?.openingHours ?? [];

  return (
    <section id="contato" ref={ref} className="py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">

        {/* título */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-4 tracking-wide">
            CONTATO & LOCALIZAÇÃO
          </h2>
          <p className="text-neutral-400 text-lg">
            Fale conosco ou encontre-nos
          </p>
        </motion.div>

        {/* grid principal: mapa+endereço | formulário */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* ── COLUNA ESQUERDA: mapa + endereço ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            {/* mapa */}
            {location?.mapEmbedUrl ? (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="aspect-video w-full bg-neutral-800">
                  <iframe
                    src={location.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização"
                  />
                </div>
              </div>
            ) : (
              /* placeholder quando mapa não está cadastrado */
              <div className="aspect-video w-full rounded-2xl border border-white/10 bg-neutral-900 flex items-center justify-center">
                <MapPin size={40} className="text-neutral-700" />
              </div>
            )}

            {/* endereço abaixo do mapa */}
            {addressLines.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800">
                  <MapPin size={18} className="text-neutral-100" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Endereço</p>
                  <p className="text-neutral-200 text-sm leading-relaxed">
                    {addressLines.map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </p>
                </div>
              </div>
            )}

            {/* horários (compacto) */}
            {openingHours.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={15} className="text-neutral-400" />
                  <p className="text-xs uppercase tracking-widest text-neutral-500">Funcionamento</p>
                </div>
                <div className="space-y-1.5">
                  {openingHours.map((item) => {
                    const label = dayLabels[item.dayOfWeek] ?? 'Dia';
                    const hours = item.isClosed
                      ? 'Fechado'
                      : `${item.opensAt ?? ''} – ${item.closesAt ?? ''}`.trim();
                    return (
                      <div
                        key={`${label}-${item.opensAt}-${item.closesAt}`}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-neutral-300">{label}</span>
                        <span className="text-neutral-500">
                          {item.note ? `${hours} (${item.note})` : hours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* ── COLUNA DIREITA: contate-nos ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* info de contato */}
            {infoItems.length > 0 && (
              <div className="space-y-4">
                {infoItems.map((info) => {
                  const Icon = iconByKind[info.kind] ?? MapPin;
                  const link = buildLink(info);
                  const title = info.label || labelByKind[info.kind] || 'Contato';
                  return (
                    <div key={info.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-800">
                        <Icon size={16} className="text-neutral-100" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-neutral-500">{title}</p>
                        {link ? (
                          <a href={link} className="text-neutral-200 text-sm hover:text-white transition-colors">
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-neutral-200 text-sm">{info.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* formulário */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
              <p className="text-xs uppercase tracking-widest text-neutral-500 mb-5">Enviar mensagem</p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black text-2xl font-bold">
                    ✓
                  </div>
                  <p className="text-neutral-100 font-semibold mb-1">Mensagem Enviada!</p>
                  <p className="text-neutral-500 text-sm">Entraremos em contato em breve.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {(['name', 'email', 'phone'] as const).map((field) => (
                    <input
                      key={field}
                      type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      required
                      value={formData[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      placeholder={
                        field === 'name' ? 'Nome completo' :
                        field === 'email' ? 'seu@email.com' : '(27) 00000-0000'
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
                    />
                  ))}

                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    placeholder="Conte-nos sobre a tatuagem que deseja..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none"
                  />

                  {submitError && <p className="text-sm text-red-400">{submitError}</p>}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={spring}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? 'Enviando…' : 'Enviar Mensagem'}
                    <Send size={15} />
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
