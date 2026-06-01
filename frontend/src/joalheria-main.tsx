import { createRoot } from 'react-dom/client';
import JoalheriaPage from './joalheria/JoalheriaPage';
import { AuthProvider } from './joalheria/AuthContext';
import AdminJoalheriaApp from './admin/AdminJoalheriaApp';
import './styles/index.css';

const isAdminRoute = window.location.pathname.startsWith('/Admin@joalheria');

createRoot(document.getElementById('root')!).render(
  isAdminRoute
    ? <AdminJoalheriaApp />
    : <AuthProvider><JoalheriaPage /></AuthProvider>
);
