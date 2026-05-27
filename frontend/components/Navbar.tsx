"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ConnectButton } from "@/components/ConnectButton";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Disputes", href: "/disputes" },
  { label: "Docs", href: "/docs" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b pointer-events-none ${
        scrolled
          ? "border-line bg-elev/85 backdrop-blur-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] py-3"
          : "border-transparent bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex items-center justify-between gap-2 px-4 sm:px-6 md:px-8 w-full pointer-events-none">
        <Link href="/" className="group flex items-center gap-2.5 pr-2 pointer-events-auto">
          <LogoMark />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-[14px] font-semibold tracking-tight text-fg">Judicore</span>
            <span className="mono-label text-faint">AI · Court · OS</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 text-sm pointer-events-auto">
          {NAV_ITEMS.map((it) => {
            const active = isActive(pathname, it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`relative px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                  active ? "text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, rgba(76,201,255,0.18) 0%, rgba(139,92,246,0.18) 100%)",
                      border: "1px solid rgba(76,201,255,0.30)",
                      boxShadow: "0 0 16px -4px rgba(76,201,255,0.4)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {mounted && <ThemeToggle />}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function LogoMark() {
  return (
    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-[12px] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #4CC9FF 0%, #8B5CF6 100%)",
        boxShadow: "0 0 24px -4px rgba(76,201,255,0.6), 0 0 24px -4px rgba(139,92,246,0.4)",
      }}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white relative z-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v18" />
        <path d="M5 7h14" />
        <path d="M5 7l-3 7a4 4 0 0 0 8 0L7 7" />
        <path d="M19 7l-3 7a4 4 0 0 0 8 0l-3-7" />
        <path d="M8 21h8" />
      </svg>
      <span aria-hidden className="absolute inset-0 rounded-[12px] ring-1 ring-white/30" />
    </span>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isLight = theme === "light";
  return (
    <button
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      className="relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-line bg-elev hover:border-electric/40 transition-colors cursor-pointer"
    >
      {isLight ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-fg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-fg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}
