import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../components/admin/Toast';

interface Aircraft {
  id: number;
  name: string;
  type: string;
  engine: string;
  seats: number;
  horsepower: number;
  cruise_speed: string;
  range: string;
  description: string;
  image_url: string;
  available: number;
}

const emptyAircraft = {
  name: '', type: 'Single Engine', engine: '', seats: 4, horsepower: 0,
  cruise_speed: '', range: '', description: '', image_url: '', available: 1,
};

const FleetManager: React.FC = () => {
  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Aircraft | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAircraft);
  const [saving, setSaving] = useState(false);
  const { token } = useAdmin();
  const { toast } = useToast();

  useEffect(() => { fetchFleet(); }, []);

  const fetchFleet = async () => {
    try {
      const res = await fetch('/api/admin/fleet', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setFleet(await res.json());
    } catch (e) { console.error('Failed to fetch fleet:', e); }
    finally { setIsLoading(false); }
  };

  const startEdit = (a: Aircraft) => {
    setEditing(a);
    setForm({ name: a.name, type: a.type, engine: a.engine, seats: a.seats, horsepower: a.horsepower, cruise_speed: a.cruise_speed, range: a.range, description: a.description, image_url: a.image_url, available: a.available });
    setShowForm(true);
  };

  const startAdd = () => {
    setEditing(null);
    setForm({ ...emptyAircraft });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast('error', 'Name is required'); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/fleet/${editing.id}` : '/api/admin/fleet';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { toast('success', editing ? 'Aircraft updated' : 'Aircraft added'); await fetchFleet(); setShowForm(false); setEditing(null); }
      else toast('error', 'Failed to save aircraft');
    } catch (e) { toast('error', 'Failed to save aircraft'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/fleet/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { toast('success', 'Aircraft deleted'); await fetchFleet(); }
      else toast('error', 'Failed to delete');
    } catch (e) { toast('error', 'Failed to delete'); }
  };

  const toggleAvail = async (id: number) => {
    try {
      await fetch(`/api/admin/fleet/${id}/toggle`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      await fetchFleet();
    } catch (e) { console.error(e); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
        <p className="text-slate-300">Loading fleet...</p>
      </div>
    </div>
  );

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Fleet Manager</h1>
          <p className="text-slate-300 text-sm sm:text-base">Manage your aircraft fleet — changes appear on the live site</p>
        </div>
        <button onClick={startAdd} className="bg-gold hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">+ Add Aircraft</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/10 backdrop-blur-md border border-gold/30 rounded-xl p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{editing ? 'Edit Aircraft' : 'Add Aircraft'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
              <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Cessna 172 Skyhawk" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
              <select className={inputCls} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="Single Engine">Single Engine</option>
                <option value="Twin Engine">Twin Engine</option>
                <option value="Simulator">Simulator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Engine</label>
              <input className={inputCls} value={form.engine} onChange={e => setForm({ ...form, engine: e.target.value })} placeholder="e.g., Lycoming IO-360-L2A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Seats</label>
              <input type="number" className={inputCls} value={form.seats} onChange={e => setForm({ ...form, seats: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Horsepower</label>
              <input type="number" className={inputCls} value={form.horsepower} onChange={e => setForm({ ...form, horsepower: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cruise Speed</label>
              <input className={inputCls} value={form.cruise_speed} onChange={e => setForm({ ...form, cruise_speed: e.target.value })} placeholder="e.g., 124 kt" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Range</label>
              <input className={inputCls} value={form.range} onChange={e => setForm({ ...form, range: e.target.value })} placeholder="e.g., 640 nm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Image URL</label>
              <input className={inputCls} value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="/uploads/... or /images/..." />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
                <input type="checkbox" checked={!!form.available} onChange={e => setForm({ ...form, available: e.target.checked ? 1 : 0 })} className="w-5 h-5 rounded accent-gold" />
                <span className="text-slate-300 text-sm">Available</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea className={inputCls} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Aircraft description..." />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={handleSave} disabled={saving} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update Aircraft' : 'Add Aircraft'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Fleet List */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6">
        {fleet.length > 0 ? (
          <div className="space-y-4">
            {fleet.map(a => (
              <div key={a.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${a.available ? 'bg-green-400' : 'bg-red-400'}`} />
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">{a.name}</h3>
                      <p className="text-slate-400 text-sm">{a.type} • {a.seats} seats • {a.horsepower} HP • {a.cruise_speed}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => toggleAvail(a.id)} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${a.available ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'}`}>
                      {a.available ? 'Available' : 'In Maintenance'}
                    </button>
                    <button onClick={() => startEdit(a)} className="bg-gold hover:bg-yellow-500 text-navy-900 px-3 py-1 rounded text-xs font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(a.id, a.name)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded text-xs font-medium transition-colors">Delete</button>
                  </div>
                </div>
                {a.description && <p className="text-slate-400 text-sm mt-2 line-clamp-2">{a.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🛩️</div>
            <p className="text-slate-300 mb-2">No aircraft in fleet</p>
            <button onClick={startAdd} className="btn-gold mt-4">Add Your First Aircraft</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FleetManager;
