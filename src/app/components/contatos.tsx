import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria enviado para um backend
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefone',
      content: '+55 27 98806-3942',
      link: 'tel:+5527988063942',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'contato@studiostatto.com',
      link: 'mailto:contato@studiostatto.com',
    },
    {
      icon: MapPin,
      title: 'Endereço',
      content: 'Rua das Artes, 123 - Lisboa',
      link: '#localizacao',
    },
    {
      icon: Clock,
      title: 'Horário',
      content: 'Seg-Sáb: 10h-20h',
      link: null,
    },
  ];

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
            Entre em contato conosco e agende sua sessão
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 mb-8"
            >
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="bg-neutral-700 p-3 rounded-lg">
                    <info.icon className="w-6 h-6 text-neutral-100" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-100 mb-1">
                      {info.title}
                    </h3>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-neutral-400 hover:text-neutral-100 transition-colors"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-neutral-400">{info.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-neutral-800/50 border border-neutral-700 p-6 rounded-lg text-neutral-100"
            >
              <h3 className="text-xl font-bold mb-3">Informações Importantes</h3>
              <ul className="space-y-2 text-neutral-300 text-sm">
                <li>• Atendemos apenas com hora marcada</li>
                <li>• Consulta inicial gratuita</li>
                <li>• Orçamento sem compromisso</li>
                <li>• Aceitamos cartão, dinheiro e PIX</li>
              </ul>
            </motion.div>
          </div>

          {/* Contact Form */}
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
                    placeholder="+55 27 98806-3942"
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
                    placeholder="Conte-nos sobre a tatuagem que você deseja..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-neutral-100 text-neutral-900 rounded-lg font-semibold hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <span>Enviar Mensagem</span>
                  <Send size={20} />
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
