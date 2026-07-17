import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, AlertCircle, Sparkles, Heart } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';

const categories = [
  { id: 'save-later', label: 'Save for Later', icon: Clock },
  { id: 'urgent', label: 'Urgent Need', icon: AlertCircle },
  { id: 'dream', label: 'Dream Cart', icon: Sparkles },
  { id: 'for-him', label: 'For Him', icon: Heart },
] as const;

interface WishlistItemFormProps {
  defaultCategory?: string;
  onClose: () => void;
}

export function WishlistItemForm({ defaultCategory = 'save-later', onClose }: WishlistItemFormProps) {
  const { addWishlistItem } = useWellness();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');

  const handleSave = () => {
    if (title && description) {
      addWishlistItem({
        title,
        description,
        category: category as any,
        notes: notes || undefined,
        link: link || undefined,
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
              Add to Wishlist
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

          {/* Title */}
          <div>
            <label 
              className="block text-sm mb-2"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Item Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want?"
              className="w-full py-3 px-4 rounded-2xl text-sm"
              style={{
                background: 'var(--theme-accent)',
                color: 'var(--theme-text)',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label 
              className="block text-sm mb-2"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this item..."
              rows={3}
              className="w-full py-3 px-4 rounded-2xl text-sm resize-none"
              style={{
                background: 'var(--theme-accent)',
                color: 'var(--theme-text)',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label 
              className="block text-sm mb-2"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Size, color, or other notes..."
              className="w-full py-3 px-4 rounded-2xl text-sm"
              style={{
                background: 'var(--theme-accent)',
                color: 'var(--theme-text)',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Link */}
          <div>
            <label 
              className="block text-sm mb-2"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Link (Optional)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full py-3 px-4 rounded-2xl text-sm"
              style={{
                background: 'var(--theme-accent)',
                color: 'var(--theme-text)',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!title || !description}
            className="w-full py-4 rounded-full text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'var(--theme-primary)',
              color: 'var(--theme-secondary)',
              fontWeight: 700
            }}
          >
            Add to Wishlist
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
