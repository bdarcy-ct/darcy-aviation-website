import React, { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/content', label: 'Content', icon: '📝' },
    { path: '/admin/service-tiles', label: 'Service Tiles', icon: '🔧' },
    { path: '/admin/fleet', label: 'Fleet', icon: '🛩️' },
    { path: '/admin/testimonials', label: 'Reviews', icon: '⭐' },
    { path: '/admin/media', label: 'Media', icon: '🖼️' },
    { path: '/admin/faqs', label: 'FAQs', icon: '❓' },
    { path: '/admin/pages', label: 'SEO', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800">
      {/* Navigation Header */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Darcy Aviation CMS</h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-gold/20 text-gold border border-gold/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* User Menu + Mobile Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-slate-300 text-sm hidden sm:inline">
                Welcome, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-red-500/30"
              >
                Logout
              </button>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation — collapsible */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-white/10 pt-3">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-gold/20 text-gold border border-gold/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* View Live Site (Floating) */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-aviation-blue hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors flex items-center gap-2 text-sm font-medium z-50"
        title="View Live Site"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        <span className="hidden sm:inline">View Site</span>
      </a>
    </div>
  );
};

export default AdminLayout;