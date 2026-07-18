import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Dr_Sugiyama, Great_Vibes, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeApplier } from "@/components/providers/theme-applier";
import { UndoProvider } from "@/components/providers/undo-provider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistSans = localfont({
//   src: "../../public/fonts/SF-Pro-Rounded-Regular.otf",
//   variable: "--font-geist-sans",
// });

const geistSans = localFont({
  src: "../fonts/SF-Pro-Rounded-Regular.otf",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Dr_Sugiyama({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: "400",
});
// const playfair = Playfair_Display({
//   variable: "--font-playfair",
//   subsets: ["latin"],
//   weight: ["500", "600", "700"],
//   style: ["normal", "italic"],
// });

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
  generator: "Dear Abantika v6.3 LTS",
  other: { version: "6.3" },
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
