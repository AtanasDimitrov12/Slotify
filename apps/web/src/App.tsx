import { Routes, Route } from 'react-router-dom';
import AppShell from './layout/AppShell';
import LandingPage from './pages/LandingPage';
import PlacesPage from './pages/PlacesPage';
import PartnerPage from './pages/PartnerPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminTenantsPage from './pages/admin/AdminTenantsPage';
import RequireRole from './components/RequireRole';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/partner" element={<PartnerPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="overview" element={<AdminOverviewPage />} />
            <Route path="tenants" element={<AdminTenantsPage />} />
          </Route>
        </Route>

      </Route>
    </Routes>
  );
}