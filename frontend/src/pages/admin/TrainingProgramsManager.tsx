import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../contexts/AdminContext';

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
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TrainingProgram>>({
    slug: '',
    program_name: '',
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_icon_svg: '',
    overview: [''],
    requirements: [''],
    curriculum: [{ title: '', items: [''] }],
    timeline_duration: '',
    timeline_frequency: '',
    timeline_details: '',
    cost_note: '',
    hide_cost_quote: false,
    fleet_used: [{ name: '', description: '' }],
    faqs: [{ q: '', a: '' }],
    cta_text: '',
    cta_link: '',
    sort_order: 0,
    is_active: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/admin/training-programs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      } else {
        setError('Failed to fetch training programs');
      }
    } catch (error) {
      setError('Error fetching training programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [token]);

  const handleEdit = (program: TrainingProgram) => {
    setEditingId(program.id);
    setFormData(program);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      slug: '',
      program_name: '',
      hero_title: '',
      hero_subtitle: '',
      hero_description: '',
      hero_icon_svg: '',
      overview: [''],
      requirements: [''],
      curriculum: [{ title: '', items: [''] }],
      timeline_duration: '',
      timeline_frequency: '',
      timeline_details: '',
      cost_note: '',
      hide_cost_quote: false,
      fleet_used: [{ name: '', description: '' }],
      faqs: [{ q: '', a: '' }],
      cta_text: '',
      cta_link: '',
      sort_order: programs.length + 1,
      is_active: true,
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.program_name || !formData.hero_title || !formData.hero_subtitle || !formData.hero_description || !formData.cta_text || !formData.cta_link) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const url = editingId 
        ? `/api/admin/training-programs/${editingId}`
        : '/api/admin/training-programs';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(editingId ? 'Program updated successfully' : 'Program created successfully');
        setShowForm(false);
        await fetchPrograms();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save program');
      }
    } catch (error) {
      setError('Error saving program');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this training program?')) return;

    try {
      const response = await fetch(`/api/admin/training-programs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Program deleted successfully');
        await fetchPrograms();
      } else {
        setError('Failed to delete program');
      }
    } catch (error) {
      setError('Error deleting program');
    }
  };

  const addOverviewItem = () => {
    setFormData({
      ...formData,
      overview: [...(formData.overview || []), '']
    });
  };

  const removeOverviewItem = (index: number) => {
    const newOverview = [...(formData.overview || [])];
    newOverview.splice(index, 1);
    setFormData({ ...formData, overview: newOverview });
  };

  const updateOverviewItem = (index: number, value: string) => {
    const newOverview = [...(formData.overview || [])];
    newOverview[index] = value;
    setFormData({ ...formData, overview: newOverview });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...(formData.requirements || []), '']
    });
  };

  const removeRequirement = (index: number) => {
    const newRequirements = [...(formData.requirements || [])];
    newRequirements.splice(index, 1);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...(formData.requirements || [])];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addCurriculumSection = () => {
    setFormData({
      ...formData,
      curriculum: [...(formData.curriculum || []), { title: '', items: [''] }]
    });
  };

  const removeCurriculumSection = (index: number) => {
    const newCurriculum = [...(formData.curriculum || [])];
    newCurriculum.splice(index, 1);
    setFormData({ ...formData, curriculum: newCurriculum });
  };

  const updateCurriculumTitle = (index: number, title: string) => {
    const newCurriculum = [...(formData.curriculum || [])];
    newCurriculum[index] = { ...newCurriculum[index], title };
    setFormData({ ...formData, curriculum: newCurriculum });
  };

  const addCurriculumItem = (sectionIndex: number) => {
    const newCurriculum = [...(formData.curriculum || [])];
    newCurriculum[sectionIndex].items.push('');
    setFormData({ ...formData, curriculum: newCurriculum });
  };

  const removeCurriculumItem = (sectionIndex: number, itemIndex: number) => {
    const newCurriculum = [...(formData.curriculum || [])];
    newCurriculum[sectionIndex].items.splice(itemIndex, 1);
    setFormData({ ...formData, curriculum: newCurriculum });
  };

  const updateCurriculumItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const newCurriculum = [...(formData.curriculum || [])];
    newCurriculum[sectionIndex].items[itemIndex] = value;
    setFormData({ ...formData, curriculum: newCurriculum });
  };

  const addFleetItem = () => {
    setFormData({
      ...formData,
      fleet_used: [...(formData.fleet_used || []), { name: '', description: '' }]
    });
  };

  const removeFleetItem = (index: number) => {
    const newFleet = [...(formData.fleet_used || [])];
    newFleet.splice(index, 1);
    setFormData({ ...formData, fleet_used: newFleet });
  };

  const updateFleetItem = (index: number, field: 'name' | 'description', value: string) => {
    const newFleet = [...(formData.fleet_used || [])];
    newFleet[index] = { ...newFleet[index], [field]: value };
    setFormData({ ...formData, fleet_used: newFleet });
  };

  const addFAQ = () => {
    setFormData({
      ...formData,
      faqs: [...(formData.faqs || []), { q: '', a: '' }]
    });
  };

  const removeFAQ = (index: number) => {
    const newFAQs = [...(formData.faqs || [])];
    newFAQs.splice(index, 1);
    setFormData({ ...formData, faqs: newFAQs });
  };

  const updateFAQ = (index: number, field: 'q' | 'a', value: string) => {
    const newFAQs = [...(formData.faqs || [])];
    newFAQs[index] = { ...newFAQs[index], [field]: value };
    setFormData({ ...formData, faqs: newFAQs });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-white">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Training Programs Manager</h1>
          <button
            onClick={handleCreate}
            className="bg-aviation-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Add New Program
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Programs List */}
        {!showForm && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Program</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Slug</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Order</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {programs.map((program) => (
                    <tr key={program.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{program.program_name}</div>
                        <div className="text-slate-400 text-sm">{program.hero_subtitle}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-sm">/{program.slug}</td>
                      <td className="px-6 py-4 text-slate-300">{program.sort_order}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          program.is_active 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {program.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(program)}
                          className="text-aviation-blue hover:text-blue-400 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(program.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingId ? 'Edit Training Program' : 'Create New Training Program'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slug (URL path) *
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., ppl"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={formData.program_name || ''}
                    onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                    placeholder="e.g., Private Pilot License (PPL)"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hero Title *
                  </label>
                  <input
                    type="text"
                    value={formData.hero_title || ''}
                    onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hero Subtitle *
                  </label>
                  <input
                    type="text"
                    value={formData.hero_subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                    placeholder="e.g., Certificate Program"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hero Description *
                </label>
                <textarea
                  value={formData.hero_description || ''}
                  onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hero Icon SVG (optional)
                </label>
                <textarea
                  value={formData.hero_icon_svg || ''}
                  onChange={(e) => setFormData({ ...formData, hero_icon_svg: e.target.value })}
                  rows={3}
                  placeholder="Paste SVG code here..."
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue font-mono text-sm"
                />
              </div>

              {/* Overview */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Overview Paragraphs
                </label>
                {formData.overview?.map((paragraph, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <textarea
                      value={paragraph}
                      onChange={(e) => updateOverviewItem(index, e.target.value)}
                      rows={3}
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                    />
                    <button
                      onClick={() => removeOverviewItem(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOverviewItem}
                  className="text-aviation-blue hover:text-blue-400 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Overview Paragraph
                </button>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Requirements
                </label>
                {formData.requirements?.map((requirement, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                    />
                    <button
                      onClick={() => removeRequirement(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={addRequirement}
                  className="text-aviation-blue hover:text-blue-400 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Requirement
                </button>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Timeline Duration
                  </label>
                  <input
                    type="text"
                    value={formData.timeline_duration || ''}
                    onChange={(e) => setFormData({ ...formData, timeline_duration: e.target.value })}
                    placeholder="e.g., 3 to 6 months"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Timeline Frequency
                  </label>
                  <input
                    type="text"
                    value={formData.timeline_frequency || ''}
                    onChange={(e) => setFormData({ ...formData, timeline_frequency: e.target.value })}
                    placeholder="e.g., 2-3 flights per week"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-slate-300 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.hide_cost_quote || false}
                      onChange={(e) => setFormData({ ...formData, hide_cost_quote: e.target.checked })}
                      className="mr-2"
                    />
                    Hide Cost Quote
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Timeline Details
                </label>
                <textarea
                  value={formData.timeline_details || ''}
                  onChange={(e) => setFormData({ ...formData, timeline_details: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cost Note
                </label>
                <textarea
                  value={formData.cost_note || ''}
                  onChange={(e) => setFormData({ ...formData, cost_note: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CTA Text *
                  </label>
                  <input
                    type="text"
                    value={formData.cta_text || ''}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CTA Link *
                  </label>
                  <input
                    type="text"
                    value={formData.cta_link || ''}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    placeholder="e.g., /book"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-slate-300 mb-2 mt-6">
                    <input
                      type="checkbox"
                      checked={formData.is_active !== false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/20">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-aviation-blue hover:bg-blue-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="border border-white/20 hover:border-white/40 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TrainingProgramsManager;