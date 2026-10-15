'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme, PrismoraLogo } from '@prismora/ui';
import {
  Sun,
  Moon,
  Menu,
  X,
  Compass,
  Atom,
  Zap,
  Cpu,
  FlaskConical,
  Binary,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Explore', href: '/explore', icon: Compass, color: '#2563EB' },
    { label: 'Labs', href: '/labs', icon: FlaskConical, color: '#22C55E' },
    { label: 'ECE Lab', href: '/experiments/ece', icon: Cpu, color: '#06B6D4' },
    { label: 'Physics', href: '/experiments/projectile-motion', icon: Atom, color: '#2563EB' },
    { label: 'COA RISC-V', href: '/experiments/coa', icon: Zap, color: '#06B6D4' },
    { label: 'TOC Automata', href: '/experiments/toc', icon: Binary, color: '#8B5CF6' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0B1120] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Official Prismora Logo Lockup */}
        <Link href="/" className="flex items-center gap-3 group">
          <PrismoraLogo variant="full" size="md" />
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[#2563EB] dark:text-[#38BDF8] border border-zinc-200 dark:border-zinc-700">
            v0.1
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/explore' && pathname === '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#172033] text-white dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: isActive ? '#FFFFFF' : item.color }}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FBBF24]" /> : <Moon className="w-4 h-4 text-[#2563EB]" />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0B1120] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold ${
                  isActive
                    ? 'bg-[#172033] text-white dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: item.color }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
