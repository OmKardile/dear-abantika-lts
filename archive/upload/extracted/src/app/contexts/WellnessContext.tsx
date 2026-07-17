import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CycleEntry {
  id: string;
  date: string;
  isPeriod: boolean;
  flow?: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  weight?: number;
  bbt?: number;
  medication?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  mood: string;
  reflection: string;
  sticker?: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  category: 'save-later' | 'urgent' | 'dream' | 'for-him';
  notes?: string;
  link?: string;
  image?: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  category: 'medication' | 'water' | 'skincare' | 'general';
  days: boolean[]; // 7 days, Sunday = 0
  enabled: boolean;
}

interface WellnessContextType {
  // Hydration
  waterIntake: number;
  dailyWaterGoal: number;
  addWater: (amount: number) => void;
  resetWater: () => void;
  
  // Mood
  todayMood: string;
  setTodayMood: (mood: string) => void;
  
  // Cycle
  cycleEntries: CycleEntry[];
  addCycleEntry: (entry: Omit<CycleEntry, 'id'>) => void;
  updateCycleEntry: (id: string, entry: Partial<CycleEntry>) => void;
  
  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  
  // Wishlist
  wishlistItems: WishlistItem[];
  addWishlistItem: (item: Omit<WishlistItem, 'id'>) => void;
  updateWishlistItem: (id: string, item: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;
  
  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  
  // Backup & Restore
  exportData: () => void;
  importData: (data: string) => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export function WellnessProvider({ children }: { children: React.ReactNode }) {
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyWaterGoal] = useState(2000);
  const [todayMood, setTodayMood] = useState('😊');
  const [cycleEntries, setCycleEntries] = useState<CycleEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('abantika-wellness-data');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setWaterIntake(data.waterIntake || 0);
          setTodayMood(data.todayMood || '😊');
          setCycleEntries(data.cycleEntries || []);
          setJournalEntries(data.journalEntries || []);
          setWishlistItems(data.wishlistItems || []);
          setReminders(data.reminders || []);
        } catch (error) {
          console.error('Error loading wellness data:', error);
        }
      }
    };
    loadData();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    const data = {
      waterIntake,
      todayMood,
      cycleEntries,
      journalEntries,
      wishlistItems,
      reminders,
    };
    localStorage.setItem('abantika-wellness-data', JSON.stringify(data));
  }, [waterIntake, todayMood, cycleEntries, journalEntries, wishlistItems, reminders]);

  const addWater = (amount: number) => {
    setWaterIntake((prev) => Math.min(prev + amount, dailyWaterGoal * 2));
  };

  const resetWater = () => {
    setWaterIntake(0);
  };

  const addCycleEntry = (entry: Omit<CycleEntry, 'id'>) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    setCycleEntries((prev) => [...prev, newEntry]);
  };

  const updateCycleEntry = (id: string, entry: Partial<CycleEntry>) => {
    setCycleEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...entry } : e))
    );
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    setJournalEntries((prev) => [newEntry, ...prev]);
  };

  const updateJournalEntry = (id: string, entry: Partial<JournalEntry>) => {
    setJournalEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...entry } : e))
    );
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const addWishlistItem = (item: Omit<WishlistItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setWishlistItems((prev) => [...prev, newItem]);
  };

  const updateWishlistItem = (id: string, item: Partial<WishlistItem>) => {
    setWishlistItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...item } : i))
    );
  };

  const deleteWishlistItem = (id: string) => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder = { ...reminder, id: Date.now().toString() };
    setReminders((prev) => [...prev, newReminder]);
  };

  const updateReminder = (id: string, reminder: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...reminder } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const exportData = () => {
    const data = {
      waterIntake,
      todayMood,
      cycleEntries,
      journalEntries,
      wishlistItems,
      reminders,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abantika-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (dataString: string) => {
    try {
      const data = JSON.parse(dataString);
      setWaterIntake(data.waterIntake || 0);
      setTodayMood(data.todayMood || '😊');
      setCycleEntries(data.cycleEntries || []);
      setJournalEntries(data.journalEntries || []);
      setWishlistItems(data.wishlistItems || []);
      setReminders(data.reminders || []);
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  };

  return (
    <WellnessContext.Provider
      value={{
        waterIntake,
        dailyWaterGoal,
        addWater,
        resetWater,
        todayMood,
        setTodayMood,
        cycleEntries,
        addCycleEntry,
        updateCycleEntry,
        journalEntries,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        wishlistItems,
        addWishlistItem,
        updateWishlistItem,
        deleteWishlistItem,
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        exportData,
        importData,
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
}

export function useWellness() {
  const context = useContext(WellnessContext);
  if (context === undefined) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
}
