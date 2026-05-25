import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Contact } from './components/contatos';
import { Portfolio } from './components/Portfolio';
import { Specialists } from './components/Specialists';
import { Course } from './components/curso';
import { Reviews } from './components/Reviews';
import { MapSection } from './components/localização';
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
    <div className="min-h-screen bg-neutral-950">
      <Navigation />
      <Hero />
      <Specialists />
      <Portfolio />
      <Course />
      <Reviews />
      <MapSection />
      <Contact />
      <Footer />
    </div>
  );
}
