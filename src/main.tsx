
  import { createRoot } from 'react-dom/client';
  import App from './app/App.tsx';
  import AdminApp from './admin/AdminApp.tsx';
  import { SpecialistPage } from './specialist/SpecialistPage';
  import './styles/index.css';

  const isAdminRoute = window.location.pathname.startsWith('/Admin@tatto');
  const isSpecialistRoute = window.location.pathname === '/markin' || window.location.pathname.startsWith('/especialista/');

  createRoot(document.getElementById('root')!).render(
    isAdminRoute ? <AdminApp /> : isSpecialistRoute ? <SpecialistPage /> : <App />
  );
  