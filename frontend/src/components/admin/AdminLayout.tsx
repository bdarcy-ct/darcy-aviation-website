import React, { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { ToastProvider, useToast } from './Toast';

interface AdminLayoutProps {
  children: ReactNode;
}

// Inner component that has access to ToastProvider context
const AdminLayoutInner: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout, token } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) { toast('error', 'Fill in all fields'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast('error', 'New passwords don\'t match'); return; }
    if (pwForm.newPassword.length < 6) { toast('error', 'Password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast('success', 'Password changed!');
        setShowPasswordModal(false);
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast('error', data.error || 'Failed to change password');
      }
    } catch { toast('error', 'Failed to change password'); }
    finally { setPwSaving(false); }
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
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-slate-300 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border border-white/20"
                  title="Change Password"
                >
                  🔑
                </button>
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

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowPasswordModal(false)}>
            <div className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">🔑 Change Password</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Current Password</label>
                  <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">New Password</label>
                  <input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Confirm New Password</label>
                  <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleChangePassword} disabled={pwSaving} className="bg-gold hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex-1">
                  {pwSaving ? 'Saving...' : 'Change Password'}
                </button>
                <button onClick={() => setShowPasswordModal(false)} className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};

// Wrapper that provides ToastProvider context
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <ToastProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ToastProvider>
  );
};

export default AdminLayout;
