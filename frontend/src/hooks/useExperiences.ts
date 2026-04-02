import { useState, useEffect } from 'react';

export interface Experience {
  id: number;
  slug: string;
  title: string;
  price: string;
  description: string;
  icon_svg?: string;
  highlights: string[];
  booking_url?: string;
  featured: number;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export function useExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await fetch('/api/public/experiences');
        if (response.ok) {
          const data = await response.json();
          setExperiences(data);
        } else {
          setError('Failed to fetch experiences');
        }
      } catch (error) {
        setError('Error fetching experiences');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  return { experiences, loading, error };
}
