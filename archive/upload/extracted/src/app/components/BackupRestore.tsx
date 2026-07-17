import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useWellness } from '../contexts/WellnessContext';

interface BackupRestoreProps {
  onBack: () => void;
}

export function BackupRestore({ onBack }: BackupRestoreProps) {
  const { exportData, importData } = useWellness();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportData();
      setMessage({ type: 'success', text: 'Your data has been exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importData(content);
        setMessage({ type: 'success', text: 'Your data has been restored successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to import data. Please check the file.' });
        setTimeout(() => setMessage(null), 3000);
      }
    };
    reader.readAsText(file);
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
          Backup & Restore
        </h1>
        <p 
          className="text-sm opacity-70"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          Keep your wellness data safe
        </p>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          className="mb-6 rounded-[20px] p-4 flex items-center gap-3"
          style={{
            background: message.type === 'success' 
              ? 'rgba(168, 230, 207, 0.2)' 
              : 'rgba(255, 107, 157, 0.2)',
            border: `1px solid ${message.type === 'success' ? '#A8E6CF' : '#FF6B9D'}`
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} style={{ color: '#A8E6CF' }} />
          ) : (
            <AlertCircle size={20} style={{ color: '#FF6B9D' }} />
          )}
          <p 
            className="text-sm"
            style={{ color: 'var(--theme-text)', fontWeight: 600 }}
          >
            {message.text}
          </p>
        </motion.div>
      )}

      {/* Export Card */}
      <motion.div
        className="mb-4 rounded-[28px] p-6"
        style={{
          background: 'var(--theme-surface)',
          border: '1px solid var(--theme-accent)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-4 mb-4">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--theme-accent)', color: 'var(--theme-primary)' }}
          >
            <Download size={24} />
          </div>
          <div className="flex-1">
            <h3 
              className="text-lg mb-2"
              style={{ fontWeight: 700, color: 'var(--theme-text)' }}
            >
              Export Data
            </h3>
            <p 
              className="text-sm leading-relaxed mb-4"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              Download all your wellness data as a JSON file. Keep it safe as a backup or transfer to another device.
            </p>
            <button
              onClick={handleExport}
              className="w-full py-3 rounded-full text-sm transition-all active:scale-95"
              style={{
                background: 'var(--theme-primary)',
                color: 'var(--theme-secondary)',
                fontWeight: 700
              }}
            >
              Export My Data
            </button>
          </div>
        </div>
      </motion.div>

      {/* Restore Card */}
      <motion.div
        className="rounded-[28px] p-6"
        style={{
          background: 'var(--theme-surface)',
          border: '1px solid var(--theme-accent)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4 mb-4">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--theme-accent)', color: 'var(--theme-primary)' }}
          >
            <Upload size={24} />
          </div>
          <div className="flex-1">
            <h3 
              className="text-lg mb-2"
              style={{ fontWeight: 700, color: 'var(--theme-text)' }}
            >
              Restore Data
            </h3>
            <p 
              className="text-sm leading-relaxed mb-4"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              Import your wellness data from a previously exported backup file. This will replace all current data.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-full text-sm transition-all active:scale-95"
              style={{
                background: 'var(--theme-accent)',
                color: 'var(--theme-text)',
                fontWeight: 700
              }}
            >
              Choose File to Restore
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        className="mt-6 rounded-[24px] p-5"
        style={{
          background: 'var(--theme-surface)',
          border: '1px solid var(--theme-accent)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 
          className="text-sm mb-2 uppercase tracking-wider opacity-60"
          style={{ color: 'var(--theme-text)' }}
        >
          Privacy Note
        </h4>
        <p 
          className="text-sm leading-relaxed"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          Your data is stored locally on your device. Abantika does not collect or store any personal information on external servers. Always keep your backup files secure.
        </p>
      </motion.div>
    </div>
  );
}
