"use client";

import type { ReactNode } from "react";

import { AppTopbar } from "./app-topbar";
import { Sidebar } from "@/components/sidebar";

// Inner app shell — light mode by default (:root).
// AppTopbar replaces the marketing Navbar and provides Sign out.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppTopbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden bg-canvas px-4 py-3 sm:px-5 sm:py-4 lg:px-7 lg:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
