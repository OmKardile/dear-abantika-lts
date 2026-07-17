import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';

const moods = ['😊', '😌', '😔', '😤', '😴', '🥰', '😰', '😎', '🤗', '😢', '💪', '🤔'];
const stickers = ['⭐', '✨', '💖', '🌸', '🌈', '🦋', '🌙', '☀️', '🎀', '💐', '🌺', '🎨'];

interface DiaryEntryFormProps {
  onClose: () => void;
}

export function DiaryEntryForm({ onClose }: DiaryEntryFormProps) {
  const { addJournalEntry } = useWellness();
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('😊');
  const [reflection, setReflection] = useState('');
  const [sticker, setSticker] = useState('⭐');

  const handleSave = () => {
    if (title && reflection) {
      addJournalEntry({
        date: new Date().toISOString(),
        title,
        mood,
        reflection,
        sticker,
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
              New Journal Entry
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
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full py-3 px-4 rounded-2xl text-sm"
              style={{
                background: 'var(--theme-accent)',
                color: 'var(--theme-text)',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Mood */}
          <div>
            <label 
              className="block text-sm mb-3"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className="w-12 h-12 rounded-2xl text-2xl transition-all"
                  style={{
                    background: mood === m ? 'var(--theme-primary)' : 'var(--theme-accent)',
                    transform: mood === m ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div>
            <label 
              className="block text-sm mb-2"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Your Thoughts
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write about your day, feelings, or anything on your mind..."
              rows={6}
              className="w-full py-3 px-4 rounded-2xl text-sm resize-none"
              style={{
                background: 'var(--theme-accent)',
                color: 'var(--theme-text)',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Sticker */}
          <div>
            <label 
              className="block text-sm mb-3"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Add a Sticker
            </label>
            <div className="flex flex-wrap gap-2">
              {stickers.map((s) => (
                <button
                  key={s}
                  onClick={() => setSticker(s)}
                  className="w-10 h-10 rounded-xl text-xl transition-all"
                  style={{
                    background: sticker === s ? 'var(--theme-primary)' : 'var(--theme-accent)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!title || !reflection}
            className="w-full py-4 rounded-full text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'var(--theme-primary)',
              color: 'var(--theme-secondary)',
              fontWeight: 700
            }}
          >
            Save Entry
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
