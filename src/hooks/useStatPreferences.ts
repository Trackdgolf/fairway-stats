import { useState, useEffect } from "react";

export interface StatPreferences {
  fir: boolean;
  gir: boolean;
  scramble: boolean;
  putts: boolean;
  teeClub: boolean;
  approachClub: boolean;
}

const DEFAULT_PREFERENCES: StatPreferences = {
  fir: true,
  gir: true,
  scramble: true,
  putts: true,
  teeClub: true,
  approachClub: true,
};

const STORAGE_KEY = "golftrack-stat-preferences";

export const useStatPreferences = () => {
  const [preferences, setPreferences] = useState<StatPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch {
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
  }, []);

  const updatePreference = (key: keyof StatPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
  };

  return { preferences, updatePreference };
};
