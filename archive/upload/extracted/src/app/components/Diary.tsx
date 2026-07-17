import { useState } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWellness } from '../contexts/WellnessContext';
import { DiaryEntryForm } from './DiaryEntryForm';
import { format } from 'date-fns';

const moodFilters = ['All', '😊', '😌', '😔', '😤', '😴', '🥰', '😰', '😎'];

export function Diary() {
  const { journalEntries } = useWellness();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState('All');

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.reflection.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = moodFilter === 'All' || entry.mood === moodFilter;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div 
        className="flex items-center gap-3 px-4 py-3 rounded-[20px]"
        style={{
          background: 'var(--theme-surface)',
          border: '1px solid var(--theme-accent)'
        }}
      >
        <Search size={20} style={{ color: 'var(--theme-text-secondary)' }} />
        <input
          type="text"
          placeholder="Search your thoughts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--theme-text)' }}
        />
      </div>

      {/* Mood Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {moodFilters.map(mood => (
          <button
            key={mood}
            onClick={() => setMoodFilter(mood)}
            className="px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all shrink-0"
            style={{
              background: moodFilter === mood ? 'var(--theme-primary)' : 'var(--theme-surface)',
              color: moodFilter === mood ? 'var(--theme-secondary)' : 'var(--theme-text)',
              border: '1px solid var(--theme-accent)',
              fontWeight: 600
            }}
          >
            {mood}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                className="rounded-[24px] p-5 cursor-pointer"
                style={{
                  background: 'var(--theme-surface)',
                  border: '1px solid var(--theme-accent)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{entry.mood}</span>
                    <div>
                      <h3 
                        className="text-lg mb-1"
                        style={{ fontWeight: 600, color: 'var(--theme-text)' }}
                      >
                        {entry.title}
                      </h3>
                      <p 
                        className="text-xs opacity-60"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {format(new Date(entry.date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  {entry.sticker && (
                    <span className="text-2xl">{entry.sticker}</span>
                  )}
                </div>
                <p 
                  className="text-sm leading-relaxed line-clamp-3"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  {entry.reflection}
                </p>
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
              <Calendar 
                size={48} 
                className="mx-auto mb-4 opacity-40"
                style={{ color: 'var(--theme-primary)' }}
              />
              <p 
                className="text-sm opacity-70"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {searchQuery || moodFilter !== 'All' 
                  ? 'No entries match your filters'
                  : 'Start your wellness journal today'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Entry Button */}
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

      {/* Entry Form */}
      {showForm && (
        <DiaryEntryForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
