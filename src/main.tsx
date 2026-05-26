
  import { createRoot } from 'react-dom/client';
  import App from './app/App.tsx';
  import AdminApp from './admin/AdminApp.tsx';
  import { SpecialistPage } from './specialist/SpecialistPage';
  import { PortfolioAlbumPage } from './portfolio/PortfolioAlbumPage';
  import './styles/index.css';

  const isAdminRoute = window.location.pathname.startsWith('/Admin@tatto');
  const isSpecialistRoute = window.location.pathname === '/markin' || window.location.pathname.startsWith('/especialista/');
  const isPortfolioAlbumRoute = window.location.pathname.startsWith('/portifolio/') || window.location.pathname.startsWith('/portfolio/');

  createRoot(document.getElementById('root')!).render(
    isAdminRoute
      ? <AdminApp />
      : isPortfolioAlbumRoute
      ? <PortfolioAlbumPage />
      : isSpecialistRoute
      ? <SpecialistPage />
      : <App />
  );
  