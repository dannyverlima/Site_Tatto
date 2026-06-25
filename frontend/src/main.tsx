
  import { createRoot } from 'react-dom/client';
  import App from './app/App.tsx';
  import AdminApp from './admin/AdminApp.tsx';
  import AdminJoalheriaApp from './admin/AdminJoalheriaApp.tsx';
  import { SpecialistPage } from './specialist/SpecialistPage';
  import { PortfolioAlbumPage } from './portfolio/PortfolioAlbumPage';
  import LocationInfoPage from './app/LocationInfoPage.tsx';
  import { AvaliacaoPage } from './app/AvaliacaoPage.tsx';
  import './styles/index.css';

  const pathname = window.location.pathname;
  const decoded = (() => { try { return decodeURIComponent(pathname); } catch { return pathname; } })();

  const isAdminRoute = pathname.startsWith('/painel-studio-mk9x');
  const isJoalheriaAdminRoute = pathname.startsWith('/painel-joias-mk9x');
  const isSpecialistRoute = pathname === '/markin' || pathname.startsWith('/especialista/');
  const isPortfolioAlbumRoute = pathname.startsWith('/portifolio/') || pathname.startsWith('/portfolio/');
  const isLocationRoute = pathname === '/localizacao';
  const isAvaliacaoRoute = decoded === '/Avaliação' || decoded === '/Avaliacao';

  createRoot(document.getElementById('root')!).render(
    isJoalheriaAdminRoute
      ? <AdminJoalheriaApp />
      : isAdminRoute
      ? <AdminApp />
      : isPortfolioAlbumRoute
      ? <PortfolioAlbumPage />
      : isSpecialistRoute
      ? <SpecialistPage />
      : isLocationRoute
      ? <LocationInfoPage />
      : isAvaliacaoRoute
      ? <AvaliacaoPage />
      : <App />
  );
  