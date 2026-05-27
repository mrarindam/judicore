import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 pt-4 px-4">
      <div className="max-w-6xl mx-auto rounded-2xl border border-white/[0.06] bg-ink-950/55 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3">
          <Link href="/" className="group flex items-center gap-3">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-violet via-brand-indigo to-brand-fuchsia shadow-[0_0_24px_-4px_rgba(139,92,246,0.6)]">
              {/* Scales/justice glyph as SVG */}
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v18" />
                <path d="M5 7h14" />
                <path d="M5 7l-3 7a4 4 0 0 0 8 0L7 7" />
                <path d="M19 7l-3 7a4 4 0 0 0 8 0l-3-7" />
                <path d="M8 21h8" />
              </svg>
              <span aria-hidden className="absolute inset-0 rounded-xl ring-1 ring-white/15" />
            </span>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight text-white">Judicore</div>
              <div className="text-[10.5px] uppercase tracking-[0.18em] text-white/45">Somnia · AI Jury</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm text-white/65">
            <NavItem href="/#how">How it works</NavItem>
            <NavItem href="/#panel">The panel</NavItem>
            <NavItem href="/#cases">Cases</NavItem>
          </nav>

          <div id="connect-slot" className="flex items-center gap-2" />
        </div>
      </div>
    </header>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/[0.06] hover:text-white"
    >
      {children}
    </Link>
  );
}
