import { createRoot } from 'react-dom/client';
import JoalheriaPage from './joalheria/JoalheriaPage';
import { AuthProvider } from './joalheria/AuthContext';
import AdminJoalheriaApp from './admin/AdminJoalheriaApp';
import './styles/index.css';

const isAdminRoute = window.location.pathname.startsWith('/painel-joias-mk9x');

createRoot(document.getElementById('root')!).render(
  isAdminRoute
    ? <AdminJoalheriaApp />
    : <AuthProvider><JoalheriaPage /></AuthProvider>
);
