import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CycleEntry {
  id: string;
  date: string;
  isPeriod: boolean;
  flow?: "light" | "medium" | "heavy";
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
  sticker: string;
}

export interface WishlistItem {
  id: string;
  category: "save-for-later" | "urgent-need" | "dream-cart" | "for-him";
  title: string;
  description: string;
  notes: string;
  link?: string;
  imageUrl?: string;
}

export interface Reminder {
  id: string;
  title: string;
  category: "medication" | "water" | "skincare" | "general-care";
  time: string;
  days: string[];
  enabled: boolean;
}

interface AppData {
  hydration: {
    current: number;
    goal: number;
    history: { date: string; amount: number }[];
  };
  mood: {
    current: string;
    date: string;
  };
  cycleEntries: CycleEntry[];
  journalEntries: JournalEntry[];
  wishlistItems: WishlistItem[];
  reminders: Reminder[];
}

interface DataContextType {
  data: AppData;
  updateHydration: (amount: number) => void;
  updateMood: (mood: string) => void;
  addCycleEntry: (entry: Omit<CycleEntry, "id">) => void;
  updateCycleEntry: (id: string, entry: Partial<CycleEntry>) => void;
  deleteCycleEntry: (id: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  addWishlistItem: (item: Omit<WishlistItem, "id">) => void;
  updateWishlistItem: (id: string, item: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, "id">) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultData: AppData = {
  hydration: {
    current: 0,
    goal: 2000,
    history: [],
  },
  mood: {
    current: "😊",
    date: new Date().toISOString().split("T")[0],
  },
  cycleEntries: [],
  journalEntries: [],
  wishlistItems: [],
  reminders: [],
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem("abantika-data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultData;
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem("abantika-data", JSON.stringify(data));
  }, [data]);

  const updateHydration = (amount: number) => {
    const today = new Date().toISOString().split("T")[0];
    setData(prev => {
      const newCurrent = prev.hydration.current + amount;
      const historyIndex = prev.hydration.history.findIndex(h => h.date === today);
      const newHistory = [...prev.hydration.history];
      
      if (historyIndex >= 0) {
        newHistory[historyIndex] = { date: today, amount: newCurrent };
      } else {
        newHistory.push({ date: today, amount: newCurrent });
      }

      return {
        ...prev,
        hydration: {
          ...prev.hydration,
          current: newCurrent,
          history: newHistory.slice(-7),
        },
      };
    });
  };

  const updateMood = (mood: string) => {
    setData(prev => ({
      ...prev,
      mood: {
        current: mood,
        date: new Date().toISOString().split("T")[0],
      },
    }));
  };

  const addCycleEntry = (entry: Omit<CycleEntry, "id">) => {
    setData(prev => ({
      ...prev,
      cycleEntries: [...prev.cycleEntries, { ...entry, id: Date.now().toString() }],
    }));
  };

  const updateCycleEntry = (id: string, entry: Partial<CycleEntry>) => {
    setData(prev => ({
      ...prev,
      cycleEntries: prev.cycleEntries.map(e => e.id === id ? { ...e, ...entry } : e),
    }));
  };

  const deleteCycleEntry = (id: string) => {
    setData(prev => ({
      ...prev,
      cycleEntries: prev.cycleEntries.filter(e => e.id !== id),
    }));
  };

  const addJournalEntry = (entry: Omit<JournalEntry, "id">) => {
    setData(prev => ({
      ...prev,
      journalEntries: [...prev.journalEntries, { ...entry, id: Date.now().toString() }],
    }));
  };

  const updateJournalEntry = (id: string, entry: Partial<JournalEntry>) => {
    setData(prev => ({
      ...prev,
      journalEntries: prev.journalEntries.map(e => e.id === id ? { ...e, ...entry } : e),
    }));
  };

  const deleteJournalEntry = (id: string) => {
    setData(prev => ({
      ...prev,
      journalEntries: prev.journalEntries.filter(e => e.id !== id),
    }));
  };

  const addWishlistItem = (item: Omit<WishlistItem, "id">) => {
    setData(prev => ({
      ...prev,
      wishlistItems: [...prev.wishlistItems, { ...item, id: Date.now().toString() }],
    }));
  };

  const updateWishlistItem = (id: string, item: Partial<WishlistItem>) => {
    setData(prev => ({
      ...prev,
      wishlistItems: prev.wishlistItems.map(i => i.id === id ? { ...i, ...item } : i),
    }));
  };

  const deleteWishlistItem = (id: string) => {
    setData(prev => ({
      ...prev,
      wishlistItems: prev.wishlistItems.filter(i => i.id !== id),
    }));
  };

  const addReminder = (reminder: Omit<Reminder, "id">) => {
    setData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { ...reminder, id: Date.now().toString() }],
    }));
  };

  const updateReminder = (id: string, reminder: Partial<Reminder>) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, ...reminder } : r),
    }));
  };

  const deleteReminder = (id: string) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== id),
    }));
  };

  const exportData = () => {
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      setData(parsed);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        data,
        updateHydration,
        updateMood,
        addCycleEntry,
        updateCycleEntry,
        deleteCycleEntry,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        addWishlistItem,
        updateWishlistItem,
        deleteWishlistItem,
        addReminder,
        updateReminder,
        deleteReminder,
        exportData,
        importData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};
