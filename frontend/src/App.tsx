import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundBlobs from './components/BackgroundBlobs';
import Home from './pages/Home';
import Training from './pages/Training';
import PPL from './pages/training/PPL';
import InstrumentRating from './pages/training/InstrumentRating';
import Commercial from './pages/training/Commercial';
import MultiEngine from './pages/training/MultiEngine';
import DiscoveryFlight from './pages/training/DiscoveryFlight';
import SimulatorPage from './pages/training/Simulator';
import Fleet from './pages/Fleet';
import Maintenance from './pages/Maintenance';
import Book from './pages/Book';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="relative min-h-screen">
      <BackgroundBlobs />
      <ScrollToTop />
      <Navbar />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/ppl" element={<PPL />} />
          <Route path="/training/instrument" element={<InstrumentRating />} />
          <Route path="/training/commercial" element={<Commercial />} />
          <Route path="/training/multi-engine" element={<MultiEngine />} />
          <Route path="/training/discovery" element={<DiscoveryFlight />} />
          <Route path="/training/simulator" element={<SimulatorPage />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/book" element={<Book />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
