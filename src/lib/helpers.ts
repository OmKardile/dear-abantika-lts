export { cn } from "./utils";

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function dateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Resting hours, ( Bubu tum kahan ho?😭😿 )";
  if (h < 12) return "Gul Molnin,Uth gya bacha?💕";
  if (h < 17) return "Good afternoon babu💕";
  if (h < 21) return "Good evening golmatol rasmalai💕";
  return "Good night mela Gulgulu pulpulu💕";
}

export function greetingSub(): string {
  const h = new Date().getHours();
  if (h < 5) return "Hope you're sleeping soundly. 🤗";
  if (h < 12) return "A soft start to your day. Nahake send pic !!";
  if (h < 17) return "Take a breath, you're doing well. Sojao Thoda😗";
  if (h < 21) return "Time to unwind a little. Padhai deko 🫡";
  return "Be gentle with yourself tonight. ily babu💕";
}

export function formatTime(time: string): string {
  // "08:00" -> "8:00 AM"
  const [hStr, m] = time.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function timeUntil(time: string): string {
  const now = new Date();
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours === 0) return `in ${mins}m`;
  if (mins === 0) return `in ${hours}h`;
  return `in ${hours}h ${mins}m`;
}

/** Check if running inside Capacitor native (Android/iOS) */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as any).Capacitor;
  if (!cap) return false;
  // Capacitor v6: use isNativePlatform() or check platform
  if (typeof cap.isNativePlatform === "function") return cap.isNativePlatform();
  if (cap.platform) return cap.platform !== "web";
  return false;
}

export async function downloadJson(
  data: string,
  filename: string
): Promise<{ method: string; success: boolean }> {
  // On Capacitor native (Android/iOS), blob download silently fails.
  // Try Web Share API first; if that fails, return failure so caller shows the copy modal.
  if (isNativeApp()) {
    try {
      if (navigator.share) {
        // Try sharing as text first (more reliable than file sharing in WebView)
        await navigator.share({
          text: data,
          title: "Abantika Backup",
        });
        return { method: "share-text", success: true };
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        return { method: "share-text", success: false };
      }
    }
    // Try file share
    try {
      if (navigator.canShare && navigator.share) {
        const file = new File([data], filename, { type: "application/json" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Abantika Backup",
          });
          return { method: "share", success: true };
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        return { method: "share", success: false };
      }
    }
    // All share methods failed on native — return failure so caller shows copy modal
    return { method: "native-fail", success: false };
  }

  // === Web browser (not native) ===
  // 1. Try blob download — works on desktop & mobile browsers
  try {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    await new Promise((r) => setTimeout(r, 300));
    return { method: "download", success: true };
  } catch {
    // fall through
  }

  // 2. Try Web Share API
  try {
    if (navigator.canShare && navigator.share) {
      const file = new File([data], filename, { type: "application/json" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Abantika Backup",
        });
        return { method: "share", success: true };
      }
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      return { method: "share", success: false };
    }
  }

  // 3. Last resort: clipboard
  try {
    await navigator.clipboard.writeText(data);
    return { method: "clipboard", success: true };
  } catch {
    return { method: "clipboard", success: false };
  }
}

/** Read a JSON file from an <input type="file"> as text. */
export function readJsonFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}
