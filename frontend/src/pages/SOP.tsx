import { useEffect, useMemo, useState } from 'react';
import SEOHead from '../components/SEOHead';

interface SopSection {
  id: number;
  anchor: string;
  section_number: string;
  category: string;
  title: string;
  content_html: string;
  sort_order: number;
  updated_at: string;
}

interface SopResponse {
  settings: Record<string, string>;
  sections: SopSection[];
}

const defaults: Record<string, string> = {
  meta_title: 'Standard Operating Procedures',
  meta_description: 'Darcy Aviation standard operating procedures, safety policies, weather minimums, dispatch procedures, and student pilot requirements.',
  eyebrow: 'Operations Manual · Rev. 1.3',
  hero_title_html: 'Standard <em>Operating</em><br />Procedures.',
  hero_lede: 'The minimum standards every Darcy Aviation student, renter, and instructor builds upon — to fly safely, efficiently, and to the highest standard out of Danbury Municipal Airport.',
  effective_label: 'Effective',
  effective_value: 'January 1, 2026',
  approved_by_label: 'Approved by',
  approved_by_value: 'Brent Darcy, Chief Flight Instructor',
  home_field_label: 'Home Field',
  home_field_value: 'KDXR · Danbury, CT',
  sections_label: 'Sections',
  sections_suffix: 'CMS managed',
  quick_jump_title: 'Quick Jump',
  toc_title: 'In this manual',
  toc_search_placeholder: 'Search sections...',
  mobile_toc_label: 'Contents',
  loading_text: 'Loading SOP...',
  error_text: 'Unable to load SOP.',
};

export default function SOP() {
  const [data, setData] = useState<SopResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    fetch('/api/public/sop')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load SOP:', err))
      .finally(() => setLoading(false));
  }, []);

  const settings = { ...defaults, ...(data?.settings || {}) };
  const sections = data?.sections || [];
  const filteredToc = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(section =>
      [section.title, section.category, section.section_number, section.content_html]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, sections]);

  const quickLinks = sections.slice(2, 8);

  if (loading) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
          <p className="text-slate-300">{defaults.loading_text}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="pt-28 min-h-screen text-center text-white">{defaults.error_text}</div>;
  }

  return (
    <div className="sop-page bg-[#f7f2e8] text-slate-900 min-h-screen">
      <SEOHead
        title={settings.meta_title}
        description={settings.meta_description}
        path="/sop"
      />

      <style>{`
        .sop-page .sop-prose p{margin:0 0 1rem;line-height:1.78;color:#334155;font-size:1rem}
        .sop-page .sop-prose h3{margin:2.2rem 0 .8rem;font-size:1.45rem;line-height:1.2;color:#16213a;font-family:Georgia,serif}
        .sop-page .sop-prose h4{margin:1.5rem 0 .65rem;font-size:1.02rem;text-transform:uppercase;letter-spacing:.08em;color:#9a5b24;font-weight:800}
        .sop-page .sop-prose ul,.sop-page .sop-prose ol{margin:0 0 1.2rem 1.25rem;color:#334155;line-height:1.7}
        .sop-page .sop-prose li{padding-left:.25rem;margin:.35rem 0}
        .sop-page .sop-prose a{color:#0d5f9f;text-decoration:underline;text-underline-offset:3px;word-break:break-word}
        .sop-page .sop-prose blockquote{margin:1.5rem 0;padding:1.2rem 1.4rem;border-left:5px solid #d97735;background:#fff7ed;border-radius:0 16px 16px 0;color:#7c2d12;font-family:Georgia,serif;font-size:1.2rem}
        .sop-page .sop-prose table{width:100%;border-collapse:collapse;margin:1.5rem 0;background:white;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,.08)}
        .sop-page .sop-prose th{background:#16213a;color:#fff;text-align:left;padding:.85rem;font-size:.82rem;text-transform:uppercase;letter-spacing:.05em}
        .sop-page .sop-prose td{padding:.85rem;border-top:1px solid #e2e8f0;color:#334155;vertical-align:top}
        .sop-page .roster{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.5rem 0}
        .sop-page .role{background:white;border:1px solid rgba(15,23,42,.09);border-radius:18px;padding:1rem;box-shadow:0 14px 35px rgba(15,23,42,.07)}
        .sop-page .role.lead{background:#16213a;color:white}.sop-page .role.lead .role-title{color:#f9c74f}.sop-page .role-title{font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:#9a5b24;font-weight:800;margin-bottom:.5rem}.sop-page .role-people{font-weight:700;color:inherit}.sop-page .role ul{margin:.2rem 0 0 1rem!important}
      `}</style>

      <button
        onClick={() => setTocOpen(!tocOpen)}
        className="lg:hidden fixed top-20 left-4 z-40 bg-navy-900 text-white rounded-full px-4 py-2 shadow-xl border border-white/10 flex items-center gap-2"
      >
        ☰ {settings.mobile_toc_label}
      </button>

      <section className="pt-28 pb-16 bg-[radial-gradient(circle_at_top_left,_rgba(217,119,53,.22),_transparent_32%),linear-gradient(135deg,#101a31_0%,#182745_58%,#0b1220_100%)] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(90deg,#fff 1px,transparent 1px),linear-gradient(#fff 1px,transparent 1px)', backgroundSize: '42px 42px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_360px] gap-10 items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-gold text-xs uppercase tracking-[.22em] font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-gold" /> {settings.eyebrow}
            </div>
            <h1
              className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[.95] mb-6 [&_em]:text-gold [&_em]:font-normal"
              dangerouslySetInnerHTML={{ __html: settings.hero_title_html }}
            />
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl leading-relaxed">
              {settings.hero_lede}
            </p>
            <dl className="grid sm:grid-cols-4 gap-4 mt-8">
              {[
                [settings.effective_label, settings.effective_value],
                [settings.approved_by_label, settings.approved_by_value],
                [settings.home_field_label, settings.home_field_value],
                [settings.sections_label, `${sections.length} ${settings.sections_suffix}`],
              ].map(([k, v]) => (
                <div key={k} className="border-l border-gold/40 pl-4">
                  <dt className="text-[10px] uppercase tracking-[.18em] text-slate-400 font-bold">{k}</dt>
                  <dd className="text-sm text-white mt-1">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-gold font-serif text-2xl mb-4">{settings.quick_jump_title}</h2>
            <div className="space-y-2">
              {quickLinks.map((section) => (
                <a key={section.id} href={`#${section.anchor}`} className="group flex items-center gap-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 transition-colors">
                  <span className="text-gold text-xs font-bold">{section.section_number}</span>
                  <span className="text-sm text-slate-200 flex-1">{section.title}</span>
                  <span className="text-slate-500 group-hover:text-gold">→</span>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:grid lg:grid-cols-[300px_1fr] gap-10">
        <aside className={`${tocOpen ? 'fixed inset-x-4 top-32 z-40 max-h-[70vh] overflow-auto' : 'hidden'} lg:block lg:sticky lg:top-28 lg:self-start bg-white/90 backdrop-blur border border-slate-200 rounded-3xl p-5 shadow-xl`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[.2em] text-slate-500 font-black">{settings.toc_title}</p>
            <button className="lg:hidden text-slate-500" onClick={() => setTocOpen(false)}>✕</button>
          </div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={settings.toc_search_placeholder}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/50 mb-4"
          />
          <nav className="space-y-2">
            {filteredToc.map((section) => (
              <a key={section.id} href={`#${section.anchor}`} onClick={() => setTocOpen(false)} className="block rounded-2xl px-3 py-3 hover:bg-slate-100 transition-colors">
                <span className="block text-[10px] font-black text-gold uppercase tracking-[.15em]">{section.section_number} · {section.category}</span>
                <span className="block text-sm font-bold text-slate-800 mt-1">{section.title}</span>
              </a>
            ))}
          </nav>
        </aside>

        <main className="bg-white/70 border border-white rounded-[2rem] shadow-2xl shadow-slate-900/10 px-5 sm:px-8 lg:px-12 py-10">
          {sections.map((section) => (
            <article key={section.id} id={section.anchor} className="scroll-mt-28 border-t border-slate-200 first:border-t-0 py-10 first:pt-0">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[.18em] text-gold">
                  <span className="bg-navy-900 text-gold rounded-full px-3 py-1">{section.section_number}</span>
                  {section.category}
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl text-navy-900 mt-4 leading-tight">{section.title}</h2>
              </div>
              <div className="sop-prose" dangerouslySetInnerHTML={{ __html: section.content_html }} />
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}
