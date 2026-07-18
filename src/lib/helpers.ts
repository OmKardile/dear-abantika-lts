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
  if (typeof cap.isNativePlatform === "function") return cap.isNativePlatform();
  if (cap.platform) return cap.platform !== "web";
  return false;
}

/**
 * Export backup JSON.
 * On Capacitor native (Android/iOS): writes a temp file with Filesystem plugin,
 * then shares it via @capacitor/share (native Android share sheet — very reliable).
 * On web: tries blob download → Web Share API → clipboard.
 */
export async function downloadJson(
  data: string,
  filename: string
): Promise<{ method: string; success: boolean }> {
  // === Capacitor native (Android/iOS) ===
  if (isNativeApp()) {
    try {
      // Dynamically import so web builds don't bundle native plugins
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");

      // Write temp file to app's Cache directory
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: data,
        directory: Directory.Cache,
        encoding: "utf8" as any,
      });

      // Share the file via native share sheet
      await Share.share({
        title: "Dear Abantika Backup",
        files: [writeResult.uri],
        dialogTitle: "Save your backup",
      });

      // Clean up temp file after sharing
      try {
        await Filesystem.deleteFile({
          path: filename,
          directory: Directory.Cache,
        });
      } catch {
        // cleanup is best-effort
      }

      return { method: "native-share", success: true };
    } catch (e) {
      // Share failed or user cancelled
      if (e && typeof e === "object" && "message" in e) {
        const msg = (e as Error).message;
        if (msg.includes("canceled") || msg.includes("cancelled") || msg.includes("User")) {
          return { method: "native-share", success: false };
        }
      }
      // Fall through to web methods as fallback
    }
    // If native share failed, return failure so the Copy modal shows
    return { method: "native-fail", success: false };
  }

  // === Web browser ===
  // 1. Blob download
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

  // 2. Web Share API
  try {
    if (navigator.canShare && navigator.share) {
      const file = new File([data], filename, { type: "application/json" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Abantika Backup" });
        return { method: "share", success: true };
      }
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      return { method: "share", success: false };
    }
  }

  // 3. Clipboard
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

/**
 * Native file picker for import — uses Capacitor FilePicker on native,
 * falls back to <input type="file"> on web.
 * Returns the file contents as a string.
 */
export async function pickBackupFile(): Promise<string | null> {
  if (isNativeApp()) {
    try {
      // Try @capawesome/capacitor-file-picker (registered as FilePicker in logcat)
      const FilePicker = (window as any).Capacitor?.Plugins?.FilePicker
        || (window as any).FilePicker;
      if (FilePicker) {
        const result = await FilePicker.pickFiles({
          types: ["application/json", "text/plain"],
          readData: true,
        });
        if (result?.files?.[0]?.data) {
          // Base64 decoded
          const b64 = result.files[0].data;
          return atob(b64);
        }
        if (result?.files?.[0]?.path) {
          // Read via Filesystem
          const { Filesystem, Directory } = await import("@capacitor/filesystem");
          const path = result.files[0].path;
          const readResult = await Filesystem.readFile({ path });
          if (typeof readResult.data === "string") return readResult.data;
          // Blob
          return await readResult.data.text();
        }
      }
    } catch {
      // fall through to web picker
    }
  }

  // Web: use hidden <input type="file">
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const text = await readJsonFile(file);
        resolve(text);
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}
