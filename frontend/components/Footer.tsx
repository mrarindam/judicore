"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-line bg-elev/30 backdrop-blur-md mt-24">
      {/* Background radial highlight */}
      <div aria-hidden className="absolute -bottom-40 right-10 h-[360px] w-[360px] rounded-full -z-10 opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.12), transparent)" }} />
      <div aria-hidden className="absolute -bottom-40 left-10 h-[300px] w-[300px] rounded-full -z-10 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(76,201,255,0.1), transparent)" }} />

      <div className="container-edge pt-16 sm:pt-20 pb-6 sm:pb-8 max-w-[1480px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Column 1: Brand details */}
          <div className="lg:col-span-4 flex flex-col items-start gap-4">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-[12px] overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #4CC9FF 0%, #8B5CF6 100%)",
                  boxShadow: "0 0 24px -4px rgba(76,201,255,0.4), 0 0 24px -4px rgba(139,92,246,0.3)",
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
              <span className="text-[16px] font-semibold tracking-tight text-fg">Judicore</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-sm mt-2">
              Sub-second autonomous arbitration and onchain settlement for the agentic civilization.
              Decentralized juror committees on Somnia L1 executing in parallel.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <SocialIcon href="https://github.com" label="Github">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </SocialIcon>
              <SocialIcon href="https://twitter.com" label="Twitter">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </SocialIcon>
              <SocialIcon href="https://discord.com" label="Discord">
                <path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8Z" />
                <circle cx="8" cy="12" r="1" />
                <circle cx="14" cy="12" r="1" />
              </SocialIcon>
            </div>
          </div>

          {/* Column 2: Protocol Platform */}
          <div className="md:col-span-1 lg:col-span-2 flex flex-col gap-4">
            <h4 className="mono-label text-fg text-xs font-semibold tracking-wider">Protocol</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><FooterLink href="/disputes">File Dispute</FooterLink></li>
              <li><FooterLink href="/disputes">Active Cases</FooterLink></li>
              <li><FooterLink href="/docs">System Architecture</FooterLink></li>
              <li><FooterLink href="/docs#contracts">Smart Contracts</FooterLink></li>
            </ul>
          </div>

          {/* Column 3: Legal & Proofs */}
          <div className="md:col-span-1 lg:col-span-3 flex flex-col gap-4">
            <h4 className="mono-label text-fg text-xs font-semibold tracking-wider">Legal & Compliance</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><FooterLink href="#terms" onClick={() => alert("Terms & Conditions: Judicore executes onchain settlements autonomously based on decentralized parallel validator inference. By submitting cases, parties acknowledge that outcomes are finalized directly by EscrowVault state machines.")}>Terms of Service</FooterLink></li>
              <li><FooterLink href="#privacy" onClick={() => alert("Privacy Policy: All information, evidence hash files, and validator signatures submitted to Judicore are stored immutably on IPFS and the Somnia blockchain and are public records.")}>Privacy Policy</FooterLink></li>
              <li><FooterLink href="/docs">Validator Receipts</FooterLink></li>
              <li><FooterLink href="/docs">SLA Parameters</FooterLink></li>
            </ul>
          </div>

          {/* Column 4: About & Contact Us */}
          <div className="md:col-span-1 lg:col-span-3 flex flex-col gap-4">
            <h4 className="mono-label text-fg text-xs font-semibold tracking-wider">Contact & Developer</h4>
            <div className="flex flex-col gap-3 text-sm">
              <p className="text-muted leading-relaxed">
                Built for the <span className="text-fg font-medium">Somnia Agentathon</span>. 
                Creating the decentralized justice infrastructure for Autonomous Agents.
              </p>
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center gap-2 text-fg font-medium">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-electric" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>hello@judicore.io</span>
                </div>
                <div className="flex items-center gap-2 text-muted hover:text-fg transition-colors">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-violet" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Arindam · Core Developer</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Separator line */}
        <hr className="hr-soft mt-16 mb-8" />

        {/* Bottom copyright segment */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-faint">
            <span>&copy; {new Date().getFullYear()} Judicore. All rights reserved.</span>
            <span>·</span>
            <span>Verifiable receipts on Somnia Agentic L1.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted">
            <Link href="#terms" className="hover:text-fg transition-colors">Terms</Link>
            <Link href="#privacy" className="hover:text-fg transition-colors">Privacy</Link>
            <span className="text-faint">v1.0.0-beta</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

function FooterLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  if (onClick) {
    return (
      <button onClick={onClick} className="text-muted hover:text-fg transition-colors text-left focus:outline-none cursor-pointer">
        {children}
      </button>
    );
  }
  return (
    <Link href={href} className="text-muted hover:text-fg transition-colors">
      {children}
    </Link>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-elev hover:border-electric/40 hover:text-fg transition-all text-muted cursor-pointer"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </a>
  );
}
