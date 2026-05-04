import { useState, useEffect, useRef } from 'react';

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
  const [restoring, setRestoring] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        if (d && d.counts) setData(d);
        else {
          console.error('Invalid dashboard response:', d);
          setData({ counts: { mediaFiles: 0, faqs: 0, fleetAircraft: 0, testimonials: 0, storageUsageMB: 0 } });
        }
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setData({ counts: { mediaFiles: 0, faqs: 0, fleetAircraft: 0, testimonials: 0, storageUsageMB: 0 } });
      })
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
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".db,.sqlite,.sqlite3"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedFile(file);
                setShowRestoreConfirm(true);
              }
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={restoring}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
          >
            📤 Upload Backup
          </button>
          <button
            onClick={() => {
              const token = localStorage.getItem('admin_token');
              fetch('/api/admin/backup/download', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `darcy-backup-${new Date().toISOString().slice(0,10)}.db`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                })
                .catch(() => alert('Backup failed'));
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
          >
            💾 Download Backup
          </button>
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
            { label: 'SOP Manual', href: '/admin/sop', icon: '📘' },
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
          Customer messages go directly to your <strong className="text-white">admin@darcyaviation.com</strong> inbox via Google Workspace.
        </p>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && selectedFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3">⚠️ Restore from Backup</h3>
            <p className="text-slate-300 text-sm mb-2">
              This will <strong className="text-red-400">replace all current data</strong> with the contents of:
            </p>
            <p className="text-white font-mono text-sm bg-slate-700 rounded px-3 py-2 mb-4 break-all">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
            <p className="text-slate-400 text-xs mb-5">
              A safety backup of the current database will be created automatically before restoring. The server will restart after restore.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowRestoreConfirm(false); setSelectedFile(null); }}
                disabled={restoring}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setRestoring(true);
                  const token = localStorage.getItem('admin_token');
                  const formData = new FormData();
                  formData.append('backup', selectedFile);
                  fetch('/api/admin/backup/restore', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                  })
                    .then(r => r.json())
                    .then(result => {
                      if (result.success) {
                        alert('Backup restored! The page will reload when the server restarts.');
                        setTimeout(() => window.location.reload(), 3000);
                      } else {
                        alert(`Restore failed: ${result.error}`);
                        setRestoring(false);
                      }
                    })
                    .catch(() => {
                      alert('Restore failed — check your connection and try again.');
                      setRestoring(false);
                    })
                    .finally(() => {
                      setShowRestoreConfirm(false);
                      setSelectedFile(null);
                    });
                }}
                disabled={restoring}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {restoring ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Restoring...
                  </>
                ) : (
                  'Restore Now'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
