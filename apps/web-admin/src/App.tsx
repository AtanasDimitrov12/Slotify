import { RequireRole } from '@barber/shared';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layout/AppShell';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminTenantsPage from './pages/admin/AdminTenantsPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import OwnerBookingRulesPage from './pages/owner/OwnerBookingRulesPage';
import OwnerLayout from './pages/owner/OwnerLayout';
import OwnerOverviewPage from './pages/owner/OwnerOverviewPage';
import OwnerServicesPage from './pages/owner/OwnerServicesPage';
import OwnerSettingsPage from './pages/owner/OwnerSettingsPage';
import OwnerTeamPage from './pages/owner/OwnerTeamPage';
import StaffAvailabilityPage from './pages/staff/StaffAvailabilityPage';
import StaffBookingRulesPage from './pages/staff/StaffBookingRulesPage';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffLayout from './pages/staff/StaffLayout';
import StaffProfilePage from './pages/staff/StaffProfilePage';
import StaffServicesPage from './pages/staff/StaffServicesPage';
import StaffTimeOffPage from './pages/staff/StaffTimeOffPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LandingPage />} />
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
            <Route path="services" element={<OwnerServicesPage />} />
            <Route path="settings" element={<OwnerSettingsPage />} />
            <Route path="booking-rules" element={<OwnerBookingRulesPage />} />
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
            <Route path="booking-rules" element={<StaffBookingRulesPage />} />
          </Route>
        </Route>

        {/* Redirect public booking routes to the user app if they land here accidentally */}
        <Route path="/salons" element={<Navigate to="/" replace />} />
        <Route path="/salons/:slug" element={<Navigate to="/" replace />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
