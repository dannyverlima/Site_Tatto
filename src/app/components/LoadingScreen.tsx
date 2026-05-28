import { motion } from 'framer-motion';
import logoImg from '../../imports/Logo.png';

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-5"
      >
        <motion.img
          src={logoImg}
          alt="Logo"
          className="h-36 w-auto sm:h-44"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <p className="text-sm uppercase tracking-[0.35em] text-white/55">{message}</p>
      </motion.div>
    </div>
  );
}