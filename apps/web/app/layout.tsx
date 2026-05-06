import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// DM Sans: geometric humanist, clean and modern — used as the reliable
// fallback. Satoshi (loaded via CSS @import from Fontshare) is the
// primary heading font when available.
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "tareka",
  description:
    "Track recycling. Prove impact. Every verified drop-off counts towards your impact record and appreciation tokens where applicable.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
