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
import NotFoundPage from './pages/NotFoundPage';
import OwnerLayout from './pages/owner/OwnerLayout';
import OwnerOverviewPage from './pages/owner/OwnerOverviewPage';
import OwnerTeamPage from './pages/owner/OwnerTeamPage';
import OwnerSettingsPage from './pages/owner/OwnerSettingsPage';
import StaffLayout from './pages/staff/StaffLayout';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffProfilePage from './pages/staff/StaffProfilePage';
import StaffAvailabilityPage from './pages/staff/StaffAvailabilityPage';
import StaffTimeOffPage from './pages/staff/StaffTimeOffPage';
import StaffServicesPage from './pages/staff/StaffServicesPage';

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

        <Route element={<RequireRole role="owner" />}>
          <Route path="/owner" element={<OwnerLayout />}>
            <Route index element={<OwnerOverviewPage />} />
            <Route path="overview" element={<OwnerOverviewPage />} />
            <Route path="team" element={<OwnerTeamPage />} />
            <Route path="settings" element={<OwnerSettingsPage />} />
          </Route>
        </Route>

        <Route element={<RequireRole role="staff" />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboardPage />} />
            <Route path="dashboard" element={<StaffDashboardPage />} />
            <Route path="profile" element={<StaffProfilePage />} />
            <Route path="availability" element={<StaffAvailabilityPage />} />
            <Route path="time-off" element={<StaffTimeOffPage />} />
            <Route path="services" element={<StaffServicesPage />} />
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  );
}