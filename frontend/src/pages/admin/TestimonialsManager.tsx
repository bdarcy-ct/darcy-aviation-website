import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
  featured: number;
}

const emptyTestimonial = { name: '', rating: 5, text: '', date: '', featured: 0 };

const TestimonialsManager: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyTestimonial);
  const [saving, setSaving] = useState(false);
  const { token } = useAdmin();

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setTestimonials(await res.json());
    } catch (e) { console.error('Failed to fetch testimonials:', e); }
    finally { setIsLoading(false); }
  };

  const startEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, rating: t.rating, text: t.text, date: t.date || '', featured: t.featured });
    setShowForm(true);
  };

  const startAdd = () => {
    setEditing(null);
    setForm({ ...emptyTestimonial, date: new Date().toISOString().split('T')[0] });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.text) { alert('Name and testimonial text are required'); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/testimonials/${editing.id}` : '/api/admin/testimonials';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { await fetchTestimonials(); setShowForm(false); setEditing(null); }
      else alert('Failed to save');
    } catch (e) { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) await fetchTestimonials();
      else alert('Failed to delete');
    } catch (e) { alert('Failed to delete'); }
  };

  const toggleFeatured = async (id: number) => {
    try {
      await fetch(`/api/admin/testimonials/${id}/feature`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      await fetchTestimonials();
    } catch (e) { console.error(e); }
  };

  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
        <p className="text-slate-300">Loading testimonials...</p>
      </div>
    </div>
  );

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Testimonials</h1>
          <p className="text-slate-300 text-sm sm:text-base">Manage student reviews — featured ones appear on the homepage</p>
        </div>
        <button onClick={startAdd} className="bg-gold hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">+ Add Testimonial</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/10 backdrop-blur-md border border-gold/30 rounded-xl p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
              <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Michael R." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Rating</label>
              <select className={inputCls} value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{renderStars(r)} ({r}/5)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
              <input type="date" className={inputCls} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Testimonial Text *</label>
            <textarea className={inputCls} rows={4} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="What did they say about Darcy Aviation?" />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={!!form.featured} onChange={e => setForm({ ...form, featured: e.target.checked ? 1 : 0 })} className="w-5 h-5 rounded accent-gold" />
              <span className="text-slate-300 text-sm">⭐ Featured on homepage</span>
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={handleSave} disabled={saving} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update' : 'Add Testimonial'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6">
        {testimonials.length > 0 ? (
          <div className="space-y-4">
            {testimonials.map(t => (
              <div key={t.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{t.name}</h3>
                      <span className="text-gold text-sm">{renderStars(t.rating)}</span>
                      {t.featured ? <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">⭐ Featured</span> : null}
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-1">"{t.text}"</p>
                    {t.date && <p className="text-slate-500 text-xs">{new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => toggleFeatured(t.id)} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${t.featured ? 'bg-gold/20 text-gold hover:bg-gold/30' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>
                      {t.featured ? '⭐ Featured' : '☆ Feature'}
                    </button>
                    <button onClick={() => startEdit(t)} className="bg-gold hover:bg-yellow-500 text-navy-900 px-3 py-1 rounded text-xs font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(t.id, t.name)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded text-xs font-medium transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-slate-300 mb-2">No testimonials yet</p>
            <button onClick={startAdd} className="btn-gold mt-4">Add Your First Testimonial</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsManager;
