import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../components/admin/Toast';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TeamManager: React.FC = () => {
  const { token } = useAdmin();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Certified Flight Instructor', bio: '', sort_order: 0, is_active: true, photo_url: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/team', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMembers(await res.json());
      else toast('error', 'Failed to fetch team');
    } catch { toast('error', 'Error fetching team'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, [token]);

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ name: '', role: 'Certified Flight Instructor', bio: '', sort_order: members.length, is_active: true, photo_url: '' });
    setPhotoFile(null);
    setPhotoPreview('');
    setShowForm(true);
  };

  const handleEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setFormData({ name: m.name, role: m.role, bio: m.bio, sort_order: m.sort_order, is_active: !!m.is_active, photo_url: m.photo_url || '' });
    setPhotoFile(null);
    setPhotoPreview(m.photo_url || '');
    setShowForm(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast('error', 'Name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('role', formData.role);
      fd.append('bio', formData.bio);
      fd.append('sort_order', String(formData.sort_order));
      fd.append('is_active', String(formData.is_active));
      if (!photoFile) fd.append('photo_url', formData.photo_url);
      if (photoFile) fd.append('photo', photoFile);

      const url = editingId ? `/api/admin/team/${editingId}` : '/api/admin/team';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });

      if (res.ok) {
        toast('success', editingId ? 'Team member updated' : 'Team member added');
        setShowForm(false);
        await fetchMembers();
      } else {
        const err = await res.json();
        toast('error', err.error || 'Failed to save');
      }
    } catch { toast('error', 'Error saving team member'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this team member?')) return;
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { toast('success', 'Team member deleted'); await fetchMembers(); }
      else toast('error', 'Failed to delete');
    } catch { toast('error', 'Error deleting team member'); }
  };

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors';

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
        <p className="text-slate-300">Loading team...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Team Manager</h1>
          <p className="text-slate-300 text-sm sm:text-base">Manage instructors and staff — shown on the About page</p>
        </div>
        <button onClick={handleCreate} className="bg-gold hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">+ Add Team Member</button>
      </div>

      {/* Members List */}
      {!showForm && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          {members.length > 0 ? (
            <div className="divide-y divide-white/5">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-gold/30" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-aviation-blue to-gold flex items-center justify-center text-white font-bold text-lg">
                        {m.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{m.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${m.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                        {m.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gold text-sm">{m.role}</p>
                    <p className="text-slate-400 text-sm truncate">{m.bio}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(m)} className="bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1 rounded text-xs font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded text-xs font-medium transition-colors">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="text-5xl mb-4">👤</div>
              <p className="text-white font-medium text-lg mb-1">No team members yet</p>
              <p className="text-slate-400 text-sm mb-6">Add instructors and staff to show on the About page</p>
              <button onClick={handleCreate} className="bg-gold hover:bg-yellow-500 text-navy-900 px-5 py-2 rounded-lg font-semibold transition-colors">+ Add Team Member</button>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white/10 backdrop-blur-md border border-gold/30 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">{editingId ? 'Edit Team Member' : 'Add Team Member'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Photo</label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover ring-2 ring-gold/40" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aviation-blue to-gold flex items-center justify-center text-white font-bold text-2xl">
                    {formData.name ? formData.name.charAt(0) : '?'}
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-aviation-blue/20 hover:bg-aviation-blue/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-aviation-blue/30"
                  >
                    📷 Upload Photo
                  </button>
                  <p className="text-slate-500 text-xs mt-1">JPG, PNG, or WebP. Max 5MB.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                <input className={inputCls} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Jared Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <input className={inputCls} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g., Certified Flight Instructor" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Bio</label>
              <textarea className={inputCls} rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Short bio about this team member..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sort Order</label>
                <input type="number" className={inputCls} value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded accent-gold" />
                  <span className="text-slate-300 text-sm">Active (visible on site)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-white/10">
            <button onClick={handleSave} disabled={saving} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update Member' : 'Add Member'}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
