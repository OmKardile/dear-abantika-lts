import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pill, Clock, Sparkles, Heart } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';

const categories = [
  { id: 'medication', label: 'Medication', icon: Pill },
  { id: 'water', label: 'Water', icon: Clock },
  { id: 'skincare', label: 'Skincare', icon: Sparkles },
  { id: 'general', label: 'General Care', icon: Heart },
] as const;

interface ReminderFormProps {
  onClose: () => void;
}

export function ReminderForm({ onClose }: ReminderFormProps) {
  const { addReminder } = useWellness();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState<'medication' | 'water' | 'skincare' | 'general'>('medication');
  const [days, setDays] = useState<boolean[]>([true, true, true, true, true, true, true]);

  const toggleDay = (index: number) => {
    const newDays = [...days];
    newDays[index] = !newDays[index];
    setDays(newDays);
  };

  const handleSave = () => {
    if (title) {
      addReminder({
        title,
        time,
        category,
        days,
        enabled: true,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md rounded-[32px] p-6 space-y-5"
          style={{
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-accent)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 
              className="text-xl"
              style={{ fontWeight: 700, color: 'var(--theme-text)' }}
            >
              New Reminder
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ 
                background: 'var(--theme-accent)',
                color: 'var(--theme-text)'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Title */}
          <div>
            <label 
              className="block text-sm mb-2"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Reminder Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Take vitamins"
              className="w-full py-3 px-4 rounded-2xl text-sm"
              style={{
                background: 'var(--theme-accent)',
                color: 'var(--theme-text)',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Time */}
          <div>
            <label 
              className="block text-sm mb-2"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full py-3 px-4 rounded-2xl text-sm"
              style={{
                background: 'var(--theme-accent)',
                color: 'var(--theme-text)',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label 
              className="block text-sm mb-3"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="flex items-center gap-2 p-3 rounded-2xl text-sm transition-all"
                    style={{
                      background: category === cat.id 
                        ? 'var(--theme-primary)' 
                        : 'var(--theme-accent)',
                      color: category === cat.id 
                        ? 'var(--theme-secondary)' 
                        : 'var(--theme-text)',
                      fontWeight: 600
                    }}
                  >
                    <Icon size={16} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days */}
          <div>
            <label 
              className="block text-sm mb-3"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Repeat On
            </label>
            <div className="flex gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className="flex-1 aspect-square rounded-2xl text-sm transition-all"
                  style={{
                    background: days[i] 
                      ? 'var(--theme-primary)' 
                      : 'var(--theme-accent)',
                    color: days[i] 
                      ? 'var(--theme-secondary)' 
                      : 'var(--theme-text)',
                    fontWeight: 600
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!title}
            className="w-full py-4 rounded-full text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'var(--theme-primary)',
              color: 'var(--theme-secondary)',
              fontWeight: 700
            }}
          >
            Create Reminder
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
