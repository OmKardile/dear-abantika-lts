import { motion } from 'motion/react';
import { useWellness } from '../contexts/WellnessContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

export function CycleAnalytics() {
  const { cycleEntries } = useWellness();

  // Calculate cycle statistics
  const periodEntries = cycleEntries
    .filter(e => e.isPeriod)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const cycleLengths: number[] = [];
  for (let i = 1; i < periodEntries.length; i++) {
    const days = Math.floor(
      (new Date(periodEntries[i].date).getTime() - new Date(periodEntries[i - 1].date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    cycleLengths.push(days);
  }

  const averageLength = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : 28;

  const minLength = cycleLengths.length > 0 ? Math.min(...cycleLengths) : 0;
  const maxLength = cycleLengths.length > 0 ? Math.max(...cycleLengths) : 0;

  // Symptom frequency
  const symptomCounts: Record<string, number> = {};
  cycleEntries.forEach(entry => {
    entry.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const topSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Next period estimate
  const lastPeriod = periodEntries[periodEntries.length - 1];
  const nextPeriodEstimate = lastPeriod
    ? new Date(new Date(lastPeriod.date).getTime() + averageLength * 24 * 60 * 60 * 1000)
    : null;

  const daysUntilNext = nextPeriodEstimate
    ? Math.max(0, Math.floor((nextPeriodEstimate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-6">
      {/* Cycle History Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StatCard
          label="Average"
          value={`${averageLength} days`}
        />
        <StatCard
          label="Range"
          value={cycleLengths.length > 0 ? `${minLength}-${maxLength}` : 'N/A'}
        />
        <StatCard
          label="Tracked"
          value={`${periodEntries.length} cycles`}
        />
      </motion.div>

      {/* Next Period Estimate */}
      {nextPeriodEstimate && (
        <motion.div
          className="rounded-[24px] p-6"
          style={{
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-accent)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 
            className="text-sm mb-3 uppercase tracking-wider opacity-60"
            style={{ color: 'var(--theme-text)' }}
          >
            Estimated Next Period
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-3xl mb-1"
                style={{ fontWeight: 700, color: 'var(--theme-primary)' }}
              >
                {daysUntilNext} days
              </p>
              <p 
                className="text-sm opacity-60"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {nextPeriodEstimate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Symptom Frequency */}
      {topSymptoms.length > 0 && (
        <motion.div
          className="rounded-[24px] p-6"
          style={{
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-accent)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 
            className="text-sm mb-4 uppercase tracking-wider opacity-60"
            style={{ color: 'var(--theme-text)' }}
          >
            Most Common Symptoms
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSymptoms}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: 'var(--theme-text-secondary)' }}
                  tickFormatter={(value) => value.slice(0, 8)}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'var(--theme-text-secondary)' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                >
                  {topSymptoms.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="var(--theme-primary)"
                      opacity={1 - (index * 0.15)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Cycle Length History */}
      {cycleLengths.length > 0 && (
        <motion.div
          className="rounded-[24px] p-6"
          style={{
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-accent)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 
            className="text-sm mb-4 uppercase tracking-wider opacity-60"
            style={{ color: 'var(--theme-text)' }}
          >
            Cycle Length History
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleLengths.map((length, i) => ({ 
                cycle: `C${i + 1}`, 
                length 
              }))}>
                <XAxis 
                  dataKey="cycle" 
                  tick={{ fontSize: 11, fill: 'var(--theme-text-secondary)' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'var(--theme-text-secondary)' }}
                  domain={[20, 35]}
                />
                <Bar 
                  dataKey="length" 
                  fill="var(--theme-primary)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {periodEntries.length === 0 && (
        <motion.div
          className="rounded-[24px] p-8 text-center"
          style={{
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-accent)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p 
            className="text-sm opacity-70"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Start tracking your cycle to see analytics and insights
          </p>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div 
      className="rounded-[20px] p-4 text-center"
      style={{
        background: 'var(--theme-surface)',
        border: '1px solid var(--theme-accent)'
      }}
    >
      <p 
        className="text-xs mb-1 opacity-60"
        style={{ color: 'var(--theme-text)' }}
      >
        {label}
      </p>
      <p 
        className="text-lg"
        style={{ fontWeight: 700, color: 'var(--theme-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}
