import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundBlobs from './components/BackgroundBlobs';
import Home from './pages/Home';
import Training from './pages/Training';
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
