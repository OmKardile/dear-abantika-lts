"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Palette,
  SlidersHorizontal,
  Database,
  Archive as ArchiveIcon,
  Plus,
  Check,
  Download,
  Upload,
  Shield,
  Heart,
  Trash2,
  Info,
  ArchiveRestore,
  Droplet,
  Sparkles,
  BookHeart,
  ShoppingBag,
  Type,
  Activity,
  Pill,
  CalendarDays,
  Stethoscope,
  CircleAlert,
  SunMoon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import {
  REMINDER_CATEGORIES,
  MEDICAL_DISCLAIMER,
  type Reminder,
  type CycleEntry,
  type JournalEntry,
  type WishlistItem,
  type AppSettings,
} from "@/lib/types";
import { formatTime, downloadJson, readJsonFile, isNativeApp } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {
  SurfaceCard,
  SectionHeader,
  IconBadge,
  EmptyState,
  StaggerItem,
  Pressable,
} from "@/components/premium/primitives";
import { ConfirmDialog } from "@/components/premium/confirm-dialog";
import { Portal } from "@/components/premium/portal";
import { toast } from "@/hooks/use-toast";

type Tab = "theme" | "appearance" | "backup" | "archive";

type FontSize = AppSettings["appearance"]["fontSize"];

export function Settings() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<Tab>("theme");

  const tabs: {
    id: Tab;
    label: string;
    short: string;
    icon: React.ComponentType<{ size?: number }>;
  }[] = [
    { id: "theme", label: "Theme", short: "Theme", icon: Palette },
    { id: "appearance", label: "Appearance", short: "Look", icon: SlidersHorizontal },
    { id: "backup", label: "Backup", short: "Backup", icon: Database },
    { id: "archive", label: "Archive", short: "Archive", icon: ArchiveIcon },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader title="Settings" subtitle="Make it yours" />
      </motion.div>

      {/* Tab switcher */}
      <div className="flex p-1 rounded-full surface-card">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative flex-1 flex items-center justify-center gap-1 py-2.5 font-semibold min-w-0"
            aria-pressed={tab === t.id}
          >
            {tab === t.id && (
              <motion.div
                layoutId="settings-tab"
                className="absolute inset-0 rounded-full gradient-primary-bg shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex items-center gap-1 min-w-0",
                tab === t.id ? "text-primary-foreground" : "text-text-secondary"
              )}
            >
              <t.icon size={14} />
              <span className="truncate text-[10px]">{t.short}</span>
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {tab === "theme" && <ThemeTab />}
          {tab === "appearance" && <AppearanceTab />}
          {tab === "backup" && <BackupTab />}
          {tab === "archive" && <ArchiveTab />}
        </motion.div>
      </AnimatePresence>

      {/* About */}
      <SurfaceCard className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <IconBadge icon={Info} variant="soft" size={40} />
          <div>
            <p className="text-title text-text-primary">About App</p>
            <p className="text-caption text-text-secondary">Dear Abantika ❤️ · Version 6.3 · LTS</p>
          </div>
        </div>
        <p className="text-body text-text-secondary leading-relaxed">
          A private wellness companion for my dear love Avantika Kardile.
          All data lives only on this device —
          nothing is ever sent anywhere. Crafted with care😚 & love💕 for her.
        </p>

        <div className="mt-4 italic flex items-center gap-1.5 text-caption text-text-tertiary">
          Made with <Heart size={12} className="text-primary" fill="currentColor" /> By <a target="_blank" href="https://omkardile-portfolio.vercel.app/" className="text-primary underline hover:opacity-70"> Omkar </a>
        </div>
      </SurfaceCard>
    </div>
  );
}

/* ============== SHARED UI ============== */
function ToggleSwitch({
  checked,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative w-12 h-7 rounded-full transition-colors shrink-0",
        checked
          ? "gradient-primary-bg"
          : "bg-surface-secondary border border-border",
        disabled && "opacity-50"
      )}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md",
          checked ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
  layoutId,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  layoutId: string;
}) {
  return (
    <div className="relative flex p-1 rounded-full surface-card">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="relative flex-1 flex items-center justify-center py-2 px-2 text-[12px] font-semibold min-w-0"
            aria-pressed={active}
          >
            {active && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full gradient-primary-bg shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={cn(
                "relative z-10 truncate",
                active ? "text-primary-foreground" : "text-text-secondary"
              )}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ============== THEME TAB ============== */
function ThemeTab() {
  const { theme, setTheme } = useStore();
  return (
    <div className="space-y-4">
      <p className="text-body text-text-secondary px-1">
        Choose a palette that feels like home, or omkars love. 😚😁👍
      </p>

      <div className="space-y-4">
        {THEMES.map((t, i) => {
          const active = theme === t.id;
          return (
            <StaggerItem key={t.id} index={i}>
              <Pressable
                onClick={() => setTheme(t.id)}
                className="w-full text-left"
              >
                <SurfaceCard
                  className={cn(
                    "relative overflow-hidden p-5 transition-all items-center",
                    active && "ring-2 ring-primary shadow-glow"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* mini device preview */}
                    <div
                      className="relative w-16 h-24 rounded-2xl overflow-hidden shrink-0 border"
                      style={{
                        backgroundColor: t.swatches[2],
                        borderColor: t.swatches[0] + "33",
                      }}
                    >
                      <div
                        className="absolute top-2 left-2 right-2 h-4 rounded-md"
                        style={{ backgroundColor: t.swatches[1] }}
                      />
                      <div
                        className="absolute top-8 left-2 right-2 h-6 rounded-lg"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${t.swatches[0]}, ${t.swatches[3]})`,
                        }}
                      />
                      <div className="absolute top-16 left-2 right-2 h-2 rounded-full" style={{ backgroundColor: t.swatches[1], opacity: 0.6 }} />
                      <div className="absolute top-20 left-2 w-8 h-2 rounded-full" style={{ backgroundColor: t.swatches[1], opacity: 0.4 }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.emoji}</span>
                        <p className="text-title text-text-primary">{t.name}</p>
                      </div>
                      <p className="text-caption text-text-secondary mt-0.5">
                        {t.tagline}
                      </p>
                      {/* swatches */}
                      <div className="flex gap-1.5 mt-2.5">
                        {t.swatches.map((s, idx) => (
                          <span
                            key={idx}
                            className="w-6 h-6 rounded-lg border border-border"
                            style={{ backgroundColor: s }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* active check */}
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="w-7 h-7 rounded-full gradient-primary-bg flex items-center justify-center shrink-0"
                        >
                          <Check size={16} className="text-primary-foreground" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </SurfaceCard>
              </Pressable>
            </StaggerItem>
          );
        })}
      </div>
    </div>
  );
}

/* ============== APPEARANCE TAB ============== */
function AppearanceTab() {
  const { settings, setAppearance, setPCOS } = useStore();
  const { appearance, pcos } = settings;

  const fontSizeClass: Record<FontSize, string> = {
    small: "text-[13px]",
    medium: "text-[15px]",
    large: "text-[17px]",
  };

  return (
    <div className="space-y-4">
      {/* Font size */}
      <StaggerItem index={0}>
        <SurfaceCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <IconBadge icon={Type} variant="soft" size={44} />
            <div className="min-w-0">
              <p className="text-title text-text-primary">Font size</p>
              <p className="text-caption text-text-secondary">
                Adjust text scale across the app
              </p>
            </div>
          </div>
          <SegmentedControl
            value={appearance.fontSize}
            layoutId="appearance-fontsize"
            onChange={(v) =>
              setAppearance({ fontSize: v as FontSize })
            }
            options={[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
          />
          {/* Preview */}
          <div className="mt-4 p-4 rounded-2xl bg-surface-secondary">
            <p className="text-label text-text-tertiary mb-1.5">Preview</p>
            <p
              className={cn(
                "text-text-primary leading-relaxed font-serif italic",
                fontSizeClass[appearance.fontSize]
              )}
            >
              The quiet rituals of a gentle morning — tea, light, a soft start.
            </p>
          </div>
        </SurfaceCard>
      </StaggerItem>

      {/* Dynamic colors */}
      <StaggerItem index={2}>
        <SurfaceCard className="p-5">
          <div className="flex items-start gap-3">
            <IconBadge icon={SunMoon} variant="soft" size={44} />
            <div className="flex-1 min-w-0">
              <p className="text-title text-text-primary">Dynamic colors</p>
              <p className="text-caption text-text-secondary mt-0.5 leading-relaxed">
                Adapt colors to your wallpaper (Material You).
              </p>
              <p className="text-label text-text-tertiary mt-1">Preview only</p>
            </div>
            <ToggleSwitch
              checked={appearance.dynamicColors}
              onChange={(v) => setAppearance({ dynamicColors: v })}
              aria-label="Toggle dynamic colors"
            />
          </div>
        </SurfaceCard>
      </StaggerItem>

      {/* PCOS Mode */}
      <StaggerItem index={3}>
        <SurfaceCard
          className={cn("p-5", pcos.enabled && "ring-1 ring-primary/30")}
        >
          <div className="flex items-start gap-3">
            <IconBadge icon={Activity} variant="soft" size={44} />
            <div className="flex-1 min-w-0">
              <p className="text-title text-text-primary">PCOS Mode</p>
              <p className="text-caption text-text-secondary mt-0.5 leading-relaxed">
                Enable PCOS-aware tracking with confidence-based predictions.
              </p>
            </div>
            <ToggleSwitch
              checked={pcos.enabled}
              onChange={(v) => setPCOS({ enabled: v })}
              aria-label="Toggle PCOS mode"
            />
          </div>

          <AnimatePresence initial={false}>
            {pcos.enabled && (
              <motion.div
                key="pcos-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-divider space-y-4">
                  {/* Cycle length override */}
                  <div>
                    <label className="text-caption text-text-secondary flex items-center gap-1.5 mb-1.5">
                      <CalendarDays size={13} /> Average cycle length (days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={pcos.cycleLengthAvg ?? ""}
                      onChange={(e) =>
                        setPCOS({
                          cycleLengthAvg: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="e.g. 35"
                      className="w-full rounded-2xl bg-surface-secondary border border-border p-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40"
                    />
                  </div>

                  {/* Diagnosed date */}
                  <div>
                    <label className="text-caption text-text-secondary flex items-center gap-1.5 mb-1.5">
                      <CalendarDays size={13} /> Diagnosed date
                    </label>
                    <input
                      type="date"
                      value={pcos.diagnosedDate ?? ""}
                      onChange={(e) =>
                        setPCOS({
                          diagnosedDate: e.target.value || undefined,
                        })
                      }
                      className="w-full rounded-2xl bg-surface-secondary border border-border p-3 text-body text-text-primary outline-none focus:border-primary/40"
                    />
                  </div>

                  {/* Insulin resistance */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary">
                    <div className="flex-1 min-w-0">
                      <p className="text-body text-text-primary font-semibold flex items-center gap-1.5">
                        <Pill size={14} /> Insulin resistance
                      </p>
                      <p className="text-label text-text-tertiary mt-0.5">
                        Affects cycle regularity & symptoms
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={!!pcos.insulinResistance}
                      onChange={(v) => setPCOS({ insulinResistance: v })}
                      aria-label="Toggle insulin resistance"
                    />
                  </div>

                  {/* Medications */}
                  <div>
                    <label className="text-caption text-text-secondary flex items-center gap-1.5 mb-1.5">
                      <Pill size={13} /> Medications & supplements
                    </label>
                    <textarea
                      rows={3}
                      value={pcos.medications ?? ""}
                      onChange={(e) =>
                        setPCOS({
                          medications: e.target.value || undefined,
                        })
                      }
                      placeholder="e.g. Metformin 500mg, Inositol, Vitamin D…"
                      className="w-full rounded-2xl bg-surface-secondary border border-border p-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40 resize-none"
                    />
                  </div>

                  {/* Doctor notes */}
                  <div>
                    <label className="text-caption text-text-secondary flex items-center gap-1.5 mb-1.5">
                      <Stethoscope size={13} /> Doctor notes
                    </label>
                    <textarea
                      rows={3}
                      value={pcos.doctorNotes ?? ""}
                      onChange={(e) =>
                        setPCOS({
                          doctorNotes: e.target.value || undefined,
                        })
                      }
                      placeholder="Notes from your healthcare provider…"
                      className="w-full rounded-2xl bg-surface-secondary border border-border p-3 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40 resize-none"
                    />
                  </div>

                  {/* Medical disclaimer */}
                  <div className="flex items-start gap-2 p-3 rounded-2xl bg-warning/10 border border-warning/20">
                    <CircleAlert
                      size={14}
                      className="text-warning mt-0.5 shrink-0"
                    />
                    <p className="text-label text-text-secondary leading-relaxed">
                      {MEDICAL_DISCLAIMER}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SurfaceCard>
      </StaggerItem>
    </div>
  );
}

/* ============== ARCHIVE TAB ============== */
function ArchiveTab() {
  const {
    cycleEntries,
    journalEntries,
    wishlistItems,
    reminders,
    archiveCycleEntry,
    deleteCycleEntry,
    archiveJournalEntry,
    deleteJournalEntry,
    archiveWishlistItem,
    deleteWishlistItem,
    archiveReminder,
    deleteReminder,
  } = useStore();

  const [confirmDelete, setConfirmDelete] = React.useState<{
    open: boolean;
    type: "cycle" | "journal" | "wishlist" | "reminder";
    id: string;
  } | null>(null);
  const [confirmEmptyAll, setConfirmEmptyAll] = React.useState(false);

  const archivedCycles = cycleEntries.filter((e) => e.archived);
  const archivedJournals = journalEntries.filter((e) => e.archived);
  const archivedWishlist = wishlistItems.filter((e) => e.archived);
  const archivedReminders = reminders.filter((e) => e.archived);

  const sections = [
    { type: "cycle" as const, label: "Cycle entries", emoji: "🌸", items: archivedCycles },
    { type: "journal" as const, label: "Journal entries", emoji: "📔", items: archivedJournals },
    { type: "wishlist" as const, label: "Wishlist items", emoji: "🛍️", items: archivedWishlist },
    { type: "reminder" as const, label: "Reminders", emoji: "🔔", items: archivedReminders },
  ].filter((s) => s.items.length > 0);

  const totalCount =
    archivedCycles.length +
    archivedJournals.length +
    archivedWishlist.length +
    archivedReminders.length;

  const handleRestore = (
    type: "cycle" | "journal" | "wishlist" | "reminder",
    id: string
  ) => {
    switch (type) {
      case "cycle":
        archiveCycleEntry(id, false);
        break;
      case "journal":
        archiveJournalEntry(id, false);
        break;
      case "wishlist":
        archiveWishlistItem(id, false);
        break;
      case "reminder":
        archiveReminder(id, false);
        break;
    }
    toast({ title: "Restored" });
  };

  const handlePermanentDelete = (
    type: "cycle" | "journal" | "wishlist" | "reminder",
    id: string
  ) => {
    setConfirmDelete({ open: true, type, id });
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    switch (type) {
      case "cycle":
        deleteCycleEntry(id);
        break;
      case "journal":
        deleteJournalEntry(id);
        break;
      case "wishlist":
        deleteWishlistItem(id);
        break;
      case "reminder":
        deleteReminder(id);
        break;
    }
    setConfirmDelete(null);
    toast({ title: "Permanently deleted" });
  };

  const handleEmptyAll = () => {
    setConfirmEmptyAll(true);
  };

  const confirmEmptyAllAction = () => {
    archivedCycles.forEach((e) => deleteCycleEntry(e.id));
    archivedJournals.forEach((e) => deleteJournalEntry(e.id));
    archivedWishlist.forEach((e) => deleteWishlistItem(e.id));
    archivedReminders.forEach((e) => deleteReminder(e.id));
    setConfirmEmptyAll(false);
    toast({ title: "Archive emptied" });
  };

  if (totalCount === 0) {
    return (
      <EmptyState
        emoji="🗂️"
        title="Nothing archived"
        description="Archived items rest here until you restore or delete them."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-body text-text-secondary">
          {totalCount} archived {totalCount === 1 ? "item" : "items"}
        </p>
      </div>

      {sections.map((section, sIdx) => (
        <StaggerItem key={section.type} index={sIdx}>
          <SurfaceCard className="p-5">
            <SectionHeader
              title={section.label}
              subtitle={`${section.items.length} archived`}
              className="mb-4"
            />
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {section.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ArchivedItemRow
                      type={section.type}
                      item={item}
                      onRestore={() => handleRestore(section.type, item.id)}
                      onDelete={() =>
                        handlePermanentDelete(section.type, item.id)
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SurfaceCard>
        </StaggerItem>
      ))}

      {/* Empty archive button */}
      <StaggerItem index={sections.length}>
        <SurfaceCard className="p-5 border-error/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-error/10 flex items-center justify-center">
              <Trash2 size={18} className="text-error" />
            </div>
            <div>
              <p className="text-title text-text-primary">Empty archive</p>
              <p className="text-caption text-text-secondary">
                Permanently delete all {totalCount} archived items
              </p>
            </div>
          </div>
          <Pressable
            onClick={handleEmptyAll}
            className="w-full py-3 rounded-2xl border border-error/30 text-error text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Empty archive
          </Pressable>
        </SurfaceCard>
      </StaggerItem>

      {/* Confirm single permanent delete */}
      <Portal>
        <ConfirmDialog
          open={!!confirmDelete}
          onOpenChange={(v) => {
            if (!v) setConfirmDelete(null);
          }}
          title="Delete permanently?"
          description="This item will be gone for good. This cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={confirmDeleteAction}
        />
      </Portal>

      {/* Confirm empty all */}
      <Portal>
        <ConfirmDialog
          open={confirmEmptyAll}
          onOpenChange={setConfirmEmptyAll}
          title={`Delete all ${totalCount} archived items?`}
          description="This will permanently remove every archived item across your app. This cannot be undone."
          confirmLabel="Empty archive"
          variant="destructive"
          onConfirm={confirmEmptyAllAction}
        />
      </Portal>
    </div>
  );
}

function ArchivedItemRow({
  type,
  item,
  onRestore,
  onDelete,
}: {
  type: "cycle" | "journal" | "wishlist" | "reminder";
  item: CycleEntry | JournalEntry | WishlistItem | Reminder;
  onRestore: () => void;
  onDelete: () => void;
}) {
  // Derive title/description and archived-ago text per type
  let title = "";
  let subtitle = "";
  let emoji = "";
  let icon: React.ComponentType<{ size?: number; className?: string }> = Sparkles;

  const archivedAt =
    (item as { archivedAt?: string }).archivedAt ??
    (item as { date?: string }).date ??
    "";

  if (type === "cycle") {
    const e = item as CycleEntry;
    title = e.date;
    subtitle = e.isPeriod
      ? `Period · ${e.flow ?? "light"} flow`
      : e.symptoms.length > 0
      ? `${e.symptoms.length} symptom${e.symptoms.length === 1 ? "" : "s"}`
      : "Symptoms only";
    emoji = "🌸";
    icon = Droplet;
  } else if (type === "journal") {
    const e = item as JournalEntry;
    title = e.title;
    subtitle = e.reflection.slice(0, 60) + (e.reflection.length > 60 ? "…" : "");
    emoji = "📔";
    icon = BookHeart;
  } else if (type === "wishlist") {
    const e = item as WishlistItem;
    title = e.title;
    subtitle = e.description || "No description";
    emoji = "🛍️";
    icon = ShoppingBag;
  } else {
    const e = item as Reminder;
    title = e.title;
    subtitle = `${formatTime(e.time)} · ${
      REMINDER_CATEGORIES.find((c) => c.id === e.category)?.label ?? "Reminder"
    }`;
    emoji = "🔔";
    icon = Bell;
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary">
      <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-xl shrink-0">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body text-text-primary font-semibold truncate">
          {title}
        </p>
        <p className="text-caption text-text-secondary truncate mt-0.5">
          {subtitle}
        </p>
        <p className="text-label text-text-tertiary mt-1">
          archived {archivedAt ? archivedAgo(archivedAt) : "earlier"}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <Pressable
          onClick={onRestore}
          className="px-3 py-1.5 rounded-xl bg-surface border border-border text-primary text-caption font-semibold flex items-center gap-1"
        >
          <ArchiveRestore size={13} />
          Restore
        </Pressable>
        <Pressable
          onClick={onDelete}
          className="px-3 py-1.5 rounded-xl border border-error/30 text-error text-caption font-semibold flex items-center gap-1"
        >
          <Trash2 size={13} />
          Delete
        </Pressable>
      </div>
    </div>
  );
}

function archivedAgo(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = now - then;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return "1d ago";
    if (d < 7) return `${d}d ago`;
    const w = Math.floor(d / 7);
    if (w === 1) return "1w ago";
    if (w < 5) return `${w}w ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return "earlier";
  }
}

/* ============== BACKUP TAB ============== */
function BackupTab() {
  const { exportData, importData, resetAll } = useStore();
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState("");
  const [exporting, setExporting] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [backupData, setBackupData] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const doExport = async () => {
    setExporting(true);
    try {
      const data = exportData();
      const filename = `abantika-backup-${new Date().toISOString().split("T")[0]}.json`;
      const result = await downloadJson(data, filename);

      if (!result.success) {
        // Share failed or user cancelled — show the copy modal so they still get their data
        setBackupData(data);
        toast({
          title: "Backup ready to copy",
          description: "Copy your backup below, or share it.",
        });
      } else if (result.method === "share" || result.method === "share-text") {
        toast({
          title: "Backup shared",
          description: "Save it to Files or send it somewhere safe.",
        });
      } else if (result.method === "clipboard") {
        toast({
          title: "Backup copied",
          description: "JSON copied to clipboard — paste into a notes app to save.",
        });
      } else {
        // "download" — web browser only, file was saved
        toast({
          title: "Backup exported",
          description: "Your data has been saved.",
        });
      }
    } catch {
      toast({
        title: "Export failed",
        description: "Something went wrong. Try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const copyBackup = async () => {
    if (!backupData) return;
    try {
      await navigator.clipboard.writeText(backupData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Paste into a notes app to save." });
    } catch {
      // Fallback: select the textarea
      const ta = document.querySelector('[data-backup-textarea]') as HTMLTextAreaElement;
      if (ta) {
        ta.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Copied!", description: "Paste into a notes app to save." });
      }
    }
  };

  const shareBackupText = async () => {
    if (!backupData) return;
    try {
      if (navigator.share) {
        await navigator.share({ text: backupData, title: "Abantika Backup" });
      } else {
        copyBackup();
      }
    } catch {
      // user cancelled — ignore
    }
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readJsonFile(file);
      const ok = importData(text);
      if (ok) {
        toast({ title: "Backup restored", description: "Welcome back." });
        setImportOpen(false);
        setImportText("");
      } else {
        toast({
          title: "Import failed",
          description: "That file doesn't look like a valid backup.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Import failed",
        description: "Could not read that file.",
        variant: "destructive",
      });
    }
    // reset input so the same file can be picked again
    e.target.value = "";
  };

  const doImportPaste = () => {
    const ok = importData(importText);
    if (ok) {
      toast({ title: "Backup restored", description: "Welcome back." });
      setImportOpen(false);
      setImportText("");
    } else {
      toast({
        title: "Import failed",
        description: "That doesn't look like a valid backup.",
        variant: "destructive",
      });
    }
  };

  const doReset = () => {
    setConfirmReset(true);
  };

  const confirmResetAction = () => {
    resetAll();
    setConfirmReset(false);
    toast({ title: "Data reset", description: "Starting fresh." });
  };

  return (
    <div className="space-y-4">
      {/* hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFilePick}
        className="hidden"
        aria-hidden
      />

      {/* Privacy banner */}
      <SurfaceCard className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
          <Shield size={18} className="text-success" />
        </div>
        <div>
          <p className="text-title text-text-primary">Private by design</p>
          <p className="text-caption text-text-secondary mt-0.5 leading-relaxed">
            Everything stays on this device. No accounts, no servers, no tracking.
          </p>
        </div>
      </SurfaceCard>

      {/* Export */}
      <StaggerItem index={0}>
        <SurfaceCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <IconBadge icon={Download} variant="solid" size={44} />
            <div>
              <p className="text-title text-text-primary">Export backup</p>
              <p className="text-caption text-text-secondary">
                Save a JSON file of all your data
              </p>
            </div>
          </div>
          <Pressable
            onClick={doExport}
            disabled={exporting}
            className="w-full py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Download size={16} />
            {exporting ? "Preparing…" : "Download backup"}
          </Pressable>
        </SurfaceCard>
      </StaggerItem>

      {/* Import */}
      <StaggerItem index={1}>
        <SurfaceCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <IconBadge icon={Upload} variant="soft" size={44} />
            <div>
              <p className="text-title text-text-primary">Restore backup</p>
              <p className="text-caption text-text-secondary">
                Choose a file or paste JSON
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Pressable
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              Choose file
            </Pressable>
            <Pressable
              onClick={() => setImportOpen(true)}
              className="flex-1 py-3 rounded-2xl bg-surface-secondary text-text-primary text-sm font-semibold border border-border flex items-center justify-center gap-2"
            >
              Paste JSON
            </Pressable>
          </div>
        </SurfaceCard>
      </StaggerItem>

      {/* Danger zone */}
      <StaggerItem index={2}>
        <SurfaceCard className="p-5 border-error/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-error/10 flex items-center justify-center">
              <Trash2 size={18} className="text-error" />
            </div>
            <div>
              <p className="text-title text-text-primary">Reset everything</p>
              <p className="text-caption text-text-secondary">
                Permanently clear all your data
              </p>
            </div>
          </div>
          <Pressable
            onClick={doReset}
            className="w-full py-3 rounded-2xl border border-error/30 text-error text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Reset all data
          </Pressable>
        </SurfaceCard>
      </StaggerItem>

      {/* Import dialog — portaled to body so it sits above the nav */}
      <Portal>
        <AnimatePresence>
          {importOpen && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-md"
                onClick={() => setImportOpen(false)}
              />
              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className="relative w-full max-w-md rounded-[28px] glass-sheet p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-label text-text-tertiary">Restore</p>
                    <h2 className="text-headline-serif text-text-primary">Paste JSON</h2>
                  </div>
                  <button
                    onClick={() => setImportOpen(false)}
                    className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center"
                    aria-label="Close"
                  >
                    <Plus size={18} className="rotate-45 text-text-secondary" />
                  </button>
                </div>
                <p className="text-caption text-text-secondary mb-3">
                  Paste your backup JSON below, or close this and use{" "}
                  <span className="font-semibold text-primary">Choose file</span>.
                </p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={6}
                  placeholder='{"hydration": …}'
                  className="w-full rounded-2xl bg-surface-secondary border border-border p-4 text-caption font-mono text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary/40 resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setImportOpen(false)}
                    className="flex-1 py-3 rounded-2xl bg-surface-secondary text-text-primary text-sm font-semibold border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={doImportPaste}
                    disabled={!importText.trim()}
                    className="flex-1 py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow disabled:opacity-50"
                  >
                    Restore
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      {/* Reset confirmation — portaled */}
      <Portal>
        <ConfirmDialog
          open={confirmReset}
          onOpenChange={setConfirmReset}
          title="Reset all data?"
          description="This permanently deletes every entry, log, and reminder on this device. Export a backup first if you want to keep it. This cannot be undone."
          confirmLabel="Reset everything"
          cancelLabel="Keep my data"
          variant="destructive"
          onConfirm={confirmResetAction}
        />
      </Portal>

      {/* Backup data modal — shown when download fails (Android WebView) */}
      <Portal>
        <AnimatePresence>
          {backupData !== null && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-md"
                onClick={() => setBackupData(null)}
              />
              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className="relative w-full max-w-md max-h-[80dvh] flex flex-col rounded-[28px] glass-sheet p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-label text-text-tertiary">Your backup</p>
                    <h2 className="text-headline-serif text-text-primary">Copy & save</h2>
                  </div>
                  <button
                    onClick={() => setBackupData(null)}
                    className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center"
                    aria-label="Close"
                  >
                    <Plus size={18} className="rotate-45 text-text-secondary" />
                  </button>
                </div>
                <p className="text-caption text-text-secondary mb-3">
                  Tap "Copy" then paste into a notes app, or tap "Share" to send it elsewhere.
                </p>
                <textarea
                  data-backup-textarea
                  readOnly
                  value={backupData}
                  rows={8}
                  className="w-full flex-1 min-h-0 rounded-2xl bg-surface-secondary border border-border p-3 text-[11px] font-mono text-text-primary outline-none resize-none scroll-area mb-3"
                />
                <div className="flex gap-2">
                  <Pressable
                    onClick={shareBackupText}
                    className="flex-1 py-3 rounded-2xl bg-surface-secondary text-text-primary text-sm font-semibold border border-border flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    Share
                  </Pressable>
                  <Pressable
                    onClick={copyBackup}
                    className="flex-1 py-3 rounded-2xl gradient-primary-bg text-primary-foreground text-sm font-bold shadow-glow flex items-center justify-center gap-2"
                  >
                    <Check size={16} className={copied ? "opacity-100" : "opacity-0"} />
                    {copied ? "Copied!" : "Copy"}
                  </Pressable>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}

