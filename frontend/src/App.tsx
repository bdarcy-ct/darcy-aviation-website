import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WeatherBackground from './components/WeatherBackground';
import BackToTop from './components/BackToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { WeatherProvider } from './contexts/WeatherContext';

// Lazy-load pages for better initial load performance
const Home = lazy(() => import('./pages/Home'));
const Training = lazy(() => import('./pages/Training'));
const PPL = lazy(() => import('./pages/training/PPL'));
const InstrumentRating = lazy(() => import('./pages/training/InstrumentRating'));
const Commercial = lazy(() => import('./pages/training/Commercial'));
const MultiEngine = lazy(() => import('./pages/training/MultiEngine'));
const DiscoveryFlight = lazy(() => import('./pages/training/DiscoveryFlight'));
const SimulatorPage = lazy(() => import('./pages/training/Simulator'));
const Fleet = lazy(() => import('./pages/Fleet'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Book = lazy(() => import('./pages/Book'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
const Experiences = lazy(() => import('./pages/Experiences'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <WeatherProvider>
    <div className="relative min-h-screen flex flex-col">
      <WeatherBackground />
      <ScrollToTop />
      <Navbar />
      <main id="main-content" className="relative z-10 flex-1">
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/book" element={<Book />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
    </div>
    </WeatherProvider>
    </ErrorBoundary>
  );
}
