import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

interface DashboardData {
  counts: {
    bookings: number;
    pendingBookings: number;
    unreadMessages: number;
    mediaFiles: number;
    faqs: number;
    fleetAircraft: number;
    testimonials: number;
    storageUsageMB: number;
  };
  recentActivity: {
    bookings: Array<{
      id: number;
      name: string;
      email: string;
      experience_type: string;
      status: string;
      created_at: string;
    }>;
    messages: Array<{
      id: number;
      name: string;
      email: string;
      subject: string;
      read: boolean;
      created_at: string;
    }>;
  };
}

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAdmin();

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setData(await response.json());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-white font-medium text-lg mb-1">Failed to load dashboard</p>
        <p className="text-slate-400 text-sm mb-4">Check your connection and try again</p>
        <button onClick={fetchDashboardData} className="bg-gold hover:bg-yellow-500 text-navy-900 px-5 py-2 rounded-lg font-semibold transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const quickStats = [
    { label: 'Total Bookings', value: data.counts.bookings, icon: '📅', color: 'from-blue-600/80 to-blue-500/60', border: 'border-blue-400/30', link: '/admin/dashboard' },
    { label: 'Pending Bookings', value: data.counts.pendingBookings, icon: '⏳', color: 'from-amber-600/80 to-orange-500/60', border: 'border-amber-400/30', urgent: data.counts.pendingBookings > 0 },
    { label: 'Unread Messages', value: data.counts.unreadMessages, icon: '💬', color: 'from-rose-600/80 to-pink-500/60', border: 'border-rose-400/30', urgent: data.counts.unreadMessages > 0 },
    { label: 'Fleet Aircraft', value: data.counts.fleetAircraft, icon: '🛩️', color: 'from-cyan-600/80 to-teal-500/60', border: 'border-cyan-400/30', link: '/admin/fleet' },
    { label: 'Active FAQs', value: data.counts.faqs, icon: '❓', color: 'from-emerald-600/80 to-green-500/60', border: 'border-emerald-400/30', link: '/admin/faqs' },
    { label: 'Storage Used', value: `${data.counts.storageUsageMB}MB`, icon: '💾', color: 'from-violet-600/80 to-purple-500/60', border: 'border-violet-400/30', link: '/admin/media' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Dashboard</h1>
        <p className="text-slate-300 text-sm sm:text-base">Welcome to the Darcy Aviation content management system</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => {
          const inner = (
            <div className={`relative bg-gradient-to-br ${stat.color} backdrop-blur-sm border ${stat.border} p-5 rounded-xl text-white overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 ${stat.urgent ? 'ring-2 ring-amber-400/60' : ''}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 group-hover:bg-white/10 transition-colors" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-6 -mb-6 group-hover:bg-white/10 transition-colors" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</p>
                  {stat.urgent && (
                    <span className="inline-flex items-center mt-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 bg-amber-300 rounded-full mr-1.5 animate-pulse" />
                      Needs Attention
                    </span>
                  )}
                </div>
                <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>
              </div>
            </div>
          );

          return stat.link ? (
            <Link key={index} to={stat.link} className="block">{inner}</Link>
          ) : (
            <div key={index}>{inner}</div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/admin/content', icon: '📝', label: 'Edit Content' },
            { to: '/admin/media', icon: '🖼️', label: 'Upload Media' },
            { to: '/admin/faqs', icon: '❓', label: 'Manage FAQs' },
            { to: '/admin/pages', icon: '🔍', label: 'SEO Settings' },
          ].map(action => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white/5 hover:bg-white/15 border border-white/10 hover:border-gold/30 rounded-xl p-4 text-center transition-all duration-300 group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
              <p className="text-white text-sm font-medium">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📅</span> Recent Bookings
          </h3>
          {data.recentActivity.bookings.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.bookings.map((booking) => (
                <div key={booking.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{booking.name}</p>
                      <p className="text-slate-400 text-sm">{booking.experience_type}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="text-slate-500 text-xs mt-1">{formatDate(booking.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-3xl mb-2 opacity-50">📅</div>
              <p className="text-slate-400 text-sm">No recent bookings</p>
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>💬</span> Recent Messages
          </h3>
          {data.recentActivity.messages.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.messages.map((message) => (
                <div key={message.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{message.name}</p>
                      <p className="text-slate-400 text-sm">{message.subject || 'No subject'}</p>
                    </div>
                    <div className="text-right">
                      {!message.read && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                          New
                        </span>
                      )}
                      <p className="text-slate-500 text-xs mt-1">{formatDate(message.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-3xl mb-2 opacity-50">💬</div>
              <p className="text-slate-400 text-sm">No recent messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
