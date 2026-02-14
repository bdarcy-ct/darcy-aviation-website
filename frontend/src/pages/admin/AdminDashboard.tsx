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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
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
        <p className="text-slate-300">Failed to load dashboard data</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 bg-gold hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const quickStats = [
    { 
      label: 'Total Bookings', 
      value: data.counts.bookings, 
      color: 'from-blue-500 to-aviation-blue',
      link: '/admin/dashboard' // Could link to a bookings management page
    },
    { 
      label: 'Pending Bookings', 
      value: data.counts.pendingBookings, 
      color: 'from-orange-500 to-yellow-500',
      urgent: data.counts.pendingBookings > 0
    },
    { 
      label: 'Unread Messages', 
      value: data.counts.unreadMessages, 
      color: 'from-red-500 to-pink-500',
      urgent: data.counts.unreadMessages > 0
    },
    { 
      label: 'Media Files', 
      value: data.counts.mediaFiles, 
      color: 'from-purple-500 to-indigo-500',
      link: '/admin/media'
    },
    { 
      label: 'Active FAQs', 
      value: data.counts.faqs, 
      color: 'from-green-500 to-emerald-500',
      link: '/admin/faqs'
    },
    { 
      label: 'Storage Used', 
      value: `${data.counts.storageUsageMB}MB`, 
      color: 'from-gray-500 to-slate-500'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-300">Welcome to the Darcy Aviation content management system</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl text-white relative overflow-hidden ${
              stat.urgent ? 'ring-2 ring-yellow-400 animate-pulse' : ''
            }`}
          >
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              {stat.urgent && (
                <span className="inline-block mt-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                  Needs Attention
                </span>
              )}
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            {stat.link && (
              <Link to={stat.link} className="absolute inset-0 z-20">
                <span className="sr-only">Go to {stat.label}</span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/content"
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-center transition-colors group"
          >
            <div className="text-2xl mb-2">📝</div>
            <p className="text-white font-medium">Edit Content</p>
          </Link>
          <Link
            to="/admin/media"
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-center transition-colors group"
          >
            <div className="text-2xl mb-2">🖼️</div>
            <p className="text-white font-medium">Upload Media</p>
          </Link>
          <Link
            to="/admin/faqs"
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-center transition-colors group"
          >
            <div className="text-2xl mb-2">❓</div>
            <p className="text-white font-medium">Manage FAQs</p>
          </Link>
          <Link
            to="/admin/pages"
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-center transition-colors group"
          >
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-white font-medium">SEO Settings</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Bookings</h3>
          {data.recentActivity.bookings.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.bookings.map((booking) => (
                <div key={booking.id} className="bg-white/10 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{booking.name}</p>
                      <p className="text-slate-300 text-sm">{booking.experience_type}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="text-slate-400 text-xs mt-1">{formatDate(booking.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No recent bookings</p>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Messages</h3>
          {data.recentActivity.messages.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.messages.map((message) => (
                <div key={message.id} className="bg-white/10 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{message.name}</p>
                      <p className="text-slate-300 text-sm">{message.subject || 'No subject'}</p>
                    </div>
                    <div className="text-right">
                      {!message.read && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                          New
                        </span>
                      )}
                      <p className="text-slate-400 text-xs mt-1">{formatDate(message.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No recent messages</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;