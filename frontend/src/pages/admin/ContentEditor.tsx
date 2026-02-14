import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

interface ContentItem {
  id: number;
  section: string;
  key: string;
  content: string;
  updated_at: string;
}

const ContentEditor: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const { token } = useAdmin();

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
        await fetchContent(); // Refresh the list
        setEditingItem(null);
        setEditContent('');
      } else {
        alert('Failed to save content');
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const sections = [...new Set(content.map(item => item.section))];
  const filteredContent = filter === 'all' ? content : content.filter(item => item.section === filter);

  const getSectionIcon = (section: string) => {
    const icons: { [key: string]: string } = {
      'hero': '🏠',
      'about': 'ℹ️',
      'contact': '📞',
      'training': '✈️',
      'fleet': '🛩️',
      'maintenance': '🔧',
      'experiences': '🎯'
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Content Editor</h1>
        <p className="text-slate-300">Edit site content and copy</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gold text-navy-900'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            All Sections
          </button>
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setFilter(section)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === section
                  ? 'bg-gold text-navy-900'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {getSectionIcon(section)} {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
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
                  <button
                    onClick={() => startEdit(item)}
                    className="bg-gold hover:bg-yellow-500 text-navy-900 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingItem?.id === item.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="Enter content..."
                />
              ) : (
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-slate-200 whitespace-pre-wrap">{item.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400">No content items found</p>
          </div>
        )}
      </div>

      {/* Add New Content Item */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Add New Content Item</h2>
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">
            <strong>Note:</strong> New content items should typically be added through code. 
            This interface is primarily for editing existing content. Contact your developer 
            to add new content sections or keys.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;