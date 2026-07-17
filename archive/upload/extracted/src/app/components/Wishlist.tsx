import { useState } from 'react';
import { Plus, Clock, AlertCircle, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWellness } from '../contexts/WellnessContext';
import { WishlistItemForm } from './WishlistItemForm';

const categories = [
  { id: 'save-later', label: 'Save for Later', icon: Clock },
  { id: 'urgent', label: 'Urgent Need', icon: AlertCircle },
  { id: 'dream', label: 'Dream Cart', icon: Sparkles },
  { id: 'for-him', label: 'For Him', icon: Heart },
] as const;

export function Wishlist() {
  const { wishlistItems } = useWellness();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('save-later');

  const filteredItems = wishlistItems.filter(
    item => item.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map(cat => {
          const Icon = cat.icon;
          const count = wishlistItems.filter(item => item.category === cat.id).length;
          
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-[20px] p-4 text-left transition-all"
              style={{
                background: selectedCategory === cat.id 
                  ? 'var(--theme-primary)' 
                  : 'var(--theme-surface)',
                color: selectedCategory === cat.id 
                  ? 'var(--theme-secondary)' 
                  : 'var(--theme-text)',
                border: '1px solid var(--theme-accent)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} />
                <span 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: selectedCategory === cat.id 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'var(--theme-accent)'
                  }}
                >
                  {count}
                </span>
              </div>
              <p className="text-sm" style={{ fontWeight: 600 }}>
                {cat.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Items */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="rounded-[24px] p-5"
                style={{
                  background: 'var(--theme-surface)',
                  border: '1px solid var(--theme-accent)'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex gap-4">
                  {/* Image Placeholder */}
                  <div 
                    className="w-20 h-20 rounded-2xl shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--theme-accent)' }}
                  >
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <Sparkles 
                        size={32} 
                        style={{ color: 'var(--theme-text-secondary)', opacity: 0.3 }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-base mb-1 truncate"
                      style={{ fontWeight: 600, color: 'var(--theme-text)' }}
                    >
                      {item.title}
                    </h3>
                    <p 
                      className="text-sm mb-2 line-clamp-2"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      {item.description}
                    </p>
                    {item.notes && (
                      <p 
                        className="text-xs opacity-60 line-clamp-1"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        💭 {item.notes}
                      </p>
                    )}
                    {item.link && (
                      <a 
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs mt-2 inline-block"
                        style={{ color: 'var(--theme-primary)', fontWeight: 600 }}
                      >
                        View Link →
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="rounded-[24px] p-8 text-center"
              style={{
                background: 'var(--theme-surface)',
                border: '1px solid var(--theme-accent)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Sparkles 
                size={48} 
                className="mx-auto mb-4 opacity-40"
                style={{ color: 'var(--theme-primary)' }}
              />
              <p 
                className="text-sm opacity-70"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                No items in this category yet
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Item Button */}
      <motion.button
        onClick={() => setShowForm(true)}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-40"
        style={{
          background: 'var(--theme-primary)',
          color: 'var(--theme-secondary)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus size={24} />
      </motion.button>

      {/* Item Form */}
      {showForm && (
        <WishlistItemForm 
          defaultCategory={selectedCategory as any}
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}
