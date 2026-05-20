
  import { createRoot } from 'react-dom/client';
  import App from './app/App.tsx';
  import AdminApp from './admin/AdminApp.tsx';
  import './styles/index.css';

  const isAdminRoute = window.location.pathname.startsWith('/Admin@tatto');

  createRoot(document.getElementById('root')!).render(
    isAdminRoute ? <AdminApp /> : <App />
  );
  