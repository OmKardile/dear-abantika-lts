import { useState } from 'react';
import { BookHeart, ShoppingBag, Plus, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Diary } from '../components/Diary';
import { Wishlist } from '../components/Wishlist';

export function Journal() {
  const [activeTab, setActiveTab] = useState<'diary' | 'wishlist'>('diary');

  return (
    <div className="min-h-screen px-6 pt-8 pb-8">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 
          className="text-3xl mb-4"
          style={{ fontWeight: 700, color: 'var(--theme-text)' }}
        >
          My Journal
        </h1>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div 
          className="inline-flex rounded-full p-1"
          style={{
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-accent)'
          }}
        >
          <button
            onClick={() => setActiveTab('diary')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm transition-all relative"
            style={{
              background: activeTab === 'diary' ? 'var(--theme-primary)' : 'transparent',
              color: activeTab === 'diary' ? 'var(--theme-secondary)' : 'var(--theme-text)',
              fontWeight: 600
            }}
          >
            <BookHeart size={16} />
            My Diary
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm transition-all relative"
            style={{
              background: activeTab === 'wishlist' ? 'var(--theme-primary)' : 'transparent',
              color: activeTab === 'wishlist' ? 'var(--theme-secondary)' : 'var(--theme-text)',
              fontWeight: 600
            }}
          >
            <ShoppingBag size={16} />
            Wishlist
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'diary' ? <Diary /> : <Wishlist />}
      </motion.div>
    </div>
  );
}
