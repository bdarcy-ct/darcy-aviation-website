import { useState, useEffect } from 'react';

interface DashboardData {
  counts: {
    mediaFiles: number;
    faqs: number;
    fleetAircraft: number;
    testimonials: number;
    storageUsageMB: number;
  };
}

function formatStorage(mb: number): string {
  if (mb < 1) return `${Math.round(mb * 1024)} KB`;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d && d.counts) setData(d);
        else console.error('Invalid dashboard response:', d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-red-400">Failed to load dashboard</p>;

  const stats = [
    { label: 'Fleet Aircraft', value: data.counts.fleetAircraft, icon: '✈️', color: 'from-blue-600/80 to-blue-500/60', border: 'border-blue-400/30' },
    { label: 'Testimonials', value: data.counts.testimonials, icon: '⭐', color: 'from-amber-600/80 to-orange-500/60', border: 'border-amber-400/30' },
    { label: 'FAQ Items', value: data.counts.faqs, icon: '❓', color: 'from-purple-600/80 to-violet-500/60', border: 'border-purple-400/30' },
    { label: 'Media Files', value: data.counts.mediaFiles, icon: '📸', color: 'from-emerald-600/80 to-green-500/60', border: 'border-emerald-400/30' },
    { label: 'Storage Used', value: formatStorage(data.counts.storageUsageMB), icon: '💾', color: 'from-slate-600/80 to-slate-500/60', border: 'border-slate-400/30' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Darcy Aviation CMS Overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-xl p-5 backdrop-blur-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-xs uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Edit Content', href: '/admin/content', icon: '📝' },
            { label: 'Manage Fleet', href: '/admin/fleet', icon: '✈️' },
            { label: 'Reviews', href: '/admin/testimonials', icon: '⭐' },
            { label: 'Experiences', href: '/admin/experiences', icon: '🎯' },
            { label: 'FAQs', href: '/admin/faqs', icon: '❓' },
            { label: 'SEO Settings', href: '/admin/pages', icon: '🔍' },
          ].map((link, i) => (
            <a key={i} href={link.href} className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-3 text-center transition-all">
              <span className="text-2xl block mb-1">{link.icon}</span>
              <span className="text-sm text-slate-300">{link.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-aviation-blue/10 border border-aviation-blue/20 rounded-xl p-5">
        <h3 className="text-white font-medium mb-2">📧 Bookings & Messages</h3>
        <p className="text-slate-400 text-sm">
          All bookings are handled through <a href="https://www.flightcircle.com" target="_blank" rel="noopener noreferrer" className="text-aviation-blue hover:text-gold transition-colors">FlightCircle</a>. 
          Customer messages go directly to your <strong className="text-white">brent@darcyaviation.com</strong> inbox via Google Workspace.
        </p>
      </div>
    </div>
  );
}
