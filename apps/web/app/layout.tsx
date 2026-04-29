import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "tareka",
  description: "Track recycling. Prove impact. Earn rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={["dark", "hybrid", "light"]}
          enableSystem={false}
          storageKey="tareka-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
