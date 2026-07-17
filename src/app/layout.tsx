import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeApplier } from "@/components/providers/theme-applier";
import { UndoProvider } from "@/components/providers/undo-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "abantikas companion in absence of Omkar",
  description:
    "A luxurious, private wellness companion for hydration, mood, cycle, journaling and mindful reminders. Help when I am not with her.",
  keywords: [
    "wellness",
    "hydration",
    "mood",
    "cycle tracker",
    "journal",
    "mindfulness",
  ],
  authors: [{ name: "omkar" }],
  applicationName: "Dear Abantika",
  generator: "Dear Abantika v6.0",
  other: { version: "6.0" },
  icons: {
    icon: "https://i.ibb.co/93tgkqKv/playstore-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF6F0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="linen">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <ThemeApplier>
          <UndoProvider>{children}</UndoProvider>
        </ThemeApplier>
        <Toaster />
      </body>
    </html>
  );
}
