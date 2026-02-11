import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface WeatherData {
  condition: string;
  temp_c: number | null;
  wind_speed_kt: number;
  wind_dir: number;
  wind_gust_kt: number | null;
  visibility_miles: number;
  ceiling_ft: number | null;
  flight_category: string;
  raw_metar: string;
  is_night: boolean;
  updated_at: string;
}

interface WeatherContextValue {
  weather: WeatherData | null;
  loading: boolean;
}

const WeatherContext = createContext<WeatherContextValue>({
  weather: null,
  loading: true,
});

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      }
    } catch {
      // Silently fail — background will use default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, loading }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  return useContext(WeatherContext);
}
