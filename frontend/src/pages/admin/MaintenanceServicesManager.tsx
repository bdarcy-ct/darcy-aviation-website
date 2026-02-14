import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../contexts/AdminContext';

interface MaintenanceService {
  id: number;
  title: string;
  description: string;
  icon_svg?: string;
  details: string[];
  includes: string[];
  note?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MaintenanceServicesManager: React.FC = () => {
  const { token } = useAdmin();
  const [services, setServices] = useState<MaintenanceService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<MaintenanceService>>({
    title: '',
    description: '',
    icon_svg: '',
    details: [''],
    includes: [''],
    note: '',
    sort_order: 0,
    is_active: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/maintenance-services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        setError('Failed to fetch maintenance services');
      }
    } catch (error) {
      setError('Error fetching maintenance services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleEdit = (service: MaintenanceService) => {
    setEditingId(service.id);
    setFormData(service);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      icon_svg: '',
      details: [''],
      includes: [''],
      note: '',
      sort_order: services.length + 1,
      is_active: true,
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const url = editingId 
        ? `/api/admin/maintenance-services/${editingId}`
        : '/api/admin/maintenance-services';
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
        setSuccess(editingId ? 'Service updated successfully' : 'Service created successfully');
        setShowForm(false);
        await fetchServices();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save service');
      }
    } catch (error) {
      setError('Error saving service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this maintenance service?')) return;

    try {
      const response = await fetch(`/api/admin/maintenance-services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Service deleted successfully');
        await fetchServices();
      } else {
        setError('Failed to delete service');
      }
    } catch (error) {
      setError('Error deleting service');
    }
  };

  const addDetail = () => {
    setFormData({
      ...formData,
      details: [...(formData.details || []), '']
    });
  };

  const removeDetail = (index: number) => {
    const newDetails = [...(formData.details || [])];
    newDetails.splice(index, 1);
    setFormData({ ...formData, details: newDetails });
  };

  const updateDetail = (index: number, value: string) => {
    const newDetails = [...(formData.details || [])];
    newDetails[index] = value;
    setFormData({ ...formData, details: newDetails });
  };

  const addInclude = () => {
    setFormData({
      ...formData,
      includes: [...(formData.includes || []), '']
    });
  };

  const removeInclude = (index: number) => {
    const newIncludes = [...(formData.includes || [])];
    newIncludes.splice(index, 1);
    setFormData({ ...formData, includes: newIncludes });
  };

  const updateInclude = (index: number, value: string) => {
    const newIncludes = [...(formData.includes || [])];
    newIncludes[index] = value;
    setFormData({ ...formData, includes: newIncludes });
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
          <h1 className="text-2xl font-bold text-white">Maintenance Services Manager</h1>
          <button
            onClick={handleCreate}
            className="bg-aviation-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Add New Service
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

        {/* Services List */}
        {!showForm && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Service</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Order</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{service.title}</div>
                        <div className="text-slate-400 text-sm">{service.description.substring(0, 100)}...</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{service.sort_order}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          service.is_active 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-aviation-blue hover:text-blue-400 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
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
                {editingId ? 'Edit Maintenance Service' : 'Create New Maintenance Service'}
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Annual Inspections"
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
                  rows={3}
                  placeholder="Brief description of the service..."
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

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Service Details
                </label>
                {formData.details?.map((detail, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <textarea
                      value={detail}
                      onChange={(e) => updateDetail(index, e.target.value)}
                      rows={3}
                      placeholder="Detail paragraph..."
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                    />
                    <button
                      onClick={() => removeDetail(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={addDetail}
                  className="text-aviation-blue hover:text-blue-400 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Detail
                </button>
              </div>

              {/* Includes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What's Included
                </label>
                {formData.includes?.map((include, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={include}
                      onChange={(e) => updateInclude(index, e.target.value)}
                      placeholder="What's included in this service..."
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                    />
                    <button
                      onClick={() => removeInclude(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={addInclude}
                  className="text-aviation-blue hover:text-blue-400 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Included Item
                </button>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Additional Note (optional)
                </label>
                <textarea
                  value={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                  placeholder="Special note or call-out for this service..."
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aviation-blue"
                />
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

export default MaintenanceServicesManager;