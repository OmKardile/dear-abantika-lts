import { motion } from 'motion/react';
import { ChevronLeft, Check } from 'lucide-react';
import { useTheme, themes, ThemeType } from '../contexts/ThemeContext';

interface ThemePickerProps {
  onBack: () => void;
}

export function ThemePicker({ onBack }: ThemePickerProps) {
  const { theme, setTheme } = useTheme();

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
          Choose Your Theme
        </h1>
        <p 
          className="text-sm opacity-70"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          Select a color palette that resonates with you
        </p>
      </motion.div>

      {/* Theme Grid */}
      <div className="space-y-4">
        {Object.entries(themes).map(([key, themeData], index) => {
          const isSelected = theme === key;
          
          return (
            <motion.button
              key={key}
              onClick={() => setTheme(key as ThemeType)}
              className="w-full rounded-[28px] p-6 text-left transition-all relative overflow-hidden"
              style={{
                background: themeData.surface,
                border: `2px solid ${isSelected ? themeData.primary : themeData.accent}`,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Color Swatches */}
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-full border-2"
                  style={{ 
                    background: themeData.primary,
                    borderColor: themeData.background
                  }}
                />
                <div 
                  className="w-10 h-10 rounded-full border-2"
                  style={{ 
                    background: themeData.secondary,
                    borderColor: themeData.background
                  }}
                />
                <div 
                  className="w-8 h-8 rounded-full border-2"
                  style={{ 
                    background: themeData.accent,
                    borderColor: themeData.background
                  }}
                />
              </div>

              {/* Theme Name */}
              <h3 
                className="text-xl mb-2"
                style={{ fontWeight: 700, color: themeData.text }}
              >
                {themeData.name}
              </h3>

              {/* Preview Text */}
              <p 
                className="text-sm"
                style={{ color: themeData.textSecondary }}
              >
                Your wellness journey awaits
              </p>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: themeData.primary }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Check size={16} style={{ color: themeData.secondary }} />
                </motion.div>
              )}

              {/* Decorative Background */}
              <div 
                className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10"
                style={{ background: themeData.primary }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Preview Card */}
      <motion.div
        className="mt-8 rounded-[24px] p-6"
        style={{
          background: 'var(--theme-surface)',
          border: '1px solid var(--theme-accent)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 
          className="text-sm mb-3 uppercase tracking-wider opacity-60"
          style={{ color: 'var(--theme-text)' }}
        >
          Current Preview
        </h3>
        <div className="space-y-3">
          <div 
            className="p-4 rounded-2xl"
            style={{ background: 'var(--theme-accent)' }}
          >
            <p 
              className="text-sm"
              style={{ color: 'var(--theme-text)', fontWeight: 600 }}
            >
              Sample Card
            </p>
          </div>
          <button
            className="w-full py-3 rounded-full text-sm"
            style={{
              background: 'var(--theme-primary)',
              color: 'var(--theme-secondary)',
              fontWeight: 700
            }}
          >
            Sample Button
          </button>
        </div>
      </motion.div>
    </div>
  );
}
