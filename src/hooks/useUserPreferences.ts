import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>(DEFAULT_CLUBS);
  const [statPreferences, setStatPreferences] = useState<StatPreferences>(DEFAULT_STAT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [preferencesId, setPreferencesId] = useState<string | null>(null);

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
        
        // Clear localStorage since we're now using database
        localStorage.removeItem(LOCAL_BAG_KEY);
        localStorage.removeItem(LOCAL_STAT_KEY);
      } else {
        // Not in database - migrate from localStorage or use defaults
        const storedBag = localStorage.getItem(LOCAL_BAG_KEY);
        const storedStats = localStorage.getItem(LOCAL_STAT_KEY);
        
        const bagToUse = storedBag ? JSON.parse(storedBag) : DEFAULT_CLUBS;
        const statsToUse = storedStats 
          ? { ...DEFAULT_STAT_PREFERENCES, ...JSON.parse(storedStats) }
          : DEFAULT_STAT_PREFERENCES;

        // Create new record in database
        const { data: newPref, error: insertError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            my_bag: bagToUse,
            stat_preferences: statsToUse,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating preferences:", insertError);
        } else if (newPref) {
          setPreferencesId(newPref.id);
          setClubs(bagToUse);
          setStatPreferences(statsToUse);
          
          // Clear localStorage after successful migration
          localStorage.removeItem(LOCAL_BAG_KEY);
          localStorage.removeItem(LOCAL_STAT_KEY);
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
    
    // Loading state
    loading,
  };
};
