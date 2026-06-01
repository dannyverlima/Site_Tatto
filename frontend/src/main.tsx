
  import { createRoot } from 'react-dom/client';
  import App from './app/App.tsx';
  import AdminApp from './admin/AdminApp.tsx';
  import AdminJoalheriaApp from './admin/AdminJoalheriaApp.tsx';
  import { SpecialistPage } from './specialist/SpecialistPage';
  import { PortfolioAlbumPage } from './portfolio/PortfolioAlbumPage';
  import LocationInfoPage from './app/LocationInfoPage.tsx';
  import './styles/index.css';

  const pathname = window.location.pathname;
  const isAdminRoute = pathname.startsWith('/Admin@tatto');
  const isJoalheriaAdminRoute = pathname.startsWith('/Admin@joalheria');
  const isSpecialistRoute = pathname === '/markin' || pathname.startsWith('/especialista/');
  const isPortfolioAlbumRoute = pathname.startsWith('/portifolio/') || pathname.startsWith('/portfolio/');
  const isLocationRoute = pathname === '/localizacao';

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
      : <App />
  );
  