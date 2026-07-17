"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Droplet,
  Activity,
  Scale,
  Thermometer,
  Pill,
  StickyNote,
  Moon,
  Heart,
  Smile,
  Droplets,
  Leaf,
  CircleDot,
  Wind,
} from "lucide-react";
import { SYMPTOMS, MOODS, type CycleEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/premium/portal";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: string; // YYYY-MM-DD
  existing?: CycleEntry;
  onSave: (entry: Omit<CycleEntry, "id">) => void;
  onDelete?: (id: string) => void;
  pcosEnabled?: boolean;
}

const FLOWS = [
  { id: "spotting", label: "Spotting", color: "#F4C2D2" },
  { id: "light", label: "Light", color: "#F0A8B8" },
  { id: "medium", label: "Medium", color: "#E0758A" },
  { id: "heavy", label: "Heavy", color: "#C04960" },
] as const;

const LIBIDO_OPTIONS: {
  id: CycleEntry["libido"];
  label: string;
  emoji: string;
}[] = [
  { id: "low", label: "Low", emoji: "🌙" },
  { id: "normal", label: "Normal", emoji: "💫" },
  { id: "high", label: "High", emoji: "🔥" },
];

// Pain scale emoji zones: 😌 0-2, 😟 3-5, 😣 6-8, 😭 9-10
const PAIN_ZONES = [
  { max: 2, emoji: "😌", label: "Mild" },
  { max: 5, emoji: "😟", label: "Moderate" },
  { max: 8, emoji: "😣", label: "Strong" },
  { max: 10, emoji: "😭", label: "Severe" },
] as const;

function painEmoji(v: number) {
  return PAIN_ZONES.find((z) => v <= z.max)?.emoji ?? "😭";
}

export function CycleEntryForm({
  open,
  onOpenChange,
  date,
  existing,
  onSave,
  onDelete,
  pcosEnabled,
}: Props) {
  const [isPeriod, setIsPeriod] = React.useState(existing?.isPeriod ?? false);
  const [flow, setFlow] = React.useState<CycleEntry["flow"]>(existing?.flow);
  const [symptoms, setSymptoms] = React.useState<string[]>(
    existing?.symptoms ?? []
  );
  const [weight, setWeight] = React.useState(
    existing?.weight?.toString() ?? ""
  );
  const [bbt, setBbt] = React.useState(existing?.bbt?.toString() ?? "");
  const [medication, setMedication] = React.useState(
    existing?.medication ?? ""
  );
  const [notes, setNotes] = React.useState(existing?.notes ?? "");
  // v5.0 expanded fields
  const [painScale, setPainScale] = React.useState<number>(
    existing?.painScale ?? 0
  );
  const [sleepHours, setSleepHours] = React.useState(
    existing?.sleepHours?.toString() ?? ""
  );
  const [moodTag, setMoodTag] = React.useState<string | undefined>(
    existing?.moodTag
  );
  const [libido, setLibido] = React.useState<CycleEntry["libido"]>(
    existing?.libido
  );
  const [discharge, setDischarge] = React.useState(existing?.discharge ?? "");
  const [supplements, setSupplements] = React.useState(
    existing?.supplements ?? ""
  );
  const [clots, setClots] = React.useState(existing?.clots ?? false);
  const [bowelChanges, setBowelChanges] = React.useState(
    existing?.bowelChanges ?? false
  );
  const [isSpotting, setIsSpotting] = React.useState(
    existing?.isSpotting ?? false
  );
  const [isBreakthrough, setIsBreakthrough] = React.useState(
    existing?.isBreakthrough ?? false
  );

  React.useEffect(() => {
    if (open) {
      setIsPeriod(existing?.isPeriod ?? false);
      setFlow(existing?.flow);
      setSymptoms(existing?.symptoms ?? []);
      setWeight(existing?.weight?.toString() ?? "");
      setBbt(existing?.bbt?.toString() ?? "");
      setMedication(existing?.medication ?? "");
      setNotes(existing?.notes ?? "");
      setPainScale(existing?.painScale ?? 0);
      setSleepHours(existing?.sleepHours?.toString() ?? "");
      setMoodTag(existing?.moodTag);
      setLibido(existing?.libido);
      setDischarge(existing?.discharge ?? "");
      setSupplements(existing?.supplements ?? "");
      setClots(existing?.clots ?? false);
      setBowelChanges(existing?.bowelChanges ?? false);
      setIsSpotting(existing?.isSpotting ?? false);
      setIsBreakthrough(existing?.isBreakthrough ?? false);
    }
  }, [open, existing]);

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const save = () => {
    onSave({
      date,
      isPeriod,
      flow: isPeriod ? flow : undefined,
      symptoms,
      weight: weight ? Number(weight) : undefined,
      bbt: bbt ? Number(bbt) : undefined,
      medication: medication || undefined,
      notes: notes || undefined,
      painScale,
      sleepHours: sleepHours ? Number(sleepHours) : undefined,
      moodTag,
      libido,
      discharge: discharge || undefined,
      supplements: supplements || undefined,
      clots: clots || undefined,
      bowelChanges: bowelChanges || undefined,
      isSpotting: isSpotting || undefined,
      isBreakthrough: isBreakthrough || undefined,
    });
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <Portal>
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-md"
              onClick={() => onOpenChange(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto no-scrollbar rounded-[32px] glass-sheet"
            >
              {/* drag handle */}
              <div className="sticky top-0 z-10 pt-3 pb-2 bg-transparent">
                <div className="mx-auto w-10 h-1.5 rounded-full bg-border" />
                <div className="flex items-center justify-between px-6 pt-3">
                  <div>
                    <p className="text-label text-text-tertiary">
                      {existing ? "Edit entry" : "New entry"}
                    </p>
                    <h2 className="text-headline text-text-primary">
                      Cycle check-in
                    </h2>
                  </div>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center"
                    aria-label="Close"
                  >
                    <X size={18} className="text-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-8 pt-3 space-y-6">
                {/* Period toggle */}
                <div className="rounded-[22px] bg-surface-secondary p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl gradient-primary-bg flex items-center justify-center">
                        <Droplet
                          size={18}
                          className="text-primary-foreground"
                        />
                      </div>
                      <div>
                        <p className="text-title text-text-primary">
                          Period day
                        </p>
                        <p className="text-caption text-text-secondary">
                          Is this a flow day?
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPeriod((v) => !v)}
                      className={cn(
                        "relative w-14 h-8 rounded-full transition-colors",
                        isPeriod ? "gradient-primary-bg" : "bg-border"
                      )}
                      aria-pressed={isPeriod}
                    >
                      <motion.span
                        layout
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className={cn(
                          "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md",
                          isPeriod ? "left-7" : "left-1"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Flow intensity (now 4 options incl. spotting) */}
                <AnimatePresence>
                  {isPeriod && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-label text-text-tertiary mb-3">
                        Flow intensity
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {FLOWS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() =>
                              setFlow(f.id as CycleEntry["flow"])
                            }
                            className={cn(
                              "rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center gap-1.5",
                              flow === f.id
                                ? "border-primary bg-surface"
                                : "border-border bg-surface"
                            )}
                          >
                            <span
                              className="w-5 h-5 rounded-full"
                              style={{ backgroundColor: f.color }}
                            />
                            <span className="text-[10px] font-semibold text-text-primary leading-none">
                              {f.label}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* PCOS indicators */}
                      {pcosEnabled && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <MiniToggle
                            active={isSpotting}
                            onClick={() => setIsSpotting((v) => !v)}
                            label="Spotting"
                            icon={Droplets}
                          />
                          <MiniToggle
                            active={isBreakthrough}
                            onClick={() => setIsBreakthrough((v) => !v)}
                            label="Breakthrough"
                            icon={CircleDot}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pain scale slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity size={15} className="text-text-tertiary" />
                      <p className="text-label text-text-tertiary">
                        Pain scale
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl leading-none">
                        {painEmoji(painScale)}
                      </span>
                      <span className="text-title text-text-primary font-bold tabular-nums">
                        {painScale}
                      </span>
                      <span className="text-caption text-text-tertiary">
                        /10
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={painScale}
                    onChange={(e) => setPainScale(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer pain-range"
                    style={{ accentColor: "var(--primary)" }}
                    aria-label="Pain scale"
                  />
                  <div className="flex justify-between mt-2 px-0.5">
                    {PAIN_ZONES.map((z, idx) => {
                      const activeIdx = PAIN_ZONES.findIndex(
                        (zz) => painScale <= zz.max
                      );
                      const active = activeIdx === idx;
                      return (
                        <span
                          key={z.label}
                          className={cn(
                            "text-[10px] font-medium transition-colors",
                            active
                              ? "text-text-primary"
                              : "text-text-tertiary"
                          )}
                        >
                          {z.emoji} {z.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Symptoms (30 v5.0) */}
                <div>
                  <p className="text-label text-text-tertiary mb-3">
                    Symptoms · {symptoms.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS.map((s) => {
                      const active = symptoms.includes(s);
                      return (
                        <motion.button
                          key={s}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => toggleSymptom(s)}
                          className={cn(
                            "px-3.5 py-2 rounded-full text-sm font-medium border transition-colors",
                            active
                              ? "gradient-primary-bg text-primary-foreground border-transparent shadow-glow"
                              : "bg-surface text-text-secondary border-border"
                          )}
                        >
                          {s}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Metrics: weight + BBT */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricField
                    icon={Scale}
                    label="Weight (kg)"
                    value={weight}
                    onChange={setWeight}
                    placeholder="—"
                  />
                  <MetricField
                    icon={Thermometer}
                    label="BBT (°C)"
                    value={bbt}
                    onChange={setBbt}
                    placeholder="—"
                  />
                </div>

                {/* Sleep + Mood */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricField
                    icon={Moon}
                    label="Sleep (hrs)"
                    value={sleepHours}
                    onChange={setSleepHours}
                    placeholder="0-12"
                    inputMode="numeric"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Smile
                        size={15}
                        className="text-text-tertiary"
                      />
                      <p className="text-label text-text-tertiary">Mood</p>
                    </div>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
                      {MOODS.map((m) => (
                        <button
                          key={m}
                          onClick={() =>
                            setMoodTag((prev) => (prev === m ? undefined : m))
                          }
                          className={cn(
                            "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all",
                            moodTag === m
                              ? "gradient-primary-bg scale-110 shadow-glow"
                              : "bg-surface-secondary hover:bg-surface"
                          )}
                          aria-pressed={moodTag === m}
                          aria-label={`Mood ${m}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Libido segmented control */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={15} className="text-text-tertiary" />
                    <p className="text-label text-text-tertiary">Libido</p>
                  </div>
                  <div className="flex p-1 rounded-2xl bg-surface-secondary">
                    {LIBIDO_OPTIONS.map((o) => {
                      const active = libido === o.id;
                      return (
                        <button
                          key={o.id}
                          onClick={() =>
                            setLibido((prev) => (prev === o.id ? undefined : o.id))
                          }
                          className={cn(
                            "relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-colors",
                            active
                              ? "gradient-primary-bg text-primary-foreground shadow-glow"
                              : "text-text-secondary"
                          )}
                          aria-pressed={active}
                        >
                          <span className="text-base leading-none">
                            {o.emoji}
                          </span>
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Discharge + Supplements */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricField
                    icon={Droplets}
                    label="Discharge"
                    value={discharge}
                    onChange={setDischarge}
                    placeholder="optional"
                  />
                  <MetricField
                    icon={Leaf}
                    label="Supplements"
                    value={supplements}
                    onChange={setSupplements}
                    placeholder="e.g. Inositol"
                  />
                </div>

                {/* Toggle chips: clots + bowel changes */}
                <div className="grid grid-cols-2 gap-2">
                  <MiniToggle
                    active={clots}
                    onClick={() => setClots((v) => !v)}
                    label="Clots"
                    icon={CircleDot}
                  />
                  <MiniToggle
                    active={bowelChanges}
                    onClick={() => setBowelChanges((v) => !v)}
                    label="Bowel changes"
                    icon={Wind}
                  />
                </div>

                {/* Medication */}
                <MetricField
                  icon={Pill}
                  label="Medication"
                  value={medication}
                  onChange={setMedication}
                  placeholder="e.g. Iron supplement"
                />

                {/* Notes */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote size={15} className="text-text-tertiary" />
                    <p className="text-label text-text-tertiary">
                      Private notes
                    </p>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Anything you'd like to remember…"
                    className="w-full rounded-2xl bg-surface-secondary border border-border p-4 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  {existing && onDelete && (
                    <button
                      onClick={() => {
                        onDelete(existing.id);
                        onOpenChange(false);
                      }}
                      className="px-5 py-3.5 rounded-2xl border border-error/30 text-error text-sm font-semibold"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={save}
                    className="flex-1 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow"
                  >
                    {existing ? "Save changes" : "Add entry"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

function MetricField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  inputMode = "decimal",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "decimal" | "numeric" | "text";
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className="text-text-tertiary" />
        <p className="text-label text-text-tertiary">{label}</p>
      </div>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-surface-secondary border border-border px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40"
      />
    </div>
  );
}

function MiniToggle({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 transition-all text-sm font-semibold",
        active
          ? "border-primary bg-surface text-primary shadow-glow"
          : "border-border bg-surface text-text-secondary"
      )}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}
