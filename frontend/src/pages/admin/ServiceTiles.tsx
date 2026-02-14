import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

interface ServiceTile {
  id: number;
  title: string;
  description: string;
  link: string;
  icon_svg: string | null;
  images: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ServiceTiles: React.FC = () => {
  const [tiles, setTiles] = useState<ServiceTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTile, setEditingTile] = useState<ServiceTile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAdmin();

  useEffect(() => {
    fetchTiles();
  }, []);

  const fetchTiles = async () => {
    try {
      const response = await fetch('/api/admin/service-tiles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTiles(data);
      }
    } catch (error) {
      console.error('Failed to fetch service tiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: Omit<ServiceTile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const url = editingTile 
        ? `/api/admin/service-tiles/${editingTile.id}`
        : '/api/admin/service-tiles';
      
      const method = editingTile ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchTiles();
        setShowForm(false);
        setEditingTile(null);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to save service tile:', error);
      alert('Failed to save service tile');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const response = await fetch(`/api/admin/service-tiles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchTiles();
      } else {
        alert('Failed to delete service tile');
      }
    } catch (error) {
      console.error('Failed to delete service tile:', error);
      alert('Failed to delete service tile');
    }
  };

  const openEditForm = (tile: ServiceTile) => {
    setEditingTile(tile);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingTile(null);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading service tiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Service Tiles</h1>
          <p className="text-slate-300">Manage the service tiles shown on the homepage</p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-gold hover:bg-yellow-500 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Add New Tile
        </button>
      </div>

      {/* Service Tiles List */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        {tiles.length > 0 ? (
          <div className="space-y-4">
            {tiles.map((tile) => (
              <div key={tile.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {tile.icon_svg && (
                        <div className="text-aviation-blue" dangerouslySetInnerHTML={{ __html: tile.icon_svg }} />
                      )}
                      <h3 className="text-xl font-semibold text-white">{tile.title}</h3>
                      {!tile.is_active && (
                        <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">Inactive</span>
                      )}
                    </div>
                    <p className="text-slate-300 mb-2">{tile.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>Link: {tile.link}</span>
                      <span>•</span>
                      <span>Images: {tile.images.length}</span>
                      <span>•</span>
                      <span>Order: {tile.sort_order}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEditForm(tile)}
                      className="bg-aviation-blue/20 hover:bg-aviation-blue/30 text-blue-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tile.id, tile.title)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-slate-300 mb-2">No service tiles found</p>
            <p className="text-slate-400 text-sm">Add your first service tile to get started</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ServiceTileForm
          tile={editingTile}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTile(null);
          }}
        />
      )}
    </div>
  );
};

// Service Tile Form Component
interface ServiceTileFormProps {
  tile: ServiceTile | null;
  onSubmit: (data: Omit<ServiceTile, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const ServiceTileForm: React.FC<ServiceTileFormProps> = ({ tile, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: tile?.title || '',
    description: tile?.description || '',
    link: tile?.link || '',
    icon_svg: tile?.icon_svg || '',
    images: tile?.images || [],
    sort_order: tile?.sort_order || 0,
    is_active: tile?.is_active ?? true,
  });
  const [imageInput, setImageInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.link) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  const addImage = () => {
    if (imageInput && !formData.images.includes(imageInput)) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput]
      });
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-navy-800 border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {tile ? 'Edit Service Tile' : 'Create Service Tile'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Service title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold h-24 resize-none"
              placeholder="Service description"
              required
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Link *
            </label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="/training"
              required
            />
          </div>

          {/* Icon SVG */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Icon SVG (optional)
            </label>
            <textarea
              value={formData.icon_svg}
              onChange={(e) => setFormData({ ...formData, icon_svg: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold h-20 resize-none font-mono text-sm"
              placeholder="<svg>...</svg>"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Images
            </label>
            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-slate-300 text-sm flex-1">{image}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                  placeholder="/images/training/train-1.jpg"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="bg-aviation-blue/20 hover:bg-aviation-blue/30 text-blue-300 px-4 py-2 rounded-lg text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Sort Order & Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold"
                min="0"
              />
            </div>
            <div className="flex items-center gap-3 mt-8">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 text-gold bg-white/10 border-white/20 rounded focus:ring-gold"
              />
              <label className="text-slate-300 text-sm">Active</label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="bg-gold hover:bg-yellow-500 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {tile ? 'Update' : 'Create'} Tile
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-white/10 hover:bg-white/20 text-slate-300 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceTiles;