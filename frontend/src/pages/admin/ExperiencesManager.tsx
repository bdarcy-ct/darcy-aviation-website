import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../components/admin/Toast';

interface Experience {
  id: number;
  slug: string;
  title: string;
  price: string;
  description: string;
  icon_svg?: string;
  highlights: string[];
  featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ExperiencesManager: React.FC = () => {
  const { token } = useAdmin();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Experience>>({
    slug: '', title: '', price: '', description: '', icon_svg: '',
    highlights: [''], featured: false, sort_order: 0, is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/admin/experiences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setExperiences(await response.json());
      else toast('error', 'Failed to fetch experiences');
    } catch {
      toast('error', 'Error fetching experiences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExperiences(); }, [token]);

  const handleEdit = (experience: Experience) => {
    setEditingId(experience.id);
    setFormData(experience);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      slug: '', title: '', price: '', description: '', icon_svg: '',
      highlights: [''], featured: false, sort_order: experiences.length + 1, is_active: true,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.title || !formData.price || !formData.description) {
      toast('error', 'Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/experiences/${editingId}` : '/api/admin/experiences';
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast('success', editingId ? 'Experience updated' : 'Experience created');
        setShowForm(false);
        await fetchExperiences();
      } else {
        const errorData = await response.json();
        toast('error', errorData.error || 'Failed to save experience');
      }
    } catch {
      toast('error', 'Error saving experience');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      const response = await fetch(`/api/admin/experiences/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) { toast('success', 'Experience deleted'); await fetchExperiences(); }
      else toast('error', 'Failed to delete experience');
    } catch {
      toast('error', 'Error deleting experience');
    }
  };

  const addHighlight = () => setFormData({ ...formData, highlights: [...(formData.highlights || []), ''] });
  const removeHighlight = (i: number) => { const h = [...(formData.highlights || [])]; h.splice(i, 1); setFormData({ ...formData, highlights: h }); };
  const updateHighlight = (i: number, v: string) => { const h = [...(formData.highlights || [])]; h[i] = v; setFormData({ ...formData, highlights: h }); };

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors';

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
        <p className="text-slate-300">Loading experiences...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Experiences Manager</h1>
          <p className="text-slate-300 text-sm sm:text-base">Manage flight experiences — featured ones show on the homepage</p>
        </div>
        <button onClick={handleCreate} className="bg-gold hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">+ Add Experience</button>
      </div>

      {/* Experiences List */}
      {!showForm && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          {experiences.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left px-6 py-3.5 text-slate-300 font-medium text-sm">Experience</th>
                    <th className="text-left px-6 py-3.5 text-slate-300 font-medium text-sm">Price</th>
                    <th className="text-left px-6 py-3.5 text-slate-300 font-medium text-sm">Featured</th>
                    <th className="text-left px-6 py-3.5 text-slate-300 font-medium text-sm">Order</th>
                    <th className="text-left px-6 py-3.5 text-slate-300 font-medium text-sm">Status</th>
                    <th className="text-right px-6 py-3.5 text-slate-300 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {experiences.map((experience) => (
                    <tr key={experience.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{experience.title}</div>
                        <div className="text-slate-400 text-sm font-mono">/{experience.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-gold font-semibold">{experience.price}</td>
                      <td className="px-6 py-4">
                        {experience.featured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gold/20 text-gold">⭐ Featured</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{experience.sort_order}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${experience.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                          {experience.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(experience)} className="bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1 rounded text-xs font-medium transition-colors">Edit</button>
                          <button onClick={() => handleDelete(experience.id)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded text-xs font-medium transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="text-5xl mb-4">✈️</div>
              <p className="text-white font-medium text-lg mb-1">No experiences yet</p>
              <p className="text-slate-400 text-sm mb-6">Create your first flight experience to get started</p>
              <button onClick={handleCreate} className="bg-gold hover:bg-yellow-500 text-navy-900 px-5 py-2 rounded-lg font-semibold transition-colors">+ Add Experience</button>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white/10 backdrop-blur-md border border-gold/30 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {editingId ? 'Edit Experience' : 'Add Experience'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Slug (URL path) *</label>
                <input className={inputCls} value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g., discovery-flight" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                <input className={inputCls} value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Discovery Flight" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Price *</label>
                <input className={inputCls} value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="e.g., $279" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
              <textarea className={inputCls} rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Icon SVG (optional)</label>
              <textarea className={`${inputCls} font-mono text-sm`} rows={3} value={formData.icon_svg || ''} onChange={e => setFormData({ ...formData, icon_svg: e.target.value })} placeholder="Paste SVG code here..." />
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Highlights</label>
              {formData.highlights?.map((h, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className={inputCls} value={h} onChange={e => updateHighlight(i, e.target.value)} placeholder="e.g., ~30 minutes" />
                  <button onClick={() => removeHighlight(i)} className="text-red-400 hover:text-red-300 p-2 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              <button onClick={addHighlight} className="text-gold hover:text-yellow-400 text-sm font-medium flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add Highlight
              </button>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sort Order</label>
                <input type="number" className={inputCls} value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={formData.featured || false} onChange={e => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 rounded accent-gold" />
                  <span className="text-slate-300 text-sm">⭐ Featured</span>
                </label>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={formData.is_active !== false} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded accent-gold" />
                  <span className="text-slate-300 text-sm">Active</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-white/10">
            <button onClick={handleSave} disabled={saving} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update Experience' : 'Create Experience'}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperiencesManager;
