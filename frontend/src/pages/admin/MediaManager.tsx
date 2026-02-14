import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

interface MediaFile {
  id: number | string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_path: string;
  category: string;
  uploaded_at: string;
  is_site_asset?: boolean;
}

const MediaManager: React.FC = () => {
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>([]);
  const [siteAssets, setSiteAssets] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'uploaded' | 'assets'>('uploaded');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAdmin();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      // Fetch uploaded media
      const uploadedResponse = await fetch('/api/admin/media', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (uploadedResponse.ok) {
        const uploadedData = await uploadedResponse.json();
        setUploadedMedia(uploadedData);
      }

      // Fetch site assets
      const assetsResponse = await fetch('/api/admin/media/site-assets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json();
        setSiteAssets(assetsData);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'general');

        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(`Failed to upload ${file.name}: ${errorData.error}`);
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    await fetchMedia(); // Refresh the list
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number | string, filename: string, isSiteAsset?: boolean) => {
    if (isSiteAsset) {
      alert('Site assets cannot be deleted from here. They are part of the website\'s core files.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchMedia(); // Refresh the list
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    return '📄';
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType.startsWith('video/');

  const currentMedia = activeTab === 'uploaded' ? uploadedMedia : siteAssets;
  const categories = [...new Set(currentMedia.map(file => file.category))];
  const filteredMedia = filter === 'all' ? currentMedia : currentMedia.filter(file => file.category === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading media...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Media Manager</h1>
        <p className="text-slate-300">Upload and manage photos, videos, and other media files</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex gap-1 mb-6">
          <button
            onClick={() => { setActiveTab('uploaded'); setFilter('all'); }}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'uploaded'
                ? 'bg-gold text-navy-900'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Uploaded Files ({uploadedMedia.length})
          </button>
          <button
            onClick={() => { setActiveTab('assets'); setFilter('all'); }}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'assets'
                ? 'bg-aviation-blue text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Site Assets ({siteAssets.length})
          </button>
        </div>

        {activeTab === 'uploaded' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Upload New Files</h2>
            
            <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
              {uploading ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin mx-auto" />
                  <p className="text-slate-300">Uploading files...</p>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-4">📤</div>
                  <p className="text-white mb-2">Drag & drop files here, or click to select</p>
                  <p className="text-slate-400 text-sm mb-4">
                    Supports: JPG, PNG, GIF, WebP, MP4, WebM, OGG (Max 50MB each)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block bg-gold hover:bg-yellow-500 text-navy-900 px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
                  >
                    Choose Files
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🗂️</div>
            <h2 className="text-xl font-semibold text-white mb-2">Site Assets</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              These are the existing media files already on your website - hero videos, service photos, and logos. 
              They cannot be deleted from here as they are core website files.
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gold text-navy-900'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              All ({currentMedia.length})
            </button>
            {categories.map(category => {
              const count = currentMedia.filter(file => file.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === category
                      ? 'bg-gold text-navy-900'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white/20 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white/20 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        {filteredMedia.length > 0 ? (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-4'
          }`}>
            {filteredMedia.map((file) => (
              <div
                key={file.id}
                className={`bg-white/10 border border-white/20 rounded-lg overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center' : ''
                }`}
              >
                {/* Thumbnail/Preview */}
                <div className={`${viewMode === 'list' ? 'w-16 h-16 flex-shrink-0' : 'aspect-video'} bg-black/20 flex items-center justify-center`}>
                  {isImage(file.mime_type) ? (
                    <img
                      src={file.file_path}
                      alt={file.original_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : isVideo(file.mime_type) ? (
                    <video
                      src={file.file_path}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
                  )}
                </div>

                {/* File Info */}
                <div className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : 'space-y-2'}`}>
                    <div className={viewMode === 'list' ? 'flex-1 min-w-0' : ''}>
                      <h4 className="text-white font-medium text-sm truncate">{file.original_name}</h4>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-shrink-0 ml-4' : 'mt-2'}`}>
                      <button
                        onClick={() => navigator.clipboard.writeText(file.file_path)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-2 py-1 rounded text-xs font-medium transition-colors"
                        title="Copy URL"
                      >
                        Copy
                      </button>
                      {file.is_site_asset ? (
                        <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs font-medium cursor-not-allowed" title="Cannot delete site assets">
                          Protected
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDelete(file.id, file.original_name, file.is_site_asset)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2 py-1 rounded text-xs font-medium transition-colors"
                          title="Delete"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-slate-300 mb-2">No media files found</p>
            <p className="text-slate-400 text-sm">Upload some files to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManager;