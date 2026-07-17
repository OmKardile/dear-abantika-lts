import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Peaceful' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🥰', label: 'Loved' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😎', label: 'Confident' },
  { emoji: '🤗', label: 'Grateful' },
  { emoji: '😢', label: 'Emotional' },
  { emoji: '💪', label: 'Energized' },
  { emoji: '🤔', label: 'Thoughtful' },
];

interface MoodSelectorProps {
  currentMood: string;
  onSelect: (mood: string) => void;
  onClose: () => void;
}

export function MoodSelector({ currentMood, onSelect, onClose }: MoodSelectorProps) {
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
          className="relative w-full max-w-md rounded-[32px] p-6"
          style={{
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-accent)',
          }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 
              className="text-xl"
              style={{ fontWeight: 700, color: 'var(--theme-text)' }}
            >
              How are you feeling?
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

          {/* Mood Grid */}
          <div className="grid grid-cols-4 gap-3">
            {moods.map((mood, index) => (
              <motion.button
                key={mood.emoji}
                onClick={() => onSelect(mood.emoji)}
                className="aspect-square rounded-[20px] flex flex-col items-center justify-center gap-1 transition-all"
                style={{
                  background: currentMood === mood.emoji 
                    ? 'var(--theme-primary)' 
                    : 'var(--theme-accent)',
                  color: currentMood === mood.emoji 
                    ? 'var(--theme-secondary)' 
                    : 'var(--theme-text)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs opacity-80">{mood.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
