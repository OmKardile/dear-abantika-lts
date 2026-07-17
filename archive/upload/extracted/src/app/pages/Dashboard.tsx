import { motion } from "motion/react";
import { Droplet, Smile, Flower2, Bell, Plus } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

export const Dashboard = () => {
  const { data, updateHydration, updateMood } = useData();
  const navigate = useNavigate();
  const [showMoodDialog, setShowMoodDialog] = useState(false);

  const moods = ["😊", "😄", "😌", "😔", "😢", "😴", "🥰", "😤", "🤗", "😇"];

  const quickActions = [
    { 
      label: "Log Water", 
      icon: Droplet, 
      color: "var(--app-primary)",
      action: () => {
        updateHydration(250);
      }
    },
    { 
      label: "Log Mood", 
      icon: Smile, 
      color: "var(--app-primary)",
      action: () => setShowMoodDialog(true)
    },
    { 
      label: "Cycle Entry", 
      icon: Flower2, 
      color: "var(--app-primary)",
      action: () => navigate("/cycle")
    },
    { 
      label: "Add Reminder", 
      icon: Bell, 
      color: "var(--app-primary)",
      action: () => navigate("/settings")
    },
  ];

  const hydrationPercent = (data.hydration.current / data.hydration.goal) * 100;
  const nextReminder = data.reminders.find(r => r.enabled);

  return (
    <div className="px-4 pt-8 pb-4 max-w-md mx-auto">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 
          className="text-3xl text-center mb-2"
          style={{ 
            fontWeight: 600,
            color: "var(--app-text)"
          }}
        >
          ✨ Abantika Kardile ✨
        </h1>
        <p
          className="text-center"
          style={{ 
            color: "var(--app-text-secondary)",
            fontSize: "15px"
          }}
        >
          Take care of yourself today.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                onClick={action.action}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                className="flex flex-col items-center gap-2 p-4 rounded-[24px] transition-all"
                style={{
                  backgroundColor: "var(--app-surface)",
                  border: "1px solid var(--app-border)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--app-surface-variant)" }}
                >
                  <Icon size={20} style={{ color: action.color }} strokeWidth={2} />
                </div>
                <span
                  className="text-xs text-center leading-tight"
                  style={{ 
                    color: "var(--app-text)",
                    fontWeight: 500
                  }}
                >
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4 mb-8"
      >
        {/* Hydration Card */}
        <div
          className="p-6 rounded-[24px]"
          style={{
            backgroundColor: "var(--app-surface)",
            border: "1px solid var(--app-border)",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 style={{ color: "var(--app-text)", fontWeight: 600 }}>
                Hydration
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--app-text-secondary)" }}>
                {data.hydration.current}ml / {data.hydration.goal}ml
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--app-surface-variant)" }}
            >
              <Droplet size={20} style={{ color: "var(--app-primary)" }} />
            </div>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-surface-variant)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(hydrationPercent, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ backgroundColor: "var(--app-primary)" }}
            />
          </div>
        </div>

        {/* Mood Card */}
        <div
          className="p-6 rounded-[24px]"
          style={{
            backgroundColor: "var(--app-surface)",
            border: "1px solid var(--app-border)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 style={{ color: "var(--app-text)", fontWeight: 600 }}>
                Today's Mood
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--app-text-secondary)" }}>
                How are you feeling?
              </p>
            </div>
            <div className="text-3xl">
              {data.mood.current}
            </div>
          </div>
        </div>

        {/* Cycle Status Card */}
        <div
          className="p-6 rounded-[24px]"
          style={{
            backgroundColor: "var(--app-surface)",
            border: "1px solid var(--app-border)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 style={{ color: "var(--app-text)", fontWeight: 600 }}>
                Cycle Status
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--app-text-secondary)" }}>
                {data.cycleEntries.length > 0 
                  ? `${data.cycleEntries.length} entries logged`
                  : "Start tracking your cycle"
                }
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--app-surface-variant)" }}
            >
              <Flower2 size={20} style={{ color: "var(--app-primary)" }} />
            </div>
          </div>
        </div>

        {/* Next Reminder Card */}
        {nextReminder && (
          <div
            className="p-6 rounded-[24px]"
            style={{
              backgroundColor: "var(--app-surface)",
              border: "1px solid var(--app-border)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 style={{ color: "var(--app-text)", fontWeight: 600 }}>
                  Next Reminder
                </h3>
                <p className="text-sm mt-1" style={{ color: "var(--app-text-secondary)" }}>
                  {nextReminder.title} at {nextReminder.time}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--app-surface-variant)" }}
              >
                <Bell size={20} style={{ color: "var(--app-primary)" }} />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Daily Advice Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="p-6 rounded-[24px] mb-4"
        style={{
          backgroundColor: "var(--app-surface)",
          border: "1px solid var(--app-border)",
        }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">🌸</div>
          <h3 className="mb-2" style={{ color: "var(--app-text)", fontWeight: 600 }}>
            Daily Wellness Tip
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--app-text-secondary)" }}>
            Remember to take breaks throughout your day. Even a few minutes of deep breathing 
            can help center your mind and reduce stress.
          </p>
        </div>
      </motion.div>

      {/* Mood Dialog */}
      <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
        <DialogContent 
          className="rounded-[28px]"
          style={{
            backgroundColor: "var(--app-surface)",
            border: "1px solid var(--app-border)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--app-text)" }}>
              How are you feeling?
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-4 py-4">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => {
                  updateMood(mood);
                  setShowMoodDialog(false);
                }}
                className="text-4xl hover:scale-110 transition-transform"
              >
                {mood}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
