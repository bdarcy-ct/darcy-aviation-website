import { useState, useEffect } from 'react';

type ContentMap = Record<string, string>;
type AllContent = Record<string, ContentMap>;

// Cache fetched content to avoid re-fetching on every page nav
let contentCache: AllContent | null = null;
let cachePromise: Promise<AllContent> | null = null;

async function fetchAllContent(): Promise<AllContent> {
  const response = await fetch('/api/public/content');
  if (!response.ok) throw new Error('Failed to fetch content');
  return response.json();
}

function getContent(): Promise<AllContent> {
  if (contentCache) return Promise.resolve(contentCache);
  if (!cachePromise) {
    cachePromise = fetchAllContent().then((data) => {
      contentCache = data;
      return data;
    }).catch((err) => {
      cachePromise = null;
      throw err;
    });
  }
  return cachePromise;
}

/**
 * Hook to get CMS content for a specific section.
 * Returns { data, loading, get } where get(key, fallback) retrieves a value.
 */
export function useCmsSection(section: string) {
  const [data, setData] = useState<ContentMap>(contentCache?.[section] || {});
  const [loading, setLoading] = useState(!contentCache);

  useEffect(() => {
    if (contentCache) {
      setData(contentCache[section] || {});
      setLoading(false);
      return;
    }

    getContent()
      .then((all) => {
        setData(all[section] || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [section]);

  const get = (key: string, fallback: string = ''): string => {
    return data[key] || fallback;
  };

  return { data, loading, get };
}

/**
 * Hook to get all CMS content sections at once.
 */
export function useCmsContent() {
  const [data, setData] = useState<AllContent>(contentCache || {});
  const [loading, setLoading] = useState(!contentCache);

  useEffect(() => {
    if (contentCache) {
      setData(contentCache);
      setLoading(false);
      return;
    }

    getContent()
      .then((all) => {
        setData(all);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const get = (section: string, key: string, fallback: string = ''): string => {
    return data[section]?.[key] || fallback;
  };

  return { data, loading, get };
}

// Invalidate cache (call after admin edits)
export function invalidateCmsCache() {
  contentCache = null;
  cachePromise = null;
}

export default useCmsContent;
