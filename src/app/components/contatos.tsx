import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { toWhatsappLink } from '../utils/formatters';

type ContactInfoItem = {
  id: string;
  kind: string;
  label?: string | null;
  value: string;
  linkUrl?: string | null;
};

const labelByKind: Record<string, string> = {
  phone: 'Telefone',
  email: 'Email',
  address: 'Endereco',
  hours: 'Horario',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

const iconByKind: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  email: Mail,
  address: MapPin,
  hours: Clock,
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
};

const buildLink = (info: ContactInfoItem) => {
  if (info.linkUrl) {
    return info.linkUrl;
  }
  if (info.kind === 'phone') {
    return `tel:${info.value}`;
  }
  if (info.kind === 'email') {
    return `mailto:${info.value}`;
  }
  if (info.kind === 'whatsapp') {
    return toWhatsappLink(info.value);
  }
  return null;
};

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfoItem[]>([]);
  const [infoError, setInfoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info');
        if (!response.ok) {
          throw new Error('Falha ao carregar contatos');
        }
        const data = (await response.json()) as ContactInfoItem[];
        if (isMounted) {
          setContactInfo(data);
        }
      } catch (error) {
        console.error('Erro ao carregar contatos', error);
        if (isMounted) {
          setInfoError('Nao foi possivel carregar os contatos.');
        }
      }
    };

    loadContactInfo();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar contato');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar contato', error);
      setSubmitError('Nao foi possivel enviar sua mensagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoItems = contactInfo.filter((info) => info.kind !== 'other');
  const infoExtras = contactInfo.filter((info) => info.kind === 'other');

  return (
    <section id="contato" ref={ref} className="py-20 px-4 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-4 tracking-wide">
            CONTATE-NOS
          </h2>
          <p className="text-neutral-400 text-lg">
            Entre em contato conosco e agende sua sessao
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 mb-8"
            >
              {infoError ? (
                <p className="text-sm text-red-400">{infoError}</p>
              ) : null}
              {infoItems.map((info, index) => {
                const Icon = iconByKind[info.kind] || MapPin;
                const link = buildLink(info);
                const title = info.label || labelByKind[info.kind] || 'Contato';
                return (
                  <motion.div
                    key={info.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="bg-neutral-700 p-3 rounded-lg">
                      <Icon className="w-6 h-6 text-neutral-100" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-100 mb-1">
                        {title}
                      </h3>
                      {link ? (
                        <a
                          href={link}
                          className="text-neutral-400 hover:text-neutral-100 transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-neutral-400">{info.value}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {infoExtras.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-neutral-800/50 border border-neutral-700 p-6 rounded-lg text-neutral-100"
              >
                <h3 className="text-xl font-bold mb-3">Informacoes Importantes</h3>
                <ul className="space-y-2 text-neutral-300 text-sm">
                  {infoExtras.map((item) => (
                    <li key={item.id}>• {item.value}</li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-neutral-800/50 border border-neutral-700 p-8 rounded-lg"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">✓</div>
                <p className="text-neutral-100 text-xl font-semibold mb-2">
                  Mensagem Enviada!
                </p>
                <p className="text-neutral-400">
                  Entraremos em contato em breve.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-neutral-300 mb-2 text-sm">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-700 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-2 text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-700 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-2 text-sm">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-700 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    placeholder="(27) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-2 text-sm">
                    Mensagem
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-700 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
                    placeholder="Conte-nos sobre a tatuagem que voce deseja..."
                  />
                </div>

                {submitError ? (
                  <p className="text-sm text-red-400">{submitError}</p>
                ) : null}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 36px rgba(255,255,255,0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isSubmitting}
                  className="group relative overflow-hidden w-full px-6 py-4 bg-white text-neutral-900 rounded-xl font-bold tracking-wide shadow-[0_0_16px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-neutral-300/40 to-transparent skew-x-12" />
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
                  <Send size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
