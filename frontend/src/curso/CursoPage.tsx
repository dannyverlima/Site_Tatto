import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  X, Phone, MapPin, Instagram, Facebook, MessageCircle,
  Award, BookOpen, TrendingUp, Headphones,
  ChevronLeft, ChevronRight, Check, Star,
  Shield, FileText, Activity, Wrench, Syringe, Users,
} from 'lucide-react';
// ─── Todas as imagens ficam em frontend/public/media/ ─────────────────────
const cursoBg = '/media/curso-bg.png';
const CURSO_LOGO_URL = '/media/curso-logo.png';
const CURSO_TITULO_URL = '/media/curso-titulo.png';
const MARKIN_FOTO_URL = '/media/markin-foto.jpg';

// ─── Constants ─────────────────────────────────────────────────────────────
const WA_NUMBER = '5527988063942';
const WA_URL = 'https://api.whatsapp.com/message/5QLGPVKNZKX3B1?autoload=1&app_absent=0&utm_source=ig';
const PHONE_DISPLAY = '(27) 9 8806 3942';
const ADDRESS = 'Rodovia Governador Mário Covas, nº 1990, Jardim Limoeiro – Serra, ES';

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C96A';

// ─── Testimonials ──────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Ana Luisa Dei Santi',
    text: 'O curso me agregou muito, você explica e ensina muito bem, tá sempre ali pra ajudar e até mesmo depois do curso vc sempre tá ali pra tirar dúvidas, ajudar com o melhor possível. Excelente o curso, o ensino a didática etc.',
    stars: 5,
  },
  {
    name: 'Anthony Kayan',
    text: 'O curso fez uma grande mudança na minha vida, o professor Marcos te passa técnicas que agregam muito, consegui me torna um profissional em pouco tempo, apenas usando as técnicas que ele me passou. Com 6 meses de tatuador já tenho minha máquina própria, trabalho em estudio profissional e tenho meus equipamentos.',
    stars: 5,
  },
  {
    name: 'Douglas Furtado',
    text: 'Eu achei maravilhoso vc explica tudo certo e tem paciência de ensinar as pessoas eu gostei bastante. Eu aconselho as pessoas a fazer também!',
    stars: 5,
  },
  {
    name: 'Joyce Souza',
    text: 'Quero agradecer pela compreensão e pela paciência que vc teve comigo, também por estar abrindo porta de curso em nosso bairro, através do seu curso eu encontrei o que realmente gosto de fazer, obrigada pelo seu carisma e pela sua motivação em me ajudar a ser melhor. Aulas extremamente boas e com um ensinamento impecável!',
    stars: 5,
  },
  {
    name: 'Camili Martins',
    text: 'Eu achei muito bom de verdade, você tem muita paciência para explicar e as técnicas são ótimas. E pra quem quer um curso de iniciante assim como eu queria ele é ótimo porque explica tudo desde montar o equipamento até a tatuagem.',
    stars: 5,
  },
];

// ─── Variants ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── Reusable section wrapper ───────────────────────────────────────────────
function Section({ id, className = '', children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`relative px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}

// ─── Scroll progress bar ────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div
      style={{ scaleX, transformOrigin: 'left', backgroundColor: GOLD }}
      className="fixed top-0 left-0 right-0 h-[3px] z-[100]"
    />
  );
}

// ─── Floating nav ───────────────────────────────────────────────────────────
function FloatingNav({ onCTA }: { onCTA: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <nav className={`fixed top-3 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-8 py-3 mx-3 sm:mx-8 rounded-2xl transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-xl border border-white/8 shadow-2xl' : 'bg-transparent'}`}>
      <span className="text-white font-bold text-sm sm:text-base tracking-widest uppercase" style={{ color: GOLD }}>Studio Markin</span>
      <button
        onClick={onCTA}
        className="text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 rounded-full transition-all duration-300"
        style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}
      >
        Matricular-se
      </button>
    </nav>
  );
}

// Regex para validação básica de e-mail no cliente
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Modal ──────────────────────────────────────────────────────────────────
function Modal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ nome: '', whatsapp: '', email: '', cidade: '', experiencia: 'nenhuma' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar formato de e-mail antes de enviar
    if (!EMAIL_RE.test(form.email)) {
      setError('Digite um e-mail válido.');
      return;
    }

    setLoading(true);

    try {
      // Enviar dados ao backend: salva no banco e dispara e-mail para dannyverlima@gmail.com
      const response = await fetch('/api/course-enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          whatsapp: form.whatsapp,
          email: form.email,
          cidade: form.cidade,
          experiencia: form.experiencia,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao enviar inscrição');
      }
    } catch (err: any) {
      setError(err.message || 'Não foi possível enviar sua inscrição. Verifique sua conexão e tente novamente.');
      setLoading(false);
      return;
    }

    setLoading(false);
    setSent(true);
  };

  useEffect(() => {
    if (open) { setSent(false); setError(''); setForm({ nome: '', whatsapp: '', email: '', cidade: '', experiencia: 'nenhuma' }); }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden"
            style={{ background: '#0B0B0B', border: `1px solid ${GOLD}30` }}
          >
            {/* Gold top bar */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />

            <div className="p-6 sm:p-8">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>

              {sent ? (
                <div className="text-center py-8">
                  <div className="mb-4 mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}` }}>
                    <Check className="h-8 w-8" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Inscrição feita com sucesso!</h3>
                  <p className="text-white/60 text-sm mb-6">Entraremos em contato no seu número. Aguarde!</p>
                  <button onClick={onClose} className="px-8 py-2.5 rounded-full font-bold text-black text-sm" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>Fechar</button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Faça sua Matrícula</h2>
                    <p className="text-sm" style={{ color: GOLD }}>Curso de Tatuagem Prática – Studio Markin</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {[
                      { name: 'nome', label: 'Nome completo', placeholder: 'Seu nome', type: 'text' },
                      { name: 'whatsapp', label: 'WhatsApp', placeholder: '+55 (27) 9 0000-0000', type: 'tel' },
                      { name: 'email', label: 'E-mail', placeholder: 'seu@email.com', type: 'email' },
                      { name: 'cidade', label: 'Cidade', placeholder: 'Sua cidade', type: 'text' },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-xs font-medium text-white/60 mb-1">{field.label}</label>
                        <input
                          required
                          type={field.type}
                          name={field.name}
                          value={(form as any)[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
                          style={{ background: '#181818', border: '1px solid #2a2a2a' }}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-1">Experiência com tatuagem</label>
                      <select
                        name="experiencia"
                        value={form.experiencia}
                        onChange={handleChange}
                        className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                        style={{ background: '#181818', border: '1px solid #2a2a2a' }}
                      >
                        <option value="nenhuma">Nenhuma – sou iniciante</option>
                        <option value="basica">Básica – já pratiquei um pouco</option>
                        <option value="intermediaria">Intermediária – já tatuo informalmente</option>
                        <option value="avancada">Avançada – quero aperfeiçoar</option>
                      </select>
                    </div>

                    {/* Mensagem de erro exibida abaixo dos campos */}
                    {error && (
                      <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ color: '#ff6b6b', background: '#ff6b6b18', border: '1px solid #ff6b6b30' }}>
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3 rounded-full font-bold text-black text-sm transition-all duration-300 disabled:opacity-60"
                      style={{
                        background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                        boxShadow: `0 0 24px ${GOLD}50`,
                      }}
                    >
                      {loading ? 'Enviando...' : 'Enviar Inscrição'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Stars ──────────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-current" style={{ color: GOLD }} />
      ))}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function CursoPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [logoFailed, setLogoFailed] = useState(false);
  const [tituloFailed, setTituloFailed] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  // Carousel auto-advance
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prevT = useCallback(() => setTestimonialIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), []);
  const nextT = useCallback(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), []);

  const openModal = () => setModalOpen(true);

  const inViewOpts = { once: true, amount: 0.15 };

  return (
    <div className="min-h-screen" style={{ background: '#000', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <ScrollProgress />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
        {/* Parallax background */}
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY }}>
          <img src={cursoBg} alt="" aria-hidden className="h-[120%] w-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.25) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.98) 100%)' }} />
        </motion.div>

        {/* Conteúdo — canto inferior esquerdo */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pb-16 sm:pb-20 flex flex-col items-start">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="mb-3"
          >
            {!logoFailed ? (
              <img
                src={CURSO_LOGO_URL}
                alt="Curso de Tatuagem Prática – Studio Markin Tattoo"
                onError={() => setLogoFailed(true)}
                className="drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)]"
                style={{ height: 'clamp(80px, 14vw, 160px)', width: 'auto' }}
              />
            ) : (
              <div>
                <p className="text-xs tracking-[0.4em] uppercase" style={{ color: GOLD }}>Curso de</p>
                <h1 className="text-4xl sm:text-6xl font-black uppercase leading-none text-white">TATUAGEM PRÁTICA</h1>
                <p className="text-xs tracking-[0.3em] uppercase mt-1" style={{ color: GOLD }}>Studio Markin Tattoo</p>
              </div>
            )}
          </motion.div>

          {/* Título — maior que a logo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mb-5"
          >
            {!tituloFailed ? (
              <img
                src={CURSO_TITULO_URL}
                alt="Curso Presencial com Aulas Práticas e Teóricas"
                onError={() => setTituloFailed(true)}
                className="drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
                style={{ height: 'clamp(90px, 18vw, 220px)', width: 'auto' }}
              />
            ) : (
              <p className="text-3xl sm:text-5xl font-black uppercase tracking-wide text-white leading-tight">
                CURSO PRESENCIAL<br />
                COM AULAS <span style={{ color: GOLD }}>PRÁTICAS</span><br />
                E TEÓRICAS
              </p>
            )}
          </motion.div>

          {/* Separador ornamental */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex items-center gap-3 mb-7 origin-left"
          >
            <div className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
            <span style={{ color: GOLD, fontSize: '0.75rem', letterSpacing: '0.35em' }}>✦ ✦ ✦</span>
            <div className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
          </motion.div>

          {/* Botão sofisticado */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            whileTap={{ scale: 0.97 }}
            onClick={openModal}
            className="group relative overflow-hidden text-xs sm:text-sm font-black uppercase tracking-[0.3em] transition-all duration-500"
            style={{ letterSpacing: '0.28em' }}
          >
            {/* Fundo com gradiente dourado */}
            <span
              className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
              style={{
                background: `linear-gradient(90deg, ${GOLD}22, ${GOLD}44, ${GOLD}22)`,
                border: `1px solid ${GOLD}88`,
              }}
            />
            {/* Fundo sólido no hover */}
            <span
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }}
            />
            {/* Brilho deslizante */}
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
            />
            <span className="relative px-10 sm:px-14 py-3.5 sm:py-4 flex items-center gap-3 text-white group-hover:text-black transition-colors duration-500">
              <span>QUERO ME MATRICULAR</span>
              <span className="text-base transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </motion.button>
        </div>
      </section>

      {/* ── 2. NOSSO OBJETIVO ───────────────────────────────────────────── */}
      <Section id="objetivo" className="py-20 md:py-28" style={{ background: '#04100A' } as React.CSSProperties}>
        <motion.div
          variants={stagger} initial="hidden" whileInView="visible" viewport={inViewOpts}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: GOLD }}>Sobre o curso</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-8">
            Nosso <span style={{ color: GOLD }}>objetivo</span>
          </motion.h2>
          <motion.div variants={fadeUp} className="w-20 h-px mx-auto mb-10" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-white/75 leading-relaxed max-w-3xl mx-auto">
            Nosso curso presencial tem como propósito <strong className="text-white">formar novos profissionais</strong> e impulsionar sua carreira na tatuagem de maneira ágil, segura e altamente eficaz. Com uma didática prática e acessível, o treinamento habilita o estudante a iniciar sua trajetória no mercado da tatuagem <strong className="text-white">do zero</strong>.
          </motion.p>
        </motion.div>
      </Section>

      {/* ── 3. QUEM É MARKIN ────────────────────────────────────────────── */}
      <Section id="markin" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Photo placeholder */}
            <motion.div
              variants={fadeLeft} initial="hidden" whileInView="visible" viewport={inViewOpts}
              className="relative rounded-3xl overflow-hidden aspect-[4/5] max-w-sm mx-auto md:mx-0 w-full"
              style={{ border: `1px solid ${GOLD}30` }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B0B0B, #181818)' }}>
                <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center" style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}40` }}>
                  <Users className="h-10 w-10" style={{ color: GOLD }} />
                </div>
                <p className="text-white/40 text-xs text-center px-4">Adicione a foto do Markin<br />em /public/media/markin-foto.jpg</p>
              </div>
              {/* If photo exists overlay */}
              <img
                src={MARKIN_FOTO_URL}
                alt="Marcos Santos – Markin Tatuador"
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />
              {/* Gold corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 rounded-tl-lg" style={{ borderTop: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
              <div className="absolute bottom-4 right-4 w-8 h-8 rounded-br-lg" style={{ borderBottom: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />
            </motion.div>

            {/* Bio */}
            <motion.div variants={fadeRight} initial="hidden" whileInView="visible" viewport={inViewOpts}>
              <p className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: GOLD }}>Conheça o professor</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Quem é o <br /><span style={{ color: GOLD }}>Markin Tatuador?</span>
              </h2>
              <div className="space-y-4 text-white/70 text-sm sm:text-base leading-relaxed">
                <p>
                  <strong className="text-white">Marcos Santos</strong> atua a mais de 10 anos, destaca-se fortemente no <strong className="text-white">Realismo Preto e Cinza (Black & Grey)</strong>, retratando com alta precisão rostos, figuras mitológicas, guerreiros, animais e imagens religiosas.
                </p>
                <p>
                  Já estudou com os maiores nomes do mundo da tatuagem nacional, fez diversos cursos sobre técnicas de tatuagem, além de cursos voltados para artes como desenho e pintura.
                </p>
                <p>
                  Já participou de muitos eventos de tatuagem do país e possui diversos prêmios na sua área. <strong className="text-white">Ministra cursos e mentoria particulares desde 2022.</strong>
                </p>
                <p>
                  CEO de um estúdio privativo localizado na Rodovia Governador Mário Covas, nº 1990, Jardim Limoeiro, Serra – ES.
                </p>
              </div>
              <button
                onClick={openModal}
                className="mt-8 px-8 py-3 rounded-full font-bold text-black text-sm uppercase tracking-widest transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, boxShadow: `0 0 24px ${GOLD}40` }}
              >
                Quero aprender com ele
              </button>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── 4. O QUE VOU APRENDER ───────────────────────────────────────── */}
      <Section id="aprender" className="py-20 md:py-28" style={{ background: '#04100A' } as React.CSSProperties}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={inViewOpts} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: GOLD }}>Conteúdo programático</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl md:text-6xl font-bold text-white">
              O que vou <span style={{ color: GOLD }}>aprender?</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={inViewOpts}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <Activity className="h-8 w-8" />, title: 'Histologia da Pele',
                desc: 'Falamos sobre histologia da pele e como a tatuagem se deposita na derme. Fundamentos científicos essenciais para tatuar com segurança.',
              },
              {
                icon: <Shield className="h-8 w-8" />, title: 'Biossegurança',
                desc: 'Ações voltadas para a prevenção, proteção e minimização de riscos, visando a saúde do homem, dos animais e a preservação do meio ambiente.',
              },
              {
                icon: <FileText className="h-8 w-8" />, title: 'Aspectos Legais',
                desc: 'Legislação para que as práticas adequadas do gerenciamento de resíduos de saúde sejam adotadas pelo empreendedor responsável pelo estúdio.',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                whileHover={{ y: -8, boxShadow: `0 20px 60px ${GOLD}20` }}
                className="rounded-2xl p-7 flex flex-col gap-4 transition-all duration-300 cursor-default"
                style={{ background: '#0B0B0B', border: `1px solid #1A1A1A` }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}15`, color: GOLD }}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{card.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── 5. CONTEÚDO EXTRA ───────────────────────────────────────────── */}
      <Section id="conteudo" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={inViewOpts} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: GOLD }}>E muito mais</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl md:text-6xl font-bold text-white">
              Conteúdo <span style={{ color: GOLD }}>extra</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={inViewOpts}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {[
              {
                img: '/media/equipamentos.png',
                icon: <Wrench className="h-10 w-10" />, title: 'Equipamentos',
                desc: 'A estimativa de todos os equipamentos e materiais que o profissional precisa para iniciar suas atividades. Do zero, sem surpresas.',
              },
              {
                img: '/media/agulhas.png',
                icon: <Syringe className="h-10 w-10" />, title: 'Tipos de Agulhas',
                desc: 'Aprenda sobre cada tipo de agulha, as especificações de quantidades e diâmetro e para que podem ser usadas.',
              },
              {
                img: '/media/pele.png',
                icon: <Users className="h-10 w-10" />, title: 'Exercícios em Pele Artificial',
                desc: 'Preparação do decalque e aplicação, preparação da pele, assepsia e tricotomia, montagem dos equipamentos.',
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
                style={{ background: '#0B0B0B', border: `1px solid #1A1A1A` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ color: GOLD }}>
                    {card.icon}
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <h3 className="text-base font-bold text-white uppercase tracking-wide mb-2">{card.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={inViewOpts}
            className="text-center text-3xl sm:text-4xl font-black text-white"
          >
            E muito <span style={{ color: GOLD }}>mais!</span>
          </motion.p>
        </div>
      </Section>

      {/* ── 6. BENEFÍCIOS ───────────────────────────────────────────────── */}
      <Section id="beneficios" className="py-20 md:py-28" style={{ background: '#04100A' } as React.CSSProperties}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={inViewOpts} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: GOLD }}>Vantagens</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl md:text-6xl font-bold text-white">
              Aqui você <span style={{ color: GOLD }}>tem</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={inViewOpts}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {[
              { icon: <TrendingUp className="h-8 w-8" />, label: 'Evolução rápida e descomplicada' },
              { icon: <Headphones className="h-8 w-8" />, label: 'Suporte especial para os alunos' },
              { icon: <BookOpen className="h-8 w-8" />, label: 'Apostilas autoexplicativas' },
              { icon: <Award className="h-8 w-8" />, label: 'Certificado de conclusão' },
            ].map((b) => (
              <motion.div
                key={b.label}
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center text-center gap-4"
              >
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    border: `2px solid ${GOLD}`,
                    background: `${GOLD}10`,
                    color: GOLD,
                    boxShadow: `0 0 28px ${GOLD}25`,
                  }}
                >
                  {b.icon}
                </div>
                <p className="text-sm sm:text-base font-semibold text-white leading-snug">{b.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={inViewOpts}
            className="text-center mt-12 text-sm text-white/50 italic"
          >
            OBS: O studio disponibiliza os materiais necessários para prática dos exercícios.
          </motion.p>
        </div>
      </Section>

      {/* ── 7. DO ZERO AO AVANÇADO ──────────────────────────────────────── */}
      <Section id="metodologia" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={inViewOpts}>
            <p className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: GOLD }}>Metodologia</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              Aprenda a tatuar
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-8" style={{ color: GOLD }}>
              do zero ao avançado
            </h2>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-4">
              Curso Presencial de Tatuagem com Marcos Santos
            </p>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4">
              Se você busca se destacar no mercado da tatuagem, esta é a sua oportunidade. O tatuador Marcos Santos ministrará um curso presencial exclusivo na cidade de Serra (ES), compartilhando as técnicas avançadas que utiliza para alcançar uma pigmentação impecável e resultados de alto impacto.
            </p>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Com uma metodologia que vai do nível iniciante ao avançado, o treinamento une uma base teórica sólida a uma intensa carga horária prática. Todo o aprendizado prático será realizado inicialmente em pele artificial, garantindo que o aluno desenvolva a coordenação e a confiança necessárias para a profissão.
            </p>
          </motion.div>

          <motion.div
            variants={fadeRight} initial="hidden" whileInView="visible" viewport={inViewOpts}
            className="space-y-4"
          >
            {[
              { text: 'Método validado por centenas de alunos', detail: 'Técnicas aprovadas em mais de 10 anos de prática' },
              { text: 'Prática real em pele artificial', detail: 'Do primeiro traço até a tatuagem completa' },
              { text: 'Suporte pós-curso pelo professor', detail: 'Marcos está sempre disponível para dúvidas' },
              { text: 'Certificado de conclusão reconhecido', detail: 'Comprove sua formação para clientes e estúdios' },
              { text: 'Materiais fornecidos pelo studio', detail: 'Sem custo extra para praticar durante o curso' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={inViewOpts}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start p-4 rounded-xl"
                style={{ background: '#0B0B0B', border: '1px solid #1A1A1A' }}
              >
                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${GOLD}20`, color: GOLD }}>
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.text}</p>
                  <p className="text-white/45 text-xs mt-0.5">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── 8. INVESTIMENTO ─────────────────────────────────────────────── */}
      <Section id="investimento" className="py-20 md:py-28" style={{ background: '#04100A' } as React.CSSProperties}>
        <div className="max-w-2xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={inViewOpts}>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: GOLD }}>Valor do curso</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-white mb-10">Investimento</motion.h2>

            <motion.div
              variants={fadeUp}
              className="rounded-3xl p-8 sm:p-12 mb-8"
              style={{ background: '#0B0B0B', border: `1px solid ${GOLD}40`, boxShadow: `0 0 60px ${GOLD}15` }}
            >
              <p className="text-white/50 text-sm mb-2">Valor total à vista</p>
              <p className="text-5xl sm:text-7xl font-black text-white mb-2">
                R$ <span style={{ color: GOLD }}>5.000</span><span className="text-3xl sm:text-5xl">,00</span>
              </p>

              <div className="my-6 h-px w-32 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}50, transparent)` }} />

              <p className="text-white/60 text-sm mb-1">ou parcelado</p>
              <p className="text-xl sm:text-2xl font-bold text-white mb-1">
                R$ 5.749 em <span style={{ color: GOLD }}>12X</span> no cartão
              </p>
              <p className="text-white/40 text-xs">(12 × R$ 479,08)</p>

              <div className="mt-6 p-4 rounded-xl" style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}20` }}>
                <p className="text-white/60 text-xs">
                  ⚠️ O valor do curso é pago <strong className="text-white">antes de iniciar as aulas</strong>.
                </p>
              </div>
            </motion.div>

            {/* WhatsApp CTA */}
            <motion.a
              variants={fadeUp}
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(37,211,102,0.5)' }}
              whileTap={{ scale: 0.97 }}
              animate={{ boxShadow: ['0 0 20px rgba(37,211,102,0.25)', '0 0 40px rgba(37,211,102,0.45)', '0 0 20px rgba(37,211,102,0.25)'] }}
              transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white text-base uppercase tracking-widest"
              style={{ background: '#25D366', boxShadow: '0 0 24px rgba(37,211,102,0.35)' }}
            >
              <MessageCircle className="h-5 w-5" />
              {PHONE_DISPLAY}
            </motion.a>
            <p className="mt-3 text-white/40 text-xs">Entre em contato para mais informações</p>
          </motion.div>
        </div>
      </Section>

      {/* ── 9. DEPOIMENTOS ──────────────────────────────────────────────── */}
      <Section id="depoimentos" className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={inViewOpts} className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: GOLD }}>O que dizem nossos alunos</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl md:text-6xl font-bold text-white">
              Feedback dos <span style={{ color: GOLD }}>alunos</span>
            </motion.h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.45 }}
                className="rounded-3xl p-8 sm:p-10"
                style={{ background: '#0B0B0B', border: `1px solid ${GOLD}25` }}
              >
                <Stars n={TESTIMONIALS[testimonialIdx].stars} />
                <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6 italic">
                  "{TESTIMONIALS[testimonialIdx].text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-sm" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
                    {TESTIMONIALS[testimonialIdx].name.charAt(0)}
                  </div>
                  <p className="font-semibold text-white">{TESTIMONIALS[testimonialIdx].name}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={prevT}
                className="w-11 h-11 rounded-full flex items-center justify-center transition hover:scale-110"
                style={{ border: `1px solid ${GOLD}40`, color: GOLD }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{ background: i === testimonialIdx ? GOLD : `${GOLD}30`, transform: i === testimonialIdx ? 'scale(1.4)' : 'scale(1)' }}
                  />
                ))}
              </div>
              <button
                onClick={nextT}
                className="w-11 h-11 rounded-full flex items-center justify-center transition hover:scale-110"
                style={{ border: `1px solid ${GOLD}40`, color: GOLD }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 10. CTA FINAL ───────────────────────────────────────────────── */}
      <Section id="matricula" className="py-20 md:py-28" style={{ background: '#000' } as React.CSSProperties}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: info */}
          <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={inViewOpts}>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 leading-tight">
              Faça sua<br />
              <span style={{ color: GOLD }}>Matrícula agora</span>
            </h2>
            <p className="text-white/55 text-base mb-8">E alcance a sua independência financeira.</p>

            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 0 40px ${GOLD}60` }}
              whileTap={{ scale: 0.97 }}
              onClick={openModal}
              className="mb-8 px-10 py-3.5 rounded-full font-black text-black text-sm uppercase tracking-widest"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, boxShadow: `0 0 24px ${GOLD}40` }}
            >
              QUERO ME MATRICULAR
            </motion.button>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-white/70 text-sm">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: GOLD }} />
                <div>
                  <p className="font-semibold text-white text-xs uppercase tracking-wider mb-0.5">Endereço</p>
                  <p>{ADDRESS}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <Phone className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="font-semibold text-white text-xs uppercase tracking-wider mb-0.5">Telefone para contato</p>
                  <a href={`tel:+${WA_NUMBER}`} className="hover:text-white transition">{PHONE_DISPLAY}</a>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Redes sociais</p>
              <div className="flex gap-3">
                {[
                  { icon: <Facebook className="h-5 w-5" />, href: 'https://facebook.com', label: 'Facebook' },
                  { icon: <Instagram className="h-5 w-5" />, href: 'https://instagram.com', label: 'Instagram' },
                  { icon: <MessageCircle className="h-5 w-5" />, href: WA_URL, label: 'WhatsApp' },
                ].map((s) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    whileHover={{ scale: 1.15, boxShadow: `0 0 20px ${GOLD}40` }}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ border: `1px solid ${GOLD}40`, color: GOLD }}
                  >
                    {s.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Logo.png */}
          <motion.div
            variants={fadeRight} initial="hidden" whileInView="visible" viewport={inViewOpts}
            className="flex items-center justify-center"
          >
            <img
              src="/media/Logo.png"
              alt="Studio Markin Tattoo"
              className="w-auto drop-shadow-[0_8px_40px_rgba(201,168,76,0.25)]"
              style={{ maxHeight: 'clamp(180px, 30vw, 340px)', mixBlendMode: 'lighten' }}
            />
          </motion.div>
        </div>
      </Section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-6 text-center" style={{ background: '#000', borderTop: '1px solid #1A1A1A' }}>
        <p className="text-white/25 text-xs">
          © {new Date().getFullYear()} Studio Markin Tattoo — Serra, ES. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
