import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useAuth } from './AuthContext';

interface AuthModalProps {
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export function AuthModal({ onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (regPassword !== regPassword2) { setRegError('As senhas não coincidem'); return; }
    if (regPassword.length < 6) { setRegError('A senha deve ter pelo menos 6 caracteres'); return; }
    setRegLoading(true);
    try {
      await register(regName, regEmail, regPassword);
      onClose();
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md border border-gray-800 bg-black p-8"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3 }}
      >
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        {/* Logo/title */}
        <h2 className="text-2xl font-serif text-center mb-8">JOALHERIA</h2>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-8">
          <button
            onClick={() => { setTab('login'); setLoginError(''); }}
            className={`flex-1 pb-3 text-sm transition-colors ${tab === 'login' ? 'text-white border-b-2 border-white -mb-px' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setTab('register'); setRegError(''); }}
            className={`flex-1 pb-3 text-sm transition-colors ${tab === 'register' ? 'text-white border-b-2 border-white -mb-px' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Criar Conta
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.form key="login" onSubmit={handleLogin}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }} className="space-y-5">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email" required autoComplete="email"
                  value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 px-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-gray-600 transition"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
                    value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 px-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-gray-600 transition pr-10"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
              <button type="submit" disabled={loginLoading}
                className="w-full bg-white text-black py-3 font-medium hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loginLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Não tem conta?{' '}
                <button type="button" onClick={() => setTab('register')}
                  className="text-white hover:underline">Criar conta</button>
              </p>
            </motion.form>
          ) : (
            <motion.form key="register" onSubmit={handleRegister}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Nome</label>
                <input
                  type="text" required autoComplete="name"
                  value={regName} onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 px-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-gray-600 transition"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email" required autoComplete="email"
                  value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 px-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-gray-600 transition"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'} required autoComplete="new-password"
                    value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 px-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-gray-600 transition pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Confirmar Senha</label>
                <input
                  type={showPwd ? 'text' : 'password'} required autoComplete="new-password"
                  value={regPassword2} onChange={(e) => setRegPassword2(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 px-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-gray-600 transition"
                  placeholder="Repita a senha"
                />
              </div>
              {regError && <p className="text-red-400 text-sm">{regError}</p>}
              <button type="submit" disabled={regLoading}
                className="w-full bg-white text-black py-3 font-medium hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {regLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {regLoading ? 'Criando conta...' : 'Criar Conta'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Já tem conta?{' '}
                <button type="button" onClick={() => setTab('login')}
                  className="text-white hover:underline">Entrar</button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
