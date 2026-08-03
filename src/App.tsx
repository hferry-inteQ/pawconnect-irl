import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import SectionNav from './components/SectionNav';
import Footer from './components/Footer';
import EventsPage from './pages/EventsPage';
import AdoptionPage from './pages/AdoptionPage';
import DealsPage from './pages/DealsPage';
import PawConnectPage from './pages/PawConnectPage';
import DogParksPage from './pages/DogParksPage';
import CityGuidesPage from './pages/CityGuidesPage';

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      <SectionNav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/adoption" element={<AdoptionPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/paw-connect" element={<PawConnectPage />} />
          <Route path="/dog-parks" element={<DogParksPage />} />
          <Route path="/city-guides" element={<CityGuidesPage />} />
          <Route path="/landlord" element={<Navigate to="/paw-connect" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
