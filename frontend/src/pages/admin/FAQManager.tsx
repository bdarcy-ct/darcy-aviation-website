import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NewFAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQManager: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState<NewFAQ>({ question: '', answer: '', category: 'general' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { token } = useAdmin();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/admin/faqs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newFaq.question || !newFaq.answer) {
      alert('Please fill in both question and answer');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFaq)
      });

      if (response.ok) {
        setNewFaq({ question: '', answer: '', category: 'general' });
        setShowAddForm(false);
        await fetchFAQs();
      } else {
        alert('Failed to create FAQ');
      }
    } catch (error) {
      console.error('Failed to create FAQ:', error);
      alert('Failed to create FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingFaq) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingFaq)
      });

      if (response.ok) {
        setEditingFaq(null);
        await fetchFAQs();
      } else {
        alert('Failed to update FAQ');
      }
    } catch (error) {
      console.error('Failed to update FAQ:', error);
      alert('Failed to update FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, question: string) => {
    if (!confirm(`Are you sure you want to delete: "${question}"?`)) return;

    try {
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchFAQs();
      } else {
        alert('Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      alert('Failed to delete FAQ');
    }
  };

  const toggleActive = async (faq: FAQ) => {
    const updatedFaq = { ...faq, is_active: !faq.is_active };
    
    try {
      const response = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFaq)
      });

      if (response.ok) {
        await fetchFAQs();
      } else {
        alert('Failed to update FAQ status');
      }
    } catch (error) {
      console.error('Failed to update FAQ status:', error);
      alert('Failed to update FAQ status');
    }
  };

  const categories = [...new Set(faqs.map(faq => faq.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">FAQ Manager</h1>
          <p className="text-slate-300">Manage frequently asked questions</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gold hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Add New FAQ
        </button>
      </div>

      {/* Add New FAQ Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Add New FAQ</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={newFaq.category}
                onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                <option value="general">General</option>
                <option value="training">Training</option>
                <option value="booking">Booking</option>
                <option value="pricing">Pricing</option>
                <option value="aircraft">Aircraft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Question</label>
              <input
                type="text"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="Enter the question..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Answer</label>
              <textarea
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                rows={4}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="Enter the answer..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create FAQ'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewFaq({ question: '', answer: '', category: 'general' });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQs List */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryFaqs = faqs.filter(faq => faq.category === category);
          
          return (
            <div key={category} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 capitalize">
                {category} ({categoryFaqs.length})
              </h2>

              <div className="space-y-4">
                {categoryFaqs.map((faq) => (
                  <div key={faq.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
                    {editingFaq?.id === faq.id ? (
                      /* Edit Form */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Question</label>
                          <input
                            type="text"
                            value={editingFaq.question}
                            onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Answer</label>
                          <textarea
                            value={editingFaq.answer}
                            onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                            rows={4}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingFaq.is_active}
                              onChange={(e) => setEditingFaq({ ...editingFaq, is_active: e.target.checked })}
                              className="mr-2"
                            />
                            <span className="text-slate-300">Active</span>
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdate}
                            disabled={saving}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingFaq(null)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-2">{faq.question}</h3>
                            <p className="text-slate-300 text-sm whitespace-pre-wrap">{faq.answer}</p>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              faq.is_active
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {faq.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-slate-400 text-xs">
                            Created: {new Date(faq.created_at).toLocaleDateString()}
                            {faq.updated_at !== faq.created_at && (
                              <span> • Updated: {new Date(faq.updated_at).toLocaleDateString()}</span>
                            )}
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleActive(faq)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                faq.is_active
                                  ? 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-300'
                                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                              }`}
                            >
                              {faq.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => setEditingFaq(faq)}
                              className="bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1 rounded text-xs font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(faq.id, faq.question)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded text-xs font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {categoryFaqs.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No FAQs in this category</p>
                )}
              </div>
            </div>
          );
        })}

        {faqs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">❓</div>
            <p className="text-slate-300 mb-2">No FAQs found</p>
            <p className="text-slate-400 text-sm">Create your first FAQ to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQManager;