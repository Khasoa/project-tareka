"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/directory", label: "Directory" },
  { href: "/wallet", label: "Wallet" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
] as const;

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden w-52 shrink-0 border-r border-border bg-nav-chrome text-nav-ink md:flex md:flex-col",
        className,
      )}
    >
      <div className="px-4 py-4 font-heading text-sm font-semibold tracking-wide text-nav-ink/90">
        App
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2 pb-4" aria-label="App navigation">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-nav-ink/75 transition hover:bg-white/5 hover:text-nav-ink",
                active && "bg-accent-cyan/15 text-accent-cyan",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
