import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Specialists } from './components/Specialists';
import { Course } from './components/curso';
import { Reviews } from './components/Reviews';
import { ContatoLocalizacao } from './components/ContatoLocalizacao';
import { Footer } from './components/rodapé';
import { LoadingScreen } from './components/LoadingScreen';

export default function App() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoading(false), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <Hero />
      <Specialists />
      <Course />
      <Reviews />
      <ContatoLocalizacao />
      <Footer />
    </div>
  );
}
