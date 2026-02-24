import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layout/AppShell';
import LandingPage from './pages/LandingPage';
import PlacesPage from './pages/PlacesPage';
import PartnerPage from './pages/PartnerPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/partner" element={<PartnerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}