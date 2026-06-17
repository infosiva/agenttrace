'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#0e7490,#22d3ee)', boxShadow: '0 3px 12px rgba(34,211,238,0.3)' }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 8 L5 5 L8 9 L11 4 L14 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="14" cy="8" r="1.5" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <span className="font-bold text-xl">Agent<span style={{ color: '#22d3ee' }}>Trace</span></span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/traces"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Traces
            </Link>
            <Link
              href="/integrations"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Integrations
            </Link>
            <Link
              href="/pricing"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Docs
            </Link>
            <Link
              href="https://github.com/agenttrace/agenttrace"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <nav className="container py-4 space-y-3">
            <Link
              href="/traces"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Traces
            </Link>
            <Link
              href="/integrations"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Integrations
            </Link>
            <Link
              href="/pricing"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </Link>
            <div className="pt-3 space-y-2">
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
