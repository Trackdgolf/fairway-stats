import { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface Club {
  id: string;
  name: string;
}

export interface StatPreferences {
  fir: boolean;
  gir: boolean;
  scramble: boolean;
  putts: boolean;
  teeClub: boolean;
  approachClub: boolean;
}

export interface ClubYardage {
  low?: number;
  high?: number;
  avg?: number;
}

export type StockYardages = Record<string, ClubYardage>;

// Migration helper: convert old format (plain number) to new format
const migrateYardages = (raw: unknown): StockYardages => {
  if (!raw || typeof raw !== 'object') return {};
  const result: StockYardages = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'number') {
      // Old format: just a single number → treat as avg
      result[key] = { avg: value };
    } else if (value && typeof value === 'object') {
      result[key] = value as ClubYardage;
    }
  }
  return result;
};

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

const DEFAULT_STAT_PREFERENCES: StatPreferences = {
  fir: true,
  gir: true,
  scramble: true,
  putts: true,
  teeClub: true,
  approachClub: true,
};

const LOCAL_BAG_KEY = "golftrack-my-bag";
const LOCAL_STAT_KEY = "golftrack-stat-preferences";
const LOCAL_YARDAGE_KEY = "golftrack-stock-yardages";

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>(DEFAULT_CLUBS);
  const [statPreferences, setStatPreferences] = useState<StatPreferences>(DEFAULT_STAT_PREFERENCES);
  const [stockYardages, setStockYardages] = useState<StockYardages>({});
  const [loading, setLoading] = useState(true);
  const [preferencesId, setPreferencesId] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  // Load preferences from database or localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        // Not logged in - use localStorage
        const storedBag = localStorage.getItem(LOCAL_BAG_KEY);
        const storedStats = localStorage.getItem(LOCAL_STAT_KEY);
        
        if (storedBag) {
          try {
            setClubs(JSON.parse(storedBag));
          } catch {
            setClubs(DEFAULT_CLUBS);
          }
        }
        
        if (storedStats) {
          try {
            setStatPreferences({ ...DEFAULT_STAT_PREFERENCES, ...JSON.parse(storedStats) });
          } catch {
            setStatPreferences(DEFAULT_STAT_PREFERENCES);
          }
        }

        const storedYardages = localStorage.getItem(LOCAL_YARDAGE_KEY);
        if (storedYardages) {
          try {
            setStockYardages(migrateYardages(JSON.parse(storedYardages)));
          } catch {
            setStockYardages({});
          }
        }
        
        setLoading(false);
        return;
      }

      // Logged in - check database first
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading preferences:", error);
        setLoading(false);
        return;
      }

      if (data) {
        // Found in database
        setPreferencesId(data.id);
        setClubs(data.my_bag as unknown as Club[]);
        setStatPreferences(data.stat_preferences as unknown as StatPreferences);
        setStockYardages(migrateYardages(data.stock_yardages) || {});
        
        // Clear localStorage since we're now using database
        localStorage.removeItem(LOCAL_BAG_KEY);
        localStorage.removeItem(LOCAL_STAT_KEY);
        localStorage.removeItem(LOCAL_YARDAGE_KEY);
      } else {
        // Not in database - migrate from localStorage or use defaults
        const storedBag = localStorage.getItem(LOCAL_BAG_KEY);
        const storedStats = localStorage.getItem(LOCAL_STAT_KEY);
        const storedYardages = localStorage.getItem(LOCAL_YARDAGE_KEY);
        
        const bagToUse = storedBag ? JSON.parse(storedBag) : DEFAULT_CLUBS;
        const statsToUse = storedStats 
          ? { ...DEFAULT_STAT_PREFERENCES, ...JSON.parse(storedStats) }
          : DEFAULT_STAT_PREFERENCES;
        const yardagesToUse = storedYardages ? migrateYardages(JSON.parse(storedYardages)) : {};

        // Create new record in database
        const { data: newPref, error: insertError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            my_bag: bagToUse,
            stat_preferences: statsToUse,
            stock_yardages: yardagesToUse,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating preferences:", insertError);
        } else if (newPref) {
          setPreferencesId(newPref.id);
          setClubs(bagToUse);
          setStatPreferences(statsToUse);
          setStockYardages(yardagesToUse);
          
          // Clear localStorage after successful migration
          localStorage.removeItem(LOCAL_BAG_KEY);
          localStorage.removeItem(LOCAL_STAT_KEY);
          localStorage.removeItem(LOCAL_YARDAGE_KEY);
        }
      }

      setLoading(false);
    };

    loadPreferences();
  }, [user]);

  // Save clubs to database
  const saveClubs = useCallback(async (newClubs: Club[]) => {
    setClubs(newClubs);

    if (!user) {
      localStorage.setItem(LOCAL_BAG_KEY, JSON.stringify(newClubs));
      return;
    }

    const { error } = await supabase
      .from("user_preferences")
      .update({ my_bag: JSON.parse(JSON.stringify(newClubs)), updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error saving clubs:", error);
    }
  }, [user]);

  // Save stat preferences to database
  const saveStatPreferences = useCallback(async (newPrefs: StatPreferences) => {
    setStatPreferences(newPrefs);

    if (!user) {
      localStorage.setItem(LOCAL_STAT_KEY, JSON.stringify(newPrefs));
      return;
    }

    const { error } = await supabase
      .from("user_preferences")
      .update({ stat_preferences: JSON.parse(JSON.stringify(newPrefs)), updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error saving stat preferences:", error);
    }
  }, [user]);

  // Club management functions
  const renameClub = useCallback((id: string, newName: string) => {
    const newClubs = clubs.map(club =>
      club.id === id ? { ...club, name: newName } : club
    );
    saveClubs(newClubs);
  }, [clubs, saveClubs]);

  const addClub = useCallback((name: string) => {
    const newId = Date.now().toString();
    const newClubs = [...clubs, { id: newId, name }];
    saveClubs(newClubs);
  }, [clubs, saveClubs]);

  const removeClub = useCallback((id: string) => {
    const newClubs = clubs.filter(club => club.id !== id);
    saveClubs(newClubs);
  }, [clubs, saveClubs]);

  const resetClubsToDefault = useCallback(() => {
    saveClubs(DEFAULT_CLUBS);
  }, [saveClubs]);

  // Stat preference functions
  const updateStatPreference = useCallback((key: keyof StatPreferences, value: boolean) => {
    const newPrefs = { ...statPreferences, [key]: value };
    saveStatPreferences(newPrefs);
  }, [statPreferences, saveStatPreferences]);

  // Save stock yardages
  const saveStockYardages = useCallback(async (newYardages: StockYardages) => {
    setStockYardages(newYardages);

    if (!user) {
      localStorage.setItem(LOCAL_YARDAGE_KEY, JSON.stringify(newYardages));
      return;
    }

    const { error } = await supabase
      .from("user_preferences")
      .update({ stock_yardages: JSON.parse(JSON.stringify(newYardages)), updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error saving stock yardages:", error);
    }
  }, [user]);

  const updateStockYardage = useCallback((clubId: string, field: keyof ClubYardage, value: number | null) => {
    const newYardages = { ...stockYardages };
    const current = newYardages[clubId] || {};
    if (value === null || value === 0) {
      const updated = { ...current };
      delete updated[field];
      if (Object.keys(updated).length === 0) {
        delete newYardages[clubId];
      } else {
        newYardages[clubId] = updated;
      }
    } else {
      newYardages[clubId] = { ...current, [field]: value };
    }
    saveStockYardages(newYardages);
  }, [stockYardages, saveStockYardages]);

  return {
    // Club data and functions
    clubs,
    renameClub,
    addClub,
    removeClub,
    resetClubsToDefault,
    
    // Stat preference data and functions
    statPreferences,
    updateStatPreference,
    
    // Stock yardage data and functions
    stockYardages,
    updateStockYardage,
    
    // Loading state
    loading,
  };
};
