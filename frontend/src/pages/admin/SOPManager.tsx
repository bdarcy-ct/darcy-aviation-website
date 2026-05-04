import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../components/admin/Toast';

interface SopSection {
  id: number;
  anchor: string;
  section_number: string;
  category: string;
  title: string;
  content_html: string;
  sort_order: number;
  is_active: number;
  updated_at: string;
}

const newSectionTemplate = (): Partial<SopSection> => ({
  anchor: 'new-section',
  section_number: '',
  category: 'New Section',
  title: 'New SOP Section',
  content_html: '<p>Paste or write the SOP content here.</p>',
  sort_order: 99,
  is_active: 1,
});

export default function SOPManager() {
  const { token, user } = useAdmin();
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<SopSection[]>([]);
  const [selectedId, setSelectedId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<Partial<SopSection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [showHtml, setShowHtml] = useState(false);

  const selected = useMemo(() => sections.find(s => s.id === selectedId), [sections, selectedId]);

  useEffect(() => { loadSections(); }, []);

  useEffect(() => {
    if (selected) {
      setForm(selected);
      setShowHtml(false);
      setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = selected.content_html; }, 0);
    } else if (selectedId === 'new') {
      const next = newSectionTemplate();
      setForm(next);
      setShowHtml(false);
      setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = next.content_html || ''; }, 0);
    }
  }, [selected, selectedId]);

  useEffect(() => {
    if (!showHtml && editorRef.current) {
      editorRef.current.innerHTML = form.content_html || '';
    }
  }, [showHtml]);

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sop', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSections(data);
      if (!selectedId && data.length) setSelectedId(data[0].id);
    } catch (error) {
      console.error('Failed to load SOP sections:', error);
      toast('error', 'Failed to load SOP sections');
    } finally {
      setLoading(false);
    }
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorToForm();
  };

  const syncEditorToForm = () => {
    if (editorRef.current) setForm(prev => ({ ...prev, content_html: editorRef.current!.innerHTML }));
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const html = event.clipboardData.getData('text/html');
    const text = event.clipboardData.getData('text/plain');
    const cleaned = (html || text.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>'))
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/\sclass="Mso[^"]*"/gi, '')
      .replace(/\sstyle="[^"]*mso-[^"]*"/gi, '')
      .replace(/<!--.*?-->/gs, '');
    document.execCommand('insertHTML', false, cleaned);
    syncEditorToForm();
  };

  const save = async () => {
    syncEditorToForm();
    const payload = {
      ...form,
      content_html: editorRef.current?.innerHTML || form.content_html || '',
      changed_by: user?.username || 'admin',
    };

    if (!payload.anchor || !payload.title) {
      toast('error', 'Anchor and title are required');
      return;
    }

    setSaving(true);
    try {
      const isNew = selectedId === 'new';
      const res = await fetch(isNew ? '/api/admin/sop' : `/api/admin/sop/${selectedId}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast('success', isNew ? 'SOP section created' : 'SOP section saved');
      await loadSections();
      if (isNew && data.id) setSelectedId(Number(data.id));
    } catch (error: any) {
      console.error('Failed to save SOP section:', error);
      toast('error', error?.message || 'Failed to save SOP section');
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async () => {
    if (selectedId === 'new' || !selectedId) return;
    if (!confirm(`Delete "${form.title}" from the SOP?`)) return;
    try {
      const res = await fetch(`/api/admin/sop/${selectedId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      toast('success', 'SOP section deleted');
      setSelectedId(null);
      await loadSections();
    } catch {
      toast('error', 'Failed to delete SOP section');
    }
  };

  const filtered = sections.filter(s => {
    const q = query.toLowerCase();
    return !q || [s.title, s.category, s.section_number, s.anchor].join(' ').toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="text-center py-20 text-slate-300">Loading SOP editor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">SOP Manual</h1>
          <p className="text-slate-300 text-sm mt-1">Edit the live SOP page by chapter. Paste from Word/Google Docs, then publish.</p>
        </div>
        <div className="flex gap-2">
          <a href="/sop" target="_blank" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-white/15">View SOP</a>
          <button onClick={() => setSelectedId('new')} className="bg-gold hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg text-sm font-bold">+ Add Section</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <aside className="bg-white/10 border border-white/15 rounded-2xl p-4 h-fit lg:sticky lg:top-24">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search SOP sections..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50 mb-4"
          />
          <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
            {filtered.map(section => (
              <button
                key={section.id}
                onClick={() => setSelectedId(section.id)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${selectedId === section.id ? 'bg-gold/20 border-gold/40 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gold">
                  <span>{section.section_number || '—'}</span>
                  <span>{section.category}</span>
                  {!section.is_active && <span className="text-red-300">Hidden</span>}
                </div>
                <div className="font-semibold mt-1">{section.title}</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="bg-white/10 border border-white/15 rounded-2xl overflow-hidden">
          {!selectedId ? (
            <div className="p-10 text-slate-300">Select an SOP section to edit.</div>
          ) : (
            <>
              <div className="p-5 border-b border-white/10 bg-white/5 grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Title</span>
                  <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full bg-slate-900/70 border border-white/15 rounded-lg px-3 py-2 text-white" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Anchor / URL ID</span>
                  <input value={form.anchor || ''} onChange={e => setForm({ ...form, anchor: e.target.value })} className="mt-1 w-full bg-slate-900/70 border border-white/15 rounded-lg px-3 py-2 text-white" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Section Number</span>
                  <input value={form.section_number || ''} onChange={e => setForm({ ...form, section_number: e.target.value })} className="mt-1 w-full bg-slate-900/70 border border-white/15 rounded-lg px-3 py-2 text-white" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Category</span>
                  <input value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full bg-slate-900/70 border border-white/15 rounded-lg px-3 py-2 text-white" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Sort Order</span>
                  <input type="number" value={form.sort_order ?? 0} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className="mt-1 w-full bg-slate-900/70 border border-white/15 rounded-lg px-3 py-2 text-white" />
                </label>
                <label className="flex items-end gap-2 text-slate-300 pb-2">
                  <input type="checkbox" checked={(form.is_active ?? 1) === 1} onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} />
                  Published on live SOP page
                </label>
              </div>

              <div className="p-4 border-b border-white/10 bg-slate-950/30 flex flex-wrap items-center gap-2">
                {[
                  ['Bold', 'bold'], ['Italic', 'italic'], ['Underline', 'underline'],
                  ['H2', 'formatBlock', 'h2'], ['H3', 'formatBlock', 'h3'], ['Paragraph', 'formatBlock', 'p'],
                  ['Bullets', 'insertUnorderedList'], ['Numbered', 'insertOrderedList'], ['Quote', 'formatBlock', 'blockquote'],
                ].map(([label, cmd, value]) => (
                  <button key={`${label}-${cmd}`} onClick={() => exec(cmd!, value)} className="bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10">{label}</button>
                ))}
                <button onClick={() => { const url = prompt('Link URL'); if (url) exec('createLink', url); }} className="bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10">Link</button>
                <button onClick={() => setShowHtml(!showHtml)} className="ml-auto bg-aviation-blue/20 hover:bg-aviation-blue/30 text-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-400/20">{showHtml ? 'Visual Editor' : 'HTML'}</button>
              </div>

              <div className="p-5">
                {showHtml ? (
                  <textarea
                    value={form.content_html || ''}
                    onChange={e => setForm({ ...form, content_html: e.target.value })}
                    rows={24}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-4 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                ) : (
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncEditorToForm}
                    onPaste={handlePaste}
                    className="sop-admin-editor min-h-[520px] bg-white text-slate-900 rounded-xl p-6 focus:outline-none focus:ring-2 focus:ring-gold/50 overflow-auto"
                  />
                )}
              </div>

              <div className="p-5 border-t border-white/10 flex items-center justify-between gap-3 bg-white/5">
                <button onClick={deleteSection} disabled={selectedId === 'new'} className="bg-red-500/15 hover:bg-red-500/25 disabled:opacity-40 text-red-300 px-4 py-2 rounded-lg text-sm font-semibold border border-red-500/20">Delete</button>
                <button onClick={save} disabled={saving} className="bg-gold hover:bg-yellow-500 disabled:opacity-60 text-navy-900 px-6 py-2 rounded-lg text-sm font-black">
                  {saving ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <style>{`
        .sop-admin-editor p{margin:0 0 1rem;line-height:1.65}.sop-admin-editor h2{font-size:1.8rem;font-family:Georgia,serif;margin:1.6rem 0 .8rem;color:#16213a}.sop-admin-editor h3{font-size:1.35rem;font-weight:800;margin:1.4rem 0 .7rem;color:#16213a}.sop-admin-editor h4{font-size:.95rem;text-transform:uppercase;letter-spacing:.08em;color:#9a5b24;font-weight:900;margin:1rem 0 .5rem}.sop-admin-editor ul,.sop-admin-editor ol{margin:0 0 1rem 1.5rem}.sop-admin-editor li{margin:.3rem 0}.sop-admin-editor table{width:100%;border-collapse:collapse;margin:1rem 0}.sop-admin-editor th,.sop-admin-editor td{border:1px solid #cbd5e1;padding:.5rem}.sop-admin-editor blockquote{border-left:4px solid #d97735;background:#fff7ed;padding:1rem;margin:1rem 0;color:#7c2d12}
      `}</style>
    </div>
  );
}
