import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../components/admin/Toast';

interface ContentItem {
  id: number;
  section: string;
  key: string;
  content: string;
  updated_at: string;
}

interface NewContentItem {
  section: string;
  key: string;
  content: string;
}

const ContentEditor: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<NewContentItem>({ section: '', key: '', content: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (item: ContentItem) => {
    setEditingItem(item);
    setEditContent(item.content);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditContent('');
  };

  const saveContent = async () => {
    if (!editingItem) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/content/${editingItem.section}/${editingItem.key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        toast('success', 'Content saved');
        await fetchContent();
        setEditingItem(null);
        setEditContent('');
      } else {
        toast('error', 'Failed to save content');
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      toast('error', 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.section || !newItem.key || !newItem.content) {
      toast('error', 'All fields are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/content/${newItem.section}/${newItem.key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newItem.content })
      });

      if (response.ok) {
        toast('success', 'Content item added');
        setNewItem({ section: '', key: '', content: '' });
        setShowAddForm(false);
        await fetchContent();
      } else {
        toast('error', 'Failed to add content item');
      }
    } catch (error) {
      console.error('Failed to add content:', error);
      toast('error', 'Failed to add content');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (section: string, key: string) => {
    if (!confirm(`Delete "${section} → ${key}"?`)) return;

    try {
      const response = await fetch(`/api/admin/content/${section}/${key}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast('success', 'Content deleted');
        await fetchContent();
      } else {
        toast('error', 'Failed to delete content');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      toast('error', 'Failed to delete content');
    }
  };

  const sections = [...new Set(content.map(item => item.section))];
  
  let filteredContent = filter === 'all' ? content : content.filter(item => item.section === filter);
  
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredContent = filteredContent.filter(item =>
      item.key.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q)
    );
  }

  const getSectionIcon = (section: string) => {
    const icons: Record<string, string> = {
      'hero': '🏠',
      'about': 'ℹ️',
      'contact': '📞',
      'training': '✈️',
      'fleet': '🛩️',
      'maintenance': '🔧',
      'experiences': '🎯',
      'cta': '📣',
    };
    return icons[section] || '📄';
  };

  const formatKey = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Content Editor</h1>
          <p className="text-slate-300 text-sm sm:text-base">Edit site content — changes appear on the live site immediately</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gold hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {showAddForm ? '✕ Cancel' : '+ Add New'}
        </button>
      </div>

      {/* Add New Content Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-md border border-gold/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Content Item</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Section</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {sections.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewItem({ ...newItem, section: s })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        newItem.section === s
                          ? 'bg-gold text-navy-900'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {getSectionIcon(s)} {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newItem.section}
                  onChange={(e) => setNewItem({ ...newItem, section: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="Pick above or type a new section name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Key</label>
              <input
                type="text"
                value={newItem.key}
                onChange={(e) => setNewItem({ ...newItem, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="e.g., headline, subheadline, phone"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
            <textarea
              value={newItem.content}
              onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="Enter the content..."
            />
          </div>
          <button
            onClick={handleAddItem}
            disabled={saving || !newItem.section || !newItem.key || !newItem.content}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Content Item'}
          </button>
        </div>
      )}

      {/* Search + Filter */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search content..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gold text-navy-900'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            All ({content.length})
          </button>
          {sections.map(section => {
            const count = content.filter(item => item.section === section).length;
            return (
              <button
                key={section}
                onClick={() => setFilter(section)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === section
                    ? 'bg-gold text-navy-900'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {getSectionIcon(section)} {section} ({count})
              </button>
            );
          })}
        </div>

        {/* Content Items */}
        <div className="space-y-4">
          {filteredContent.map((item) => (
            <div key={`${item.section}-${item.key}`} className="bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getSectionIcon(item.section)}</span>
                    <h3 className="text-white font-medium">
                      {item.section} → {formatKey(item.key)}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">
                    Last updated: {new Date(item.updated_at).toLocaleDateString()}
                  </p>
                </div>
                {editingItem?.id === item.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={saveContent}
                      disabled={saving}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="bg-gold hover:bg-yellow-500 text-navy-900 px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.section, item.key)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingItem?.id === item.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={Math.min(8, Math.max(2, editContent.split('\n').length + 1))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="Enter content..."
                />
              ) : (
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-slate-200 whitespace-pre-wrap text-sm">{item.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400">
              {searchQuery ? `No results for "${searchQuery}"` : 'No content items found'}
            </p>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-300 mb-3">📖 Content Sections Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-blue-200 mb-1">🏠 hero</h3>
            <p className="text-blue-300/70">Homepage hero: headline, subheadline, CTA text/links, stat values</p>
          </div>
          <div>
            <h3 className="font-medium text-blue-200 mb-1">📞 contact</h3>
            <p className="text-blue-300/70">Phone, email, address, hours, social links — used across site</p>
          </div>
          <div>
            <h3 className="font-medium text-blue-200 mb-1">ℹ️ about</h3>
            <p className="text-blue-300/70">About page story text, team member bios</p>
          </div>
          <div>
            <h3 className="font-medium text-blue-200 mb-1">✈️ training</h3>
            <p className="text-blue-300/70">Training program descriptions, headlines</p>
          </div>
          <div>
            <h3 className="font-medium text-blue-200 mb-1">🎯 experiences</h3>
            <p className="text-blue-300/70">Tour prices, descriptions</p>
          </div>
          <div>
            <h3 className="font-medium text-blue-200 mb-1">📣 cta</h3>
            <p className="text-blue-300/70">Call-to-action banners: headlines, button text, links</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
