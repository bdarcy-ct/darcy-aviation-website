import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../components/admin/Toast';

interface TrainingProgram {
  id: number;
  slug: string;
  program_name: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_icon_svg?: string;
  overview: string[];
  requirements: string[];
  curriculum: { title: string; items: string[] }[];
  timeline_duration?: string;
  timeline_frequency?: string;
  timeline_details?: string;
  cost_note?: string;
  hide_cost_quote: boolean;
  fleet_used: { name: string; description: string }[];
  faqs: { q: string; a: string }[];
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TrainingProgramsManager: React.FC = () => {
  const { token } = useAdmin();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TrainingProgram>>({
    slug: '', program_name: '', hero_title: '', hero_subtitle: '', hero_description: '',
    hero_icon_svg: '', overview: [''], requirements: [''], curriculum: [{ title: '', items: [''] }],
    timeline_duration: '', timeline_frequency: '', timeline_details: '', cost_note: '',
    hide_cost_quote: false, fleet_used: [{ name: '', description: '' }],
    faqs: [{ q: '', a: '' }], cta_text: '', cta_link: '', sort_order: 0, is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/admin/training-programs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setPrograms(await response.json());
      else toast('error', 'Failed to fetch training programs');
    } catch {
      toast('error', 'Error fetching training programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, [token]);

  const handleEdit = (program: TrainingProgram) => {
    setEditingId(program.id);
    setFormData(program);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      slug: '', program_name: '', hero_title: '', hero_subtitle: '', hero_description: '',
      hero_icon_svg: '', overview: [''], requirements: [''], curriculum: [{ title: '', items: [''] }],
      timeline_duration: '', timeline_frequency: '', timeline_details: '', cost_note: '',
      hide_cost_quote: false, fleet_used: [{ name: '', description: '' }],
      faqs: [{ q: '', a: '' }], cta_text: '', cta_link: '', sort_order: programs.length + 1, is_active: true,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.program_name || !formData.hero_title || !formData.hero_subtitle || !formData.hero_description || !formData.cta_text || !formData.cta_link) {
      toast('error', 'Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/training-programs/${editingId}` : '/api/admin/training-programs';
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast('success', editingId ? 'Program updated' : 'Program created');
        setShowForm(false);
        await fetchPrograms();
      } else {
        const errorData = await response.json();
        toast('error', errorData.error || 'Failed to save program');
      }
    } catch {
      toast('error', 'Error saving program');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this training program?')) return;
    try {
      const response = await fetch(`/api/admin/training-programs/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) { toast('success', 'Program deleted'); await fetchPrograms(); }
      else toast('error', 'Failed to delete program');
    } catch {
      toast('error', 'Error deleting program');
    }
  };

  // Array helpers
  const updateArr = (field: 'overview' | 'requirements', i: number, v: string) => {
    const arr = [...(formData[field] || [])]; arr[i] = v; setFormData({ ...formData, [field]: arr });
  };
  const addArr = (field: 'overview' | 'requirements') => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), ''] });
  };
  const removeArr = (field: 'overview' | 'requirements', i: number) => {
    const arr = [...(formData[field] || [])]; arr.splice(i, 1); setFormData({ ...formData, [field]: arr });
  };

  const addCurriculumSection = () => setFormData({ ...formData, curriculum: [...(formData.curriculum || []), { title: '', items: [''] }] });
  const removeCurriculumSection = (i: number) => { const c = [...(formData.curriculum || [])]; c.splice(i, 1); setFormData({ ...formData, curriculum: c }); };
  const updateCurriculumTitle = (i: number, title: string) => { const c = [...(formData.curriculum || [])]; c[i] = { ...c[i], title }; setFormData({ ...formData, curriculum: c }); };
  const addCurriculumItem = (si: number) => { const c = [...(formData.curriculum || [])]; c[si].items.push(''); setFormData({ ...formData, curriculum: c }); };
  const removeCurriculumItem = (si: number, ii: number) => { const c = [...(formData.curriculum || [])]; c[si].items.splice(ii, 1); setFormData({ ...formData, curriculum: c }); };
  const updateCurriculumItem = (si: number, ii: number, v: string) => { const c = [...(formData.curriculum || [])]; c[si].items[ii] = v; setFormData({ ...formData, curriculum: c }); };

  const addFleetItem = () => setFormData({ ...formData, fleet_used: [...(formData.fleet_used || []), { name: '', description: '' }] });
  const removeFleetItem = (i: number) => { const f = [...(formData.fleet_used || [])]; f.splice(i, 1); setFormData({ ...formData, fleet_used: f }); };
  const updateFleetItem = (i: number, field: 'name' | 'description', v: string) => { const f = [...(formData.fleet_used || [])]; f[i] = { ...f[i], [field]: v }; setFormData({ ...formData, fleet_used: f }); };

  const addFAQ = () => setFormData({ ...formData, faqs: [...(formData.faqs || []), { q: '', a: '' }] });
  const removeFAQ = (i: number) => { const f = [...(formData.faqs || [])]; f.splice(i, 1); setFormData({ ...formData, faqs: f }); };
  const updateFAQ = (i: number, field: 'q' | 'a', v: string) => { const f = [...(formData.faqs || [])]; f[i] = { ...f[i], [field]: v }; setFormData({ ...formData, faqs: f }); };

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors';

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
        <p className="text-slate-300">Loading training programs...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Training Programs</h1>
          <p className="text-slate-300 text-sm sm:text-base">Manage training programs — each gets its own detail page</p>
        </div>
        <button onClick={handleCreate} className="bg-gold hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">+ Add Program</button>
      </div>

      {/* Programs List */}
      {!showForm && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          {programs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left px-6 py-3.5 text-slate-300 font-medium text-sm">Program</th>
                    <th className="text-left px-6 py-3.5 text-slate-300 font-medium text-sm">Slug</th>
                    <th className="text-left px-6 py-3.5 text-slate-300 font-medium text-sm">Order</th>
                    <th className="text-left px-6 py-3.5 text-slate-300 font-medium text-sm">Status</th>
                    <th className="text-right px-6 py-3.5 text-slate-300 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {programs.map((program) => (
                    <tr key={program.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{program.program_name}</div>
                        <div className="text-slate-400 text-sm">{program.hero_subtitle}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-sm">/{program.slug}</td>
                      <td className="px-6 py-4 text-slate-300">{program.sort_order}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${program.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                          {program.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(program)} className="bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1 rounded text-xs font-medium transition-colors">Edit</button>
                          <button onClick={() => handleDelete(program.id)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded text-xs font-medium transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="text-5xl mb-4">🎓</div>
              <p className="text-white font-medium text-lg mb-1">No training programs yet</p>
              <p className="text-slate-400 text-sm mb-6">Create your first training program to get started</p>
              <button onClick={handleCreate} className="bg-gold hover:bg-yellow-500 text-navy-900 px-5 py-2 rounded-lg font-semibold transition-colors">+ Add Program</button>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white/10 backdrop-blur-md border border-gold/30 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {editingId ? 'Edit Training Program' : 'Add Training Program'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Slug (URL path) *</label>
                <input className={inputCls} value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g., ppl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Program Name *</label>
                <input className={inputCls} value={formData.program_name || ''} onChange={e => setFormData({ ...formData, program_name: e.target.value })} placeholder="e.g., Private Pilot License (PPL)" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Hero Title *</label>
                <input className={inputCls} value={formData.hero_title || ''} onChange={e => setFormData({ ...formData, hero_title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Hero Subtitle *</label>
                <input className={inputCls} value={formData.hero_subtitle || ''} onChange={e => setFormData({ ...formData, hero_subtitle: e.target.value })} placeholder="e.g., Certificate Program" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Hero Description *</label>
              <textarea className={inputCls} rows={3} value={formData.hero_description || ''} onChange={e => setFormData({ ...formData, hero_description: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Hero Icon SVG (optional)</label>
              <textarea className={`${inputCls} font-mono text-sm`} rows={3} value={formData.hero_icon_svg || ''} onChange={e => setFormData({ ...formData, hero_icon_svg: e.target.value })} placeholder="Paste SVG code here..." />
            </div>

            {/* Overview */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Overview Paragraphs</label>
              {formData.overview?.map((p, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <textarea className={inputCls} rows={3} value={p} onChange={e => updateArr('overview', i, e.target.value)} />
                  <button onClick={() => removeArr('overview', i)} className="text-red-400 hover:text-red-300 p-2 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              <button onClick={() => addArr('overview')} className="text-gold hover:text-yellow-400 text-sm font-medium flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add Paragraph
              </button>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Requirements</label>
              {formData.requirements?.map((r, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className={inputCls} value={r} onChange={e => updateArr('requirements', i, e.target.value)} />
                  <button onClick={() => removeArr('requirements', i)} className="text-red-400 hover:text-red-300 p-2 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              <button onClick={() => addArr('requirements')} className="text-gold hover:text-yellow-400 text-sm font-medium flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add Requirement
              </button>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Timeline Duration</label>
                <input className={inputCls} value={formData.timeline_duration || ''} onChange={e => setFormData({ ...formData, timeline_duration: e.target.value })} placeholder="e.g., 3 to 6 months" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Timeline Frequency</label>
                <input className={inputCls} value={formData.timeline_frequency || ''} onChange={e => setFormData({ ...formData, timeline_frequency: e.target.value })} placeholder="e.g., 2-3 flights/week" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={formData.hide_cost_quote || false} onChange={e => setFormData({ ...formData, hide_cost_quote: e.target.checked })} className="w-5 h-5 rounded accent-gold" />
                  <span className="text-slate-300 text-sm">Hide Cost Quote</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Timeline Details</label>
              <textarea className={inputCls} rows={2} value={formData.timeline_details || ''} onChange={e => setFormData({ ...formData, timeline_details: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cost Note</label>
              <textarea className={inputCls} rows={2} value={formData.cost_note || ''} onChange={e => setFormData({ ...formData, cost_note: e.target.value })} />
            </div>

            {/* CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">CTA Text *</label>
                <input className={inputCls} value={formData.cta_text || ''} onChange={e => setFormData({ ...formData, cta_text: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">CTA Link *</label>
                <input className={inputCls} value={formData.cta_link || ''} onChange={e => setFormData({ ...formData, cta_link: e.target.value })} placeholder="e.g., /book" />
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sort Order</label>
                <input type="number" className={inputCls} value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })} />
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
              {saving ? 'Saving...' : editingId ? 'Update Program' : 'Create Program'}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingProgramsManager;
