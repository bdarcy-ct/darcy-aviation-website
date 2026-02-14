import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../contexts/AdminContext';

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
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Experience>>({
    slug: '',
    title: '',
    price: '',
    description: '',
    icon_svg: '',
    highlights: [''],
    featured: false,
    sort_order: 0,
    is_active: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/admin/experiences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setExperiences(data);
      } else {
        setError('Failed to fetch experiences');
      }
    } catch (error) {
      setError('Error fetching experiences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [token]);

  const handleEdit = (experience: Experience) => {
    setEditingId(experience.id);
    setFormData(experience);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      slug: '',
      title: '',
      price: '',
      description: '',
      icon_svg: '',
      highlights: [''],
      featured: false,
      sort_order: experiences.length + 1,
      is_active: true,
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.title || !formData.price || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const url = editingId 
        ? `/api/admin/experiences/${editingId}`
        : '/api/admin/experiences';
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
        setSuccess(editingId ? 'Experience updated successfully' : 'Experience created successfully');
        setShowForm(false);
        await fetchExperiences();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save experience');
      }
    } catch (error) {
      setError('Error saving experience');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      const response = await fetch(`/api/admin/experiences/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Experience deleted successfully');
        await fetchExperiences();
      } else {
        setError('Failed to delete experience');
      }
    } catch (error) {
      setError('Error deleting experience');
    }
  };

  const addHighlight = () => {
    setFormData({
      ...formData,
      highlights: [...(formData.highlights || []), '']
    });
  };

  const removeHighlight = (index: number) => {
    const newHighlights = [...(formData.highlights || [])];
    newHighlights.splice(index, 1);
    setFormData({ ...formData, highlights: newHighlights });
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...(formData.highlights || [])];
    newHighlights[index] = value;
    setFormData({ ...formData, highlights: newHighlights });
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
          <h1 className="text-2xl font-bold text-white">Experiences Manager</h1>
          <button
            onClick={handleCreate}
            className="bg-aviation-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Add New Experience
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

        {/* Experiences List */}
        {!showForm && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Experience</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Price</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Featured</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Order</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {experiences.map((experience) => (
                    <tr key={experience.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{experience.title}</div>
                        <div className="text-slate-400 text-sm font-mono">/{experience.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-semibold">{experience.price}</td>
                      <td className="px-6 py-4">
                        {experience.featured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gold/20 text-gold">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{experience.sort_order}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          experience.is_active 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {experience.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(experience)}
                          className="text-aviation-blue hover:text-blue-400 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(experience.id)}
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
                {editingId ? 'Edit Experience' : 'Create New Experience'}
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

            <div className="space-y-4">
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
                    placeholder="e.g., discovery-flight"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Discovery Flight"
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Price *
                </label>
                <input
                  type="text"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., $249"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Icon SVG (optional)
                </label>
                <textarea
                  value={formData.icon_svg || ''}
                  onChange={(e) => setFormData({ ...formData, icon_svg: e.target.value })}
                  rows={4}
                  placeholder="Paste SVG code here..."
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue font-mono text-sm"
                />
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Highlights
                </label>
                {formData.highlights?.map((highlight, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      placeholder="e.g., ~30 minutes"
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                    />
                    <button
                      onClick={() => removeHighlight(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={addHighlight}
                  className="text-aviation-blue hover:text-blue-400 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Highlight
                </button>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    Featured
                  </label>
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

export default ExperiencesManager;