import { useState, useEffect } from "react";

export interface Club {
  id: string;
  name: string;
}

const DEFAULT_CLUBS: Club[] = [
  { id: "1", name: "Driver" },
  { id: "2", name: "3 Wood" },
  { id: "3", name: "5 Wood" },
  { id: "4", name: "4 Iron" },
  { id: "5", name: "5 Iron" },
  { id: "6", name: "6 Iron" },
  { id: "7", name: "7 Iron" },
  { id: "8", name: "8 Iron" },
  { id: "9", name: "9 Iron" },
  { id: "10", name: "PW" },
  { id: "11", name: "SW" },
  { id: "12", name: "GW" },
  { id: "13", name: "LW" },
  { id: "14", name: "Putter" },
];

const STORAGE_KEY = "golftrack-my-bag";

export const useMyBag = () => {
  const [clubs, setClubs] = useState<Club[]>(DEFAULT_CLUBS);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClubs(parsed);
        }
      } catch {
        setClubs(DEFAULT_CLUBS);
      }
    }
  }, []);

  const saveClubs = (newClubs: Club[]) => {
    setClubs(newClubs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newClubs));
  };

  const renameClub = (id: string, newName: string) => {
    const newClubs = clubs.map(club => 
      club.id === id ? { ...club, name: newName } : club
    );
    saveClubs(newClubs);
  };

  const addClub = (name: string) => {
    const newId = Date.now().toString();
    const newClubs = [...clubs, { id: newId, name }];
    saveClubs(newClubs);
  };

  const removeClub = (id: string) => {
    const newClubs = clubs.filter(club => club.id !== id);
    saveClubs(newClubs);
  };

  const resetToDefault = () => {
    saveClubs(DEFAULT_CLUBS);
  };

  return { clubs, renameClub, addClub, removeClub, resetToDefault };
};
