import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { useWellness } from '../contexts/WellnessContext';

const flowLevels = ['Light', 'Medium', 'Heavy'];
const symptomOptions = [
  'Cramps', 'Bloating', 'Acne', 'Fatigue', 'Headache', 'Mood Swings',
  'Sugar Cravings', 'Hair Thinning', 'Hirsutism', 'Sleep Issues', 
  'Skin Darkening'
];

interface CycleEntryFormProps {
  date: Date;
  onClose: () => void;
}

export function CycleEntryForm({ date, onClose }: CycleEntryFormProps) {
  const { cycleEntries, addCycleEntry, updateCycleEntry } = useWellness();
  const existingEntry = cycleEntries.find(e => 
    new Date(e.date).toDateString() === date.toDateString()
  );

  const [isPeriod, setIsPeriod] = useState(existingEntry?.isPeriod || false);
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy' | undefined>(
    existingEntry?.flow
  );
  const [symptoms, setSymptoms] = useState<string[]>(existingEntry?.symptoms || []);
  const [weight, setWeight] = useState(existingEntry?.weight?.toString() || '');
  const [bbt, setBbt] = useState(existingEntry?.bbt?.toString() || '');
  const [medication, setMedication] = useState(existingEntry?.medication || '');
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = () => {
    const entry = {
      date: date.toISOString(),
      isPeriod,
      flow: isPeriod ? flow : undefined,
      symptoms,
      weight: weight ? parseFloat(weight) : undefined,
      bbt: bbt ? parseFloat(bbt) : undefined,
      medication: medication || undefined,
      notes: notes || undefined,
    };

    if (existingEntry) {
      updateCycleEntry(existingEntry.id, entry);
    } else {
      addCycleEntry(entry);
    }
    onClose();
  };

  return (
    <motion.div
      className="rounded-[28px] p-6 space-y-6"
      style={{
        background: 'var(--theme-surface)',
        border: '1px solid var(--theme-accent)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 
          className="text-xl"
          style={{ fontWeight: 700, color: 'var(--theme-text)' }}
        >
          {format(date, 'MMMM d, yyyy')}
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'var(--theme-accent)', color: 'var(--theme-text)' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Period Toggle */}
      <div>
        <label className="flex items-center justify-between cursor-pointer">
          <span 
            className="text-sm"
            style={{ color: 'var(--theme-text)', fontWeight: 600 }}
          >
            Period Day
          </span>
          <div
            onClick={() => setIsPeriod(!isPeriod)}
            className="relative w-14 h-8 rounded-full transition-all cursor-pointer"
            style={{
              background: isPeriod ? 'var(--theme-primary)' : 'var(--theme-accent)'
            }}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 rounded-full"
              style={{ background: 'var(--theme-secondary)' }}
              animate={{ left: isPeriod ? 'calc(100% - 28px)' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </label>
      </div>

      {/* Flow Level */}
      {isPeriod && (
        <div>
          <label 
            className="block text-sm mb-3"
            style={{ color: 'var(--theme-text)', fontWeight: 600 }}
          >
            Flow Level
          </label>
          <div className="flex gap-2">
            {flowLevels.map((level) => (
              <button
                key={level}
                onClick={() => setFlow(level.toLowerCase() as any)}
                className="flex-1 py-2 px-4 rounded-full text-sm transition-all"
                style={{
                  background: flow === level.toLowerCase() 
                    ? 'var(--theme-primary)' 
                    : 'var(--theme-accent)',
                  color: flow === level.toLowerCase() 
                    ? 'var(--theme-secondary)' 
                    : 'var(--theme-text)',
                  fontWeight: 600
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms */}
      <div>
        <label 
          className="block text-sm mb-3"
          style={{ color: 'var(--theme-text)', fontWeight: 600 }}
        >
          Symptoms
        </label>
        <div className="flex flex-wrap gap-2">
          {symptomOptions.map((symptom) => (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              className="py-2 px-4 rounded-full text-xs transition-all"
              style={{
                background: symptoms.includes(symptom) 
                  ? 'var(--theme-primary)' 
                  : 'var(--theme-accent)',
                color: symptoms.includes(symptom) 
                  ? 'var(--theme-secondary)' 
                  : 'var(--theme-text)',
                fontWeight: 600
              }}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label 
            className="block text-xs mb-2 opacity-70"
            style={{ color: 'var(--theme-text)' }}
          >
            Weight (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Optional"
            className="w-full py-2 px-4 rounded-2xl text-sm"
            style={{
              background: 'var(--theme-accent)',
              color: 'var(--theme-text)',
              border: 'none',
              outline: 'none'
            }}
          />
        </div>
        <div>
          <label 
            className="block text-xs mb-2 opacity-70"
            style={{ color: 'var(--theme-text)' }}
          >
            BBT (°C)
          </label>
          <input
            type="number"
            step="0.1"
            value={bbt}
            onChange={(e) => setBbt(e.target.value)}
            placeholder="Optional"
            className="w-full py-2 px-4 rounded-2xl text-sm"
            style={{
              background: 'var(--theme-accent)',
              color: 'var(--theme-text)',
              border: 'none',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div>
        <label 
          className="block text-xs mb-2 opacity-70"
          style={{ color: 'var(--theme-text)' }}
        >
          Medication
        </label>
        <input
          type="text"
          value={medication}
          onChange={(e) => setMedication(e.target.value)}
          placeholder="Optional"
          className="w-full py-2 px-4 rounded-2xl text-sm"
          style={{
            background: 'var(--theme-accent)',
            color: 'var(--theme-text)',
            border: 'none',
            outline: 'none'
          }}
        />
      </div>

      <div>
        <label 
          className="block text-xs mb-2 opacity-70"
          style={{ color: 'var(--theme-text)' }}
        >
          Private Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling today?"
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

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-4 rounded-full text-sm transition-all active:scale-95"
        style={{
          background: 'var(--theme-primary)',
          color: 'var(--theme-secondary)',
          fontWeight: 700
        }}
      >
        Save Entry
      </button>
    </motion.div>
  );
}
