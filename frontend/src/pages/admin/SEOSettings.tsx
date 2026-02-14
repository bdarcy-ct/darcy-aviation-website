import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../components/admin/Toast';

interface PageMeta {
  id: number;
  page_slug: string;
  title: string;
  description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  updated_at: string;
}

const SEOSettings: React.FC = () => {
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<PageMeta | null>(null);
  const [saving, setSaving] = useState(false);
  const { token } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    fetchPageMeta();
  }, []);

  const fetchPageMeta = async () => {
    try {
      const response = await fetch('/api/admin/content/meta', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error('Failed to fetch page meta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (pageSlug: string, metaData: Partial<PageMeta>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/content/meta/${pageSlug}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metaData)
      });

      if (response.ok) {
        toast('success', 'SEO settings saved');
        await fetchPageMeta();
        setEditingPage(null);
      } else {
        toast('error', 'Failed to update page meta');
      }
    } catch (error) {
      console.error('Failed to update page meta:', error);
      toast('error', 'Failed to update page meta');
    } finally {
      setSaving(false);
    }
  };

  const getPageIcon = (slug: string) => {
    const icons: { [key: string]: string } = {
      'home': '🏠',
      'about': 'ℹ️',
      'training': '✈️',
      'fleet': '🛩️',
      'maintenance': '🔧',
      'contact': '📞',
      'experiences': '🎯',
      'book': '📅',
      'faq': '❓'
    };
    return icons[slug] || '📄';
  };

  const formatSlug = (slug: string) => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const generatePreviewURL = (slug: string) => {
    const baseURL = 'https://darcy-aviation-production.up.railway.app';
    return slug === 'home' ? baseURL : `${baseURL}/${slug}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading SEO settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">SEO Settings</h1>
        <p className="text-slate-300 text-sm sm:text-base">Manage page titles, descriptions, and Open Graph meta data</p>
      </div>

      {/* SEO Tips */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-300 mb-3">SEO Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-200">
          <div>
            <h3 className="font-medium mb-2">Page Titles:</h3>
            <ul className="space-y-1 text-blue-300">
              <li>• Keep under 60 characters</li>
              <li>• Include target keywords</li>
              <li>• Make them unique for each page</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Meta Descriptions:</h3>
            <ul className="space-y-1 text-blue-300">
              <li>• Keep under 155 characters</li>
              <li>• Write compelling copy</li>
              <li>• Include a call to action</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pages List */}
      <div className="space-y-4">
        {pages.map((page) => (
          <div key={page.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getPageIcon(page.page_slug)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{formatSlug(page.page_slug)}</h3>
                  <p className="text-slate-400 text-sm">/{page.page_slug === 'home' ? '' : page.page_slug}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={generatePreviewURL(page.page_slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Preview
                </a>
                {editingPage?.id === page.id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(page.page_slug, editingPage)}
                      disabled={saving}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingPage(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingPage(page)}
                    className="bg-gold hover:bg-yellow-500 text-navy-900 px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {editingPage?.id === page.id ? (
              /* Edit Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Page Title <span className="text-slate-400">({editingPage.title?.length || 0}/60)</span>
                    </label>
                    <input
                      type="text"
                      value={editingPage.title || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                      placeholder="Enter page title..."
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      OG Title <span className="text-slate-400">({editingPage.og_title?.length || 0}/60)</span>
                    </label>
                    <input
                      type="text"
                      value={editingPage.og_title || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, og_title: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                      placeholder="Social media title (optional)"
                      maxLength={60}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Meta Description <span className="text-slate-400">({editingPage.description?.length || 0}/155)</span>
                  </label>
                  <textarea
                    value={editingPage.description || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    placeholder="Enter meta description..."
                    maxLength={155}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    OG Description <span className="text-slate-400">({editingPage.og_description?.length || 0}/155)</span>
                  </label>
                  <textarea
                    value={editingPage.og_description || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, og_description: e.target.value })}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    placeholder="Social media description (optional)"
                    maxLength={155}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    OG Image URL
                  </label>
                  <input
                    type="url"
                    value={editingPage.og_image || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, og_image: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-slate-400 text-xs mt-1">
                    Recommended: 1200x630 pixels. Use /uploads/filename.jpg for uploaded images.
                  </p>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Page Title</h4>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-white">{page.title || 'Not set'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">OG Title</h4>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-white">{page.og_title || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Meta Description</h4>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-white">{page.description || 'Not set'}</p>
                  </div>
                </div>

                {page.og_description && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">OG Description</h4>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-white">{page.og_description}</p>
                    </div>
                  </div>
                )}

                {page.og_image && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">OG Image</h4>
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={page.og_image}
                          alt="OG Preview"
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <p className="text-white text-sm break-all">{page.og_image}</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-slate-400 text-xs">
                  Last updated: {new Date(page.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-300 mb-2">No pages found</p>
          <p className="text-slate-400 text-sm">Page meta data will appear here once loaded</p>
        </div>
      )}
    </div>
  );
};

export default SEOSettings;