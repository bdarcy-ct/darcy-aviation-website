import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/content', label: 'Content', icon: '📝' },
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

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-slate-300 text-sm">
                Welcome, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-red-500/30"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Quick Actions Floating Button (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6">
        <button className="bg-gold hover:bg-yellow-500 text-navy-900 p-3 rounded-full shadow-lg transition-colors">
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;