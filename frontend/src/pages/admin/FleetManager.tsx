import React, { useState, useEffect, useRef } from 'react';
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
  images: string[];
  available: number;
}

const emptyForm = {
  name: '', type: 'Single Engine', engine: '', seats: 4, horsepower: 0,
  cruise_speed: '', range: '', description: '', image_url: '', images: [] as string[], available: 1,
};

const FleetManager: React.FC = () => {
  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Aircraft | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { token } = useAdmin();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchFleet(); }, []);

  const fetchFleet = async () => {
    try {
      const res = await fetch('/api/admin/fleet', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setFleet(data.map((a: any) => ({ ...a, images: Array.isArray(a.images) ? a.images : [] })));
      }
    } catch (e) { console.error('Failed to fetch fleet:', e); }
    finally { setIsLoading(false); }
  };

  const startEdit = (a: Aircraft) => {
    setEditing(a);
    setForm({
      name: a.name, type: a.type, engine: a.engine, seats: a.seats, horsepower: a.horsepower,
      cruise_speed: a.cruise_speed, range: a.range, description: a.description,
      image_url: a.image_url, images: a.images || [], available: a.available,
    });
    setShowForm(true);
  };

  const startAdd = () => { setEditing(null); setForm({ ...emptyForm, images: [] }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name) { toast('error', 'Name is required'); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/fleet/${editing.id}` : '/api/admin/fleet';
      const method = editing ? 'PUT' : 'POST';
      // Use first image as image_url fallback
      const payload = { ...form, image_url: form.images[0] || form.image_url || '' };
      const res = await fetch(url, {
        method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages = [...form.images];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          newImages.push(data.url || `/uploads/${data.filename}`);
        }
      } catch { /* skip failed uploads */ }
    }
    setForm({ ...form, images: newImages });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast('success', `${newImages.length - form.images.length} image(s) uploaded`);
  };

  const removeImage = (idx: number) => {
    const imgs = [...form.images];
    imgs.splice(idx, 1);
    setForm({ ...form, images: imgs });
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    const imgs = [...form.images];
    const target = idx + dir;
    if (target < 0 || target >= imgs.length) return;
    [imgs[idx], imgs[target]] = [imgs[target], imgs[idx]];
    setForm({ ...form, images: imgs });
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
          <p className="text-slate-300 text-sm sm:text-base">Manage your aircraft fleet — add multiple photos that cycle on the tile</p>
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
            <div className="flex items-end">
              <label className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
                <input type="checkbox" checked={!!form.available} onChange={e => setForm({ ...form, available: e.target.checked ? 1 : 0 })} className="w-5 h-5 rounded accent-gold" />
                <span className="text-slate-300 text-sm">Available</span>
              </label>
            </div>
          </div>

          {/* Multi-Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Aircraft Photos (cycle every 2s on tile)</label>
            
            {/* Thumbnails */}
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-24 h-18 rounded-lg object-cover border border-white/20" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                      {idx > 0 && (
                        <button onClick={() => moveImage(idx, -1)} className="bg-white/20 hover:bg-white/40 text-white rounded p-1 text-xs">←</button>
                      )}
                      <button onClick={() => removeImage(idx)} className="bg-red-500/80 hover:bg-red-500 text-white rounded p-1 text-xs">✕</button>
                      {idx < form.images.length - 1 && (
                        <button onClick={() => moveImage(idx, 1)} className="bg-white/20 hover:bg-white/40 text-white rounded p-1 text-xs">→</button>
                      )}
                    </div>
                    {idx === 0 && (
                      <span className="absolute -top-1 -left-1 bg-gold text-navy-900 text-[10px] font-bold px-1.5 py-0.5 rounded">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-aviation-blue/20 hover:bg-aviation-blue/30 text-aviation-blue border border-aviation-blue/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {uploading ? 'Uploading...' : `📷 Add Photo${form.images.length > 0 ? 's' : ''}`}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              <span className="text-slate-500 text-xs self-center">{form.images.length} photo{form.images.length !== 1 ? 's' : ''} • Select multiple at once</span>
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
                    {(a.images?.length > 0 || a.image_url) ? (
                      <img src={a.images?.[0] || a.image_url} alt={a.name} className="w-16 h-12 rounded-lg object-cover flex-shrink-0 border border-white/10" />
                    ) : (
                      <div className="w-16 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-2xl">🛩️</div>
                    )}
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${a.available ? 'bg-green-400' : 'bg-red-400'}`} />
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">{a.name}</h3>
                      <p className="text-slate-400 text-sm">{a.type} • {a.seats} seats • {a.images?.length || 0} photos</p>
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
