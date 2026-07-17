import { motion } from "motion/react";
import { Droplet, Plus, RotateCcw } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

export const Hydration = () => {
  const { data, updateHydration } = useData();

  const hydrationPercent = Math.min((data.hydration.current / data.hydration.goal) * 100, 100);

  // Prepare weekly history data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayName = format(subDays(new Date(), 6 - i), "EEE");
    const entry = data.hydration.history.find(h => h.date === date);
    return {
      day: dayName,
      amount: entry?.amount || 0,
      goal: data.hydration.goal,
    };
  });

  const resetDaily = () => {
    // In a real app, this would be automated at midnight
    // For now, user can manually reset
    const today = new Date().toISOString().split("T")[0];
    const currentHistory = data.hydration.history.filter(h => h.date !== today);
    // This is a simplified version - in the real context we'd handle this properly
  };

  return (
    <div className="px-4 pt-8 pb-4 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl mb-1" style={{ color: "var(--app-text)", fontWeight: 600 }}>
          Hydration Tracker
        </h1>
        <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
          Stay hydrated, stay healthy
        </p>
      </motion.div>

      {/* Water Illustration & Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div
          className="p-8 rounded-[32px] text-center"
          style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)" }}
        >
          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="transform -rotate-90" width="192" height="192">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="var(--app-surface-variant)"
                strokeWidth="16"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="var(--app-primary)"
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 552.92" }}
                animate={{ 
                  strokeDasharray: `${(hydrationPercent / 100) * 552.92} 552.92` 
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <Droplet 
                  size={48} 
                  style={{ 
                    color: "var(--app-primary)",
                    fill: hydrationPercent > 50 ? "var(--app-primary)" : "transparent"
                  }} 
                />
              </motion.div>
              <p className="text-3xl mt-2" style={{ color: "var(--app-text)", fontWeight: 600 }}>
                {data.hydration.current}ml
              </p>
              <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
                of {data.hydration.goal}ml
              </p>
            </div>
          </div>

          {/* Progress percentage */}
          <div className="mb-6">
            <p className="text-4xl mb-2" style={{ color: "var(--app-primary)", fontWeight: 600 }}>
              {Math.round(hydrationPercent)}%
            </p>
            <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
              {hydrationPercent >= 100 
                ? "🎉 Goal achieved! Great job!" 
                : `${data.hydration.goal - data.hydration.current}ml remaining`
              }
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex gap-3 justify-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => updateHydration(250)}
              className="px-6 py-3 rounded-full flex items-center gap-2"
              style={{ backgroundColor: "var(--app-primary)", color: "var(--app-surface)" }}
            >
              <Plus size={18} />
              250ml
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => updateHydration(500)}
              className="px-6 py-3 rounded-full flex items-center gap-2"
              style={{ backgroundColor: "var(--app-primary)", color: "var(--app-surface)" }}
            >
              <Plus size={18} />
              500ml
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Weekly History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="mb-4" style={{ color: "var(--app-text)", fontWeight: 600 }}>
          Weekly History
        </h2>
        <div
          className="p-6 rounded-[24px]"
          style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)" }}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: "var(--app-text-secondary)", fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: "var(--app-text-secondary)", fontSize: 12 }}
                label={{ 
                  value: 'ml', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: "var(--app-text-secondary)" }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--app-surface)", 
                  border: "1px solid var(--app-border)",
                  borderRadius: "12px"
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="var(--app-primary)" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Hydration Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h2 className="mb-4" style={{ color: "var(--app-text)", fontWeight: 600 }}>
          Hydration Tips
        </h2>
        
        {[
          {
            icon: "💧",
            title: "Morning Routine",
            tip: "Start your day with a glass of water to jumpstart your metabolism."
          },
          {
            icon: "⏰",
            title: "Set Reminders",
            tip: "Schedule regular water breaks throughout your day."
          },
          {
            icon: "🍋",
            title: "Add Flavor",
            tip: "Try adding lemon, cucumber, or mint to make water more enjoyable."
          },
          {
            icon: "🏃‍♀️",
            title: "Exercise Hydration",
            tip: "Drink extra water before, during, and after physical activity."
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="p-4 rounded-[20px]"
            style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)" }}
          >
            <div className="flex gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="mb-1" style={{ color: "var(--app-text)", fontWeight: 600 }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
                  {item.tip}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Goal Setting Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 p-6 rounded-[24px] text-center"
        style={{ backgroundColor: "var(--app-surface)", border: "1px solid var(--app-border)" }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--app-text-secondary)" }}>
          Your daily goal is set to <span style={{ color: "var(--app-primary)", fontWeight: 600 }}>
          {data.hydration.goal}ml
          </span>. The recommended daily water intake for most adults is around 2000ml (8 glasses).
        </p>
      </motion.div>
    </div>
  );
};
