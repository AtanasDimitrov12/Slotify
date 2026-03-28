import { Routes, Route } from 'react-router-dom';
import { Page } from '@barber/shared';
import AppShell from './layout/AppShell';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import SalonsListPage from './pages/public/SalonsListPage';
import SalonPublicPage from './pages/public/SalonPublicPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/salons" element={<SalonsListPage />} />
        <Route path="/salons/:slug" element={<SalonPublicPage />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
