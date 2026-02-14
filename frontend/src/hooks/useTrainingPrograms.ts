import { useState, useEffect } from 'react';

interface TrainingProgram {
  id: number;
  slug: string;
  program_name: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_icon_svg?: string;
  overview: string[];
  requirements: string[];
  curriculum: { title: string; items: string[] }[];
  timeline_duration?: string;
  timeline_frequency?: string;
  timeline_details?: string;
  cost_note?: string;
  hide_cost_quote: boolean;
  fleet_used: { name: string; description: string }[];
  faqs: { q: string; a: string }[];
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTrainingPrograms() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/public/training-programs');
        if (response.ok) {
          const data = await response.json();
          setPrograms(data);
        } else {
          setError('Failed to fetch training programs');
        }
      } catch (error) {
        setError('Error fetching training programs');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return { programs, loading, error };
}

export function useTrainingProgram(slug: string) {
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/public/training-programs/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setProgram(data);
        } else if (response.status === 404) {
          setError('Training program not found');
        } else {
          setError('Failed to fetch training program');
        }
      } catch (error) {
        setError('Error fetching training program');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [slug]);

  return { program, loading, error };
}