import { Route, Routes } from 'react-router-dom';
import AppShell from './layout/AppShell';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import SalonPublicPage from './pages/public/SalonPublicPage';
import SalonsListPage from './pages/public/SalonsListPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/salons" element={<SalonsListPage />} />
        <Route path="/salons/:slug" element={<SalonPublicPage />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
