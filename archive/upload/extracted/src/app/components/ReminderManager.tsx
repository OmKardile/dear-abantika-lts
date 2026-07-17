import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus, Clock, Pill, Sparkles, Heart, Trash2 } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';
import { ReminderForm } from './ReminderForm';

const categoryIcons = {
  medication: Pill,
  water: Clock,
  skincare: Sparkles,
  general: Heart,
};

const categoryColors = {
  medication: '#FF6B9D',
  water: '#4ECDC4',
  skincare: '#FFE66D',
  general: '#A8E6CF',
};

interface ReminderManagerProps {
  onBack: () => void;
}

export function ReminderManager({ onBack }: ReminderManagerProps) {
  const { reminders, deleteReminder, updateReminder } = useWellness();
  const [showForm, setShowForm] = useState(false);

  const toggleReminder = (id: string, enabled: boolean) => {
    updateReminder(id, { enabled });
  };

  return (
    <div className="min-h-screen px-6 pt-8 pb-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 transition-all"
          style={{ color: 'var(--theme-text)' }}
        >
          <ChevronLeft size={20} />
          <span className="text-sm" style={{ fontWeight: 600 }}>Back</span>
        </button>
        <h1 
          className="text-3xl mb-2"
          style={{ fontWeight: 700, color: 'var(--theme-text)' }}
        >
          Reminders
        </h1>
        <p 
          className="text-sm opacity-70"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          Never miss a wellness moment
        </p>
      </motion.div>

      {/* Reminders List */}
      <div className="space-y-3 mb-24">
        <AnimatePresence>
          {reminders.length > 0 ? (
            reminders.map((reminder, index) => {
              const Icon = categoryIcons[reminder.category];
              const activeDays = reminder.days.filter(d => d).length;
              
              return (
                <motion.div
                  key={reminder.id}
                  className="rounded-[24px] p-5"
                  style={{
                    background: 'var(--theme-surface)',
                    border: '1px solid var(--theme-accent)'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ 
                          background: categoryColors[reminder.category] + '20',
                          color: categoryColors[reminder.category]
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-base mb-1"
                          style={{ fontWeight: 600, color: 'var(--theme-text)' }}
                        >
                          {reminder.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={14} style={{ color: 'var(--theme-text-secondary)' }} />
                          <p 
                            className="text-sm"
                            style={{ color: 'var(--theme-text-secondary)' }}
                          >
                            {reminder.time}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                              style={{
                                background: reminder.days[i] 
                                  ? 'var(--theme-primary)' 
                                  : 'var(--theme-accent)',
                                color: reminder.days[i] 
                                  ? 'var(--theme-secondary)' 
                                  : 'var(--theme-text-secondary)',
                                fontSize: '0.65rem'
                              }}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div
                        onClick={() => toggleReminder(reminder.id, !reminder.enabled)}
                        className="relative w-12 h-7 rounded-full transition-all cursor-pointer"
                        style={{
                          background: reminder.enabled ? 'var(--theme-primary)' : 'var(--theme-accent)'
                        }}
                      >
                        <motion.div
                          className="absolute top-1 w-5 h-5 rounded-full"
                          style={{ background: 'var(--theme-secondary)' }}
                          animate={{ left: reminder.enabled ? 'calc(100% - 24px)' : '4px' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                        style={{ 
                          background: 'var(--theme-accent)',
                          color: 'var(--theme-text-secondary)'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
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
              <Clock 
                size={48} 
                className="mx-auto mb-4 opacity-40"
                style={{ color: 'var(--theme-primary)' }}
              />
              <p 
                className="text-sm opacity-70"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                No reminders yet. Add one to get started!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Reminder Button */}
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

      {/* Reminder Form */}
      {showForm && (
        <ReminderForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
