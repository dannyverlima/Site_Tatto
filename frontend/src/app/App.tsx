import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Specialists } from './components/Specialists';
import { Course } from './components/curso';
import { Reviews } from './components/Reviews';
import { ContatoLocalizacao } from './components/ContatoLocalizacao';
import { Footer } from './components/rodape';
import { LoadingScreen } from './components/LoadingScreen';

export default function App() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    window.setTimeout(() => { if (mounted) setShowLoading(false); }, 1100);
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-black">
        <Navigation />
        <Hero />
        <Specialists />
        <Course />
        <Reviews />
        <ContatoLocalizacao />
        <Footer />
      </div>

      {showLoading && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <LoadingScreen />
        </div>
      )}
    </>
  );
}
