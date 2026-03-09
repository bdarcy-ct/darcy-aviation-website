import React, { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { ToastProvider } from './Toast';

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

  const navGroups = [
    {
      label: 'Content',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/content', label: 'Content Editor', icon: '📝' },
        { path: '/admin/service-tiles', label: 'Service Tiles', icon: '🔧' },
      ]
    },
    {
      label: 'Pages',
      items: [
        { path: '/admin/training-programs', label: 'Training', icon: '🎓' },
        { path: '/admin/fleet', label: 'Fleet', icon: '🛩️' },
        { path: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
        { path: '/admin/faqs', label: 'FAQs', icon: '❓' },
        { path: '/admin/experiences', label: 'Experiences', icon: '✈️' },
        { path: '/admin/maintenance-services', label: 'Maintenance', icon: '🔧' },
        { path: '/admin/team', label: 'Team', icon: '👥' },
      ]
    },
    {
      label: 'Media & SEO',
      items: [
        { path: '/admin/media', label: 'Media', icon: '🖼️' },
        { path: '/admin/pages', label: 'SEO', icon: '🔍' },
      ]
    }
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800">
        {/* Navigation Header */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <NavLink to="/admin/dashboard" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center text-navy-900 font-bold text-sm group-hover:scale-105 transition-transform">
                  DA
                </div>
                <h1 className="text-lg font-bold text-white hidden sm:block">Darcy Aviation <span className="text-gold text-sm font-normal">CMS</span></h1>
              </NavLink>

              {/* Grouped Navigation Links */}
              <div className="hidden lg:flex items-center gap-0.5">
                {navGroups.map((group, gi) => (
                  <div key={group.label} className="flex items-center">
                    {gi > 0 && <div className="w-px h-5 bg-white/15 mx-1.5" />}
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-gold/20 text-gold shadow-sm shadow-gold/10 border border-gold/30'
                              : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                          }`
                        }
                      >
                        <span className="text-sm">{item.icon}</span>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                ))}
              </div>

              {/* User Menu + Mobile Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs hidden sm:inline">
                  {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/15 hover:bg-red-500/25 text-red-300 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border border-red-500/20"
                >
                  Logout
                </button>
                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation — collapsible */}
            {mobileMenuOpen && (
              <div className="lg:hidden pb-4 border-t border-white/10 pt-3 animate-fade-in">
                {navGroups.map((group) => (
                  <div key={group.label} className="mb-3">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {group.label}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                              isActive
                                ? 'bg-gold/20 text-gold border border-gold/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                            }`
                          }
                        >
                          <span>{item.icon}</span>
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* View Live Site (Floating) */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-aviation-blue hover:bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm font-medium z-50"
          title="View Live Site"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          <span className="hidden sm:inline">View Site</span>
        </a>
      </div>
    </ToastProvider>
  );
};

export default AdminLayout;
