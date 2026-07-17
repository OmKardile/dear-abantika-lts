import { useState } from 'react';
import { Calendar, TrendingUp, ChevronLeft } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';
import { motion } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { CycleEntryForm } from '../components/CycleEntryForm';
import { CycleAnalytics } from '../components/CycleAnalytics';

export function CycleTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { cycleEntries } = useWellness();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntryForDate = (date: Date) => {
    return cycleEntries.find(entry => 
      isSameDay(new Date(entry.date), date)
    );
  };

  return (
    <div className="min-h-screen px-6 pt-8 pb-8">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 
            className="text-3xl"
            style={{ fontWeight: 700, color: 'var(--theme-text)' }}
          >
            Cycle Tracker
          </h1>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{
              background: showAnalytics ? 'var(--theme-primary)' : 'var(--theme-surface)',
              color: showAnalytics ? 'var(--theme-secondary)' : 'var(--theme-text)',
              border: '1px solid var(--theme-accent)'
            }}
          >
            <TrendingUp size={20} />
          </button>
        </div>
        <p 
          className="text-sm opacity-70"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          Your personal wellness journal
        </p>
      </motion.div>

      {showAnalytics ? (
        <CycleAnalytics />
      ) : (
        <>
          {/* Calendar Navigation */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'var(--theme-surface)', color: 'var(--theme-text)' }}
              >
                <ChevronLeft size={20} />
              </button>
              <h2 
                className="text-xl"
                style={{ fontWeight: 600, color: 'var(--theme-text)' }}
              >
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'var(--theme-surface)', color: 'var(--theme-text)' }}
              >
                <ChevronLeft size={20} className="rotate-180" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div 
              className="rounded-[24px] p-4"
              style={{
                background: 'var(--theme-surface)',
                border: '1px solid var(--theme-accent)'
              }}
            >
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div 
                    key={i}
                    className="text-center text-xs py-2"
                    style={{ color: 'var(--theme-text-secondary)', fontWeight: 600 }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                
                {/* Days of the month */}
                {daysInMonth.map((date) => {
                  const entry = getEntryForDate(date);
                  const isToday = isSameDay(date, new Date());
                  const isPeriod = entry?.isPeriod;
                  
                  return (
                    <motion.button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className="aspect-square rounded-2xl flex items-center justify-center text-sm transition-all relative"
                      style={{
                        background: isPeriod 
                          ? 'var(--theme-primary)' 
                          : isToday 
                          ? 'var(--theme-accent)' 
                          : 'transparent',
                        color: isPeriod 
                          ? 'var(--theme-secondary)' 
                          : 'var(--theme-text)',
                        fontWeight: isToday ? 600 : 400,
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {format(date, 'd')}
                      {entry && entry.symptoms.length > 0 && (
                        <div 
                          className="absolute bottom-1 w-1 h-1 rounded-full"
                          style={{ background: isPeriod ? 'var(--theme-secondary)' : 'var(--theme-primary)' }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Legend */}
          <motion.div
            className="mb-6 flex items-center gap-4 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ background: 'var(--theme-primary)' }}
              />
              <span>Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ background: 'var(--theme-accent)' }}
              />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ background: 'var(--theme-primary)' }} />
              <span>Symptoms</span>
            </div>
          </motion.div>

          {/* Entry Form or Prompt */}
          {selectedDate ? (
            <CycleEntryForm 
              date={selectedDate} 
              onClose={() => setSelectedDate(null)}
            />
          ) : (
            <motion.div
              className="rounded-[24px] p-8 text-center"
              style={{
                background: 'var(--theme-surface)',
                border: '1px solid var(--theme-accent)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                Select a date to log your cycle information
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
