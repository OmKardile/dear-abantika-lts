import { motion } from "motion/react";
import { useState } from "react";
import { Palette, Bell, Download, Upload, Plus, Clock, Check, Trash2 } from "lucide-react";
import { useTheme, themes, ThemeColor } from "../contexts/ThemeContext";
import { useData } from "../contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export const Settings = () => {
  const { theme: currentTheme, setTheme } = useTheme();
  const { data, addReminder, updateReminder, deleteReminder, exportData, importData } = useData();
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState("");

  const [reminderForm, setReminderForm] = useState({
    title: "",
    category: "general-care" as "medication" | "water" | "skincare" | "general-care",
    time: "09:00",
    days: [] as string[],
  });

  const categories = [
    { value: "medication", label: "Medication", icon: "💊" },
    { value: "water", label: "Water", icon: "💧" },
    { value: "skincare", label: "Skincare", icon: "✨" },
    { value: "general-care", label: "General Care", icon: "🌸" },
  ];

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleSubmitReminder = () => {
    addReminder({
      title: reminderForm.title,
      category: reminderForm.category,
      time: reminderForm.time,
      days: reminderForm.days,
      enabled: true,
    });
    setShowReminderDialog(false);
    setReminderForm({ title: "", category: "general-care", time: "09:00", days: [] });
    toast.success("Reminder added successfully!");
  };

  const toggleDay = (day: string) => {
    setReminderForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleExport = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `abantika-backup-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const handleImport = () => {
    if (importData(importJson)) {
      toast.success("Data imported successfully!");
      setShowImportDialog(false);
      setImportJson("");
    } else {
      toast.error("Invalid data format. Please check your file.");
    }
  };

  return (
    <div className="px-4 pt-8 pb-4 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl mb-1" style={{ color: "var(--app-text)", fontWeight: 600 }}>
          Settings
        </h1>
        <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
          Personalize your experience
        </p>
      </motion.div>

      <Tabs defaultValue="theme" className="w-full">
        <TabsList 
          className="w-full mb-6 p-1 rounded-[20px]"
          style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)" }}
        >
          <TabsTrigger 
            value="theme" 
            className="flex-1 rounded-[16px] text-sm"
            style={{ color: "var(--app-text-secondary)" }}
          >
            <Palette size={16} className="mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger 
            value="reminders"
            className="flex-1 rounded-[16px] text-sm"
            style={{ color: "var(--app-text-secondary)" }}
          >
            <Bell size={16} className="mr-2" />
            Reminders
          </TabsTrigger>
          <TabsTrigger 
            value="backup"
            className="flex-1 rounded-[16px] text-sm"
            style={{ color: "var(--app-text-secondary)" }}
          >
            <Download size={16} className="mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="mb-4" style={{ color: "var(--app-text)", fontWeight: 600 }}>
              Choose Your Theme
            </h2>
            
            <div className="space-y-3">
              {(Object.keys(themes) as ThemeColor[]).map((themeKey) => {
                const themeData = themes[themeKey];
                const isActive = currentTheme === themeKey;
                
                return (
                  <motion.button
                    key={themeKey}
                    onClick={() => setTheme(themeKey)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-5 rounded-[24px] text-left transition-all"
                    style={{
                      backgroundColor: "var(--app-surface)",
                      border: `2px solid ${isActive ? "var(--app-primary)" : "var(--app-border)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{themeData.emoji}</span>
                        <div>
                          <h3 style={{ color: "var(--app-text)", fontWeight: 600 }}>
                            {themeData.name}
                          </h3>
                        </div>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "var(--app-primary)" }}
                        >
                          <Check size={14} style={{ color: "var(--app-surface)" }} />
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Color Preview */}
                    <div className="flex gap-2">
                      {[
                        themeData.background,
                        themeData.surface,
                        themeData.primary,
                        themeData.accent,
                      ].map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full border-2"
                          style={{ 
                            backgroundColor: color,
                            borderColor: "var(--app-border)"
                          }}
                        />
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ color: "var(--app-text)", fontWeight: 600 }}>
                Your Reminders
              </h2>
              <Button
                onClick={() => setShowReminderDialog(true)}
                size="sm"
                className="rounded-full"
                style={{ backgroundColor: "var(--app-primary)", color: "var(--app-surface)" }}
              >
                <Plus size={16} className="mr-2" />
                Add
              </Button>
            </div>

            {data.reminders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">⏰</div>
                <h3 className="mb-2" style={{ color: "var(--app-text)", fontWeight: 600 }}>
                  No Reminders Yet
                </h3>
                <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
                  Set up reminders for medications, water intake, and self-care routines.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.reminders.map((reminder) => {
                  const category = categories.find(c => c.value === reminder.category);
                  
                  return (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-[20px]"
                      style={{ 
                        backgroundColor: "var(--app-surface)", 
                        border: "1px solid var(--app-border)",
                        opacity: reminder.enabled ? 1 : 0.6
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{category?.icon}</span>
                          <div>
                            <h3 className="mb-1" style={{ color: "var(--app-text)", fontWeight: 600 }}>
                              {reminder.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--app-text-secondary)" }}>
                              <Clock size={14} />
                              {reminder.time}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateReminder(reminder.id, { enabled: !reminder.enabled })}
                            className="p-2 rounded-full transition-all"
                            style={{ backgroundColor: "var(--app-surface-variant)" }}
                          >
                            <Bell 
                              size={16} 
                              style={{ 
                                color: reminder.enabled ? "var(--app-primary)" : "var(--app-text-secondary)"
                              }} 
                            />
                          </button>
                          <button
                            onClick={() => {
                              deleteReminder(reminder.id);
                              toast.success("Reminder deleted");
                            }}
                            className="p-2 rounded-full transition-all"
                            style={{ backgroundColor: "var(--app-surface-variant)" }}
                          >
                            <Trash2 size={16} style={{ color: "var(--app-text-secondary)" }} />
                          </button>
                        </div>
                      </div>
                      
                      {reminder.days.length > 0 && (
                        <div className="flex gap-1">
                          {reminder.days.map(day => (
                            <span
                              key={day}
                              className="px-2 py-1 rounded-full text-xs"
                              style={{ 
                                backgroundColor: "var(--app-surface-variant)",
                                color: "var(--app-text)"
                              }}
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="mb-4" style={{ color: "var(--app-text)", fontWeight: 600 }}>
              Backup & Restore
            </h2>

            {/* Export Card */}
            <div
              className="p-6 rounded-[24px] text-center"
              style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)" }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: "var(--app-surface-variant)" }}
              >
                <Download size={28} style={{ color: "var(--app-primary)" }} />
              </div>
              <h3 className="mb-2" style={{ color: "var(--app-text)", fontWeight: 600 }}>
                Export Your Data
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--app-text-secondary)" }}>
                Download all your wellness data as a JSON file for safekeeping.
              </p>
              <Button
                onClick={handleExport}
                className="rounded-full"
                style={{ backgroundColor: "var(--app-primary)", color: "var(--app-surface)" }}
              >
                <Download size={16} className="mr-2" />
                Export Data
              </Button>
            </div>

            {/* Import Card */}
            <div
              className="p-6 rounded-[24px] text-center"
              style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)" }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: "var(--app-surface-variant)" }}
              >
                <Upload size={28} style={{ color: "var(--app-primary)" }} />
              </div>
              <h3 className="mb-2" style={{ color: "var(--app-text)", fontWeight: 600 }}>
                Restore Your Data
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--app-text-secondary)" }}>
                Import previously exported data to restore your wellness journey.
              </p>
              <Button
                onClick={() => setShowImportDialog(true)}
                variant="outline"
                className="rounded-full"
                style={{ borderColor: "var(--app-border)" }}
              >
                <Upload size={16} className="mr-2" />
                Restore Data
              </Button>
            </div>

            {/* Info */}
            <div
              className="p-4 rounded-[20px]"
              style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)" }}
            >
              <p className="text-xs leading-relaxed" style={{ color: "var(--app-text-secondary)" }}>
                <strong style={{ color: "var(--app-text)" }}>Note:</strong> Your data is stored locally 
                on your device and is completely private. Regular backups are recommended to prevent data loss.
              </p>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent 
          className="rounded-[28px]"
          style={{
            backgroundColor: "var(--app-surface)",
            border: "1px solid var(--app-border)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--app-text)" }}>
              New Reminder
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label style={{ color: "var(--app-text)" }}>Reminder Title</Label>
              <Input
                value={reminderForm.title}
                onChange={(e) => setReminderForm(prev => ({ ...prev, title: e.target.value }))}
                className="mt-2 rounded-2xl"
                style={{ backgroundColor: "var(--app-surface-variant)", border: "1px solid var(--app-border)" }}
                placeholder="e.g., Take vitamins"
              />
            </div>

            <div>
              <Label style={{ color: "var(--app-text)" }}>Category</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setReminderForm(prev => ({ ...prev, category: cat.value as any }))}
                    className="py-3 px-4 rounded-2xl text-sm transition-all"
                    style={{
                      backgroundColor: reminderForm.category === cat.value 
                        ? "var(--app-primary)" 
                        : "var(--app-surface-variant)",
                      color: reminderForm.category === cat.value 
                        ? "var(--app-surface)" 
                        : "var(--app-text)",
                    }}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="time" style={{ color: "var(--app-text)" }}>Time</Label>
              <Input
                id="time"
                type="time"
                value={reminderForm.time}
                onChange={(e) => setReminderForm(prev => ({ ...prev, time: e.target.value }))}
                className="mt-2 rounded-2xl"
                style={{ backgroundColor: "var(--app-surface-variant)", border: "1px solid var(--app-border)" }}
              />
            </div>

            <div>
              <Label style={{ color: "var(--app-text)" }}>Repeat on</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {weekdays.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className="px-4 py-2 rounded-full text-sm transition-all"
                    style={{
                      backgroundColor: reminderForm.days.includes(day) 
                        ? "var(--app-primary)" 
                        : "var(--app-surface-variant)",
                      color: reminderForm.days.includes(day) 
                        ? "var(--app-surface)" 
                        : "var(--app-text)",
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowReminderDialog(false)}
              variant="outline"
              className="flex-1 rounded-full"
              style={{ borderColor: "var(--app-border)" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReminder}
              className="flex-1 rounded-full"
              style={{ backgroundColor: "var(--app-primary)", color: "var(--app-surface)" }}
              disabled={!reminderForm.title || reminderForm.days.length === 0}
            >
              Add Reminder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent 
          className="rounded-[28px]"
          style={{
            backgroundColor: "var(--app-surface)",
            border: "1px solid var(--app-border)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--app-text)" }}>
              Restore Data
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Label style={{ color: "var(--app-text)" }}>Paste your backup JSON data</Label>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full mt-2 p-4 rounded-2xl min-h-[200px] font-mono text-sm"
              style={{ 
                backgroundColor: "var(--app-surface-variant)", 
                border: "1px solid var(--app-border)",
                color: "var(--app-text)"
              }}
              placeholder='{"hydration": {...}, "cycleEntries": [...], ...}'
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowImportDialog(false)}
              variant="outline"
              className="flex-1 rounded-full"
              style={{ borderColor: "var(--app-border)" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              className="flex-1 rounded-full"
              style={{ backgroundColor: "var(--app-primary)", color: "var(--app-surface)" }}
              disabled={!importJson}
            >
              Restore
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
