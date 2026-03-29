import { Route, Routes } from 'react-router-dom';
import AppShell from './layout/AppShell';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import SalonPublicPage from './pages/public/SalonPublicPage';
import SalonsListPage from './pages/public/SalonsListPage';

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
