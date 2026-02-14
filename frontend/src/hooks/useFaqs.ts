import { useState, useEffect } from 'react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface FAQSection {
  category: string;
  label: string;
  questions: { q: string; a: string }[];
}

const categoryLabels: Record<string, string> = {
  training: 'Flight Training',
  pricing: 'Costs & Scheduling',
  booking: 'Costs & Scheduling',
  aircraft: 'Aircraft Maintenance',
  general: 'General',
};

/**
 * Fetch FAQs from the database and group by category.
 * Falls back to empty array on error.
 */
export function useFaqs() {
  const [sections, setSections] = useState<FAQSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/faqs')
      .then((res) => res.json())
      .then((faqs: FAQ[]) => {
        // Group by category
        const grouped: Record<string, { q: string; a: string }[]> = {};
        for (const faq of faqs) {
          const cat = faq.category || 'general';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push({ q: faq.question, a: faq.answer });
        }

        // Merge pricing + booking into one section
        if (grouped['pricing'] || grouped['booking']) {
          const combined = [...(grouped['pricing'] || []), ...(grouped['booking'] || [])];
          delete grouped['pricing'];
          delete grouped['booking'];
          grouped['costs'] = combined;
        }

        // Define display order
        const order = ['training', 'costs', 'aircraft', 'general'];
        const displayLabels: Record<string, string> = {
          training: 'Flight Training',
          costs: 'Costs & Scheduling',
          aircraft: 'Aircraft Maintenance',
          general: 'General',
        };

        const result: FAQSection[] = [];
        for (const key of order) {
          if (grouped[key] && grouped[key].length > 0) {
            result.push({
              category: key,
              label: displayLabels[key] || key,
              questions: grouped[key],
            });
          }
        }

        // Add any remaining categories not in the predefined order
        for (const key of Object.keys(grouped)) {
          if (!order.includes(key) && grouped[key].length > 0) {
            result.push({
              category: key,
              label: categoryLabels[key] || key.charAt(0).toUpperCase() + key.slice(1),
              questions: grouped[key],
            });
          }
        }

        setSections(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { sections, loading };
}

export default useFaqs;
