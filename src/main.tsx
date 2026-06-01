
  import { createRoot } from 'react-dom/client';
  import App from './app/App.tsx';
  import AdminApp from './admin/AdminApp.tsx';
  import { SpecialistPage } from './specialist/SpecialistPage';
  import LocationInfoPage from './app/LocationInfoPage.tsx';
  import './styles/index.css';

  const isAdminRoute = window.location.pathname.startsWith('/Admin@tatto');
  const isSpecialistRoute = window.location.pathname === '/markin' || window.location.pathname.startsWith('/especialista/');
  const isLocationRoute = window.location.pathname === '/localizacao';

  createRoot(document.getElementById('root')!).render(
    isAdminRoute ? <AdminApp /> : isSpecialistRoute ? <SpecialistPage /> : isLocationRoute ? <LocationInfoPage /> : <App />
  );
  