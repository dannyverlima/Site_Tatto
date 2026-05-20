import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Contact } from './components/contatos';
import { Portfolio } from './components/Portfolio';
import { Specialists } from './components/Specialists';
import { Course } from './components/curso';
import { Reviews } from './components/Reviews';
import { MapSection } from './components/localização';
import { Footer } from './components/rodapé';

export default function App() {
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
