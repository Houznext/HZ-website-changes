import Link from 'next/link';
import { useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDown, Menu as MenuIcon, X } from 'lucide-react';
import { clsx } from 'clsx';

const buyLinks = [
  { href: '/buy?type=Land', label: 'Land' },
  { href: '/buy?type=Villa', label: 'Villa' },
  { href: '/buy?type=Apartment', label: 'Apartment' },
  { href: '/buy?type=Plot', label: 'Plot' },
];

const toolsLinks = [
  { href: '/emi-calculator', label: 'EMI Calculator' },
  { href: '/property-insights', label: 'Property Insights' },
  { href: '/value-calculator', label: 'Value Calculator' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[200] border-b border-white/5 bg-navy shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mx-auto flex h-16 max-w-infra items-center gap-3 px-4 md:px-7">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-montserrat text-lg font-extrabold tracking-tight text-white">
          Houznext<span className="text-hz-accent">Infra</span>
          <span className="rounded bg-hz-blue px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white">
            Beta
          </span>
        </Link>

        <nav className="ml-1 hidden flex-1 items-center gap-0.5 lg:flex">
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-1 rounded-lg px-3 py-1.5 font-inter text-[13px] font-medium text-white/70 hover:bg-white/[0.07] hover:text-white data-[open]:bg-hz-blue/20 data-[open]:text-white">
              Buy <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </MenuButton>
            <MenuItems className="absolute left-0 mt-2 min-w-[220px] rounded-2xl border border-border bg-hzwhite p-1.5 shadow-xl focus:outline-none">
              {buyLinks.map((l) => (
                <MenuItem key={l.href}>
                  {({ focus }) => (
                    <Link
                      href={l.href}
                      className={clsx(
                        'block rounded-lg px-3 py-2 font-inter text-[13px] text-charcoal',
                        focus && 'bg-hz-blue-light text-hz-blue',
                      )}
                    >
                      {l.label}
                    </Link>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>

          <Link
            href="/sell"
            className="rounded-lg px-3 py-1.5 font-inter text-[13px] font-medium text-white/70 hover:bg-white/[0.07] hover:text-white"
          >
            Sell
          </Link>
          <Link
            href="/projects"
            className="rounded-lg px-3 py-1.5 font-inter text-[13px] font-medium text-white/70 hover:bg-white/[0.07] hover:text-white"
          >
            Projects
          </Link>

          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-1 rounded-lg px-3 py-1.5 font-inter text-[13px] font-medium text-white/70 hover:bg-white/[0.07] hover:text-white data-[open]:bg-hz-blue/20 data-[open]:text-white">
              Tools <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </MenuButton>
            <MenuItems className="absolute left-0 mt-2 min-w-[220px] rounded-2xl border border-border bg-hzwhite p-1.5 shadow-xl focus:outline-none">
              {toolsLinks.map((l) => (
                <MenuItem key={l.href}>
                  {({ focus }) => (
                    <Link
                      href={l.href}
                      className={clsx(
                        'block rounded-lg px-3 py-2 font-inter text-[13px] text-charcoal',
                        focus && 'bg-hz-blue-light text-hz-blue',
                      )}
                    >
                      {l.label}
                    </Link>
                  )}
                </MenuItem>
              ))}
              <MenuItem>
                {({ focus }) => (
                  <Link
                    href="/services"
                    className={clsx(
                      'block rounded-lg px-3 py-2 font-inter text-[13px] text-charcoal',
                      focus && 'bg-hz-blue-light text-hz-blue',
                    )}
                  >
                    Services overview
                  </Link>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>

          <Link
            href="/news"
            className="rounded-lg px-3 py-1.5 font-inter text-[13px] font-medium text-white/70 hover:bg-white/[0.07] hover:text-white"
          >
            News
          </Link>
          <Link
            href="/developers"
            className="rounded-lg px-3 py-1.5 font-inter text-[13px] font-medium text-white/70 hover:bg-white/[0.07] hover:text-white"
          >
            Developers
          </Link>
          <Link
            href="/about"
            className="rounded-lg px-3 py-1.5 font-inter text-[13px] font-medium text-white/70 hover:bg-white/[0.07] hover:text-white"
          >
            About
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-1.5 font-inter text-[13px] font-medium text-white/80 hover:text-white sm:block"
          >
            Login
          </Link>
          <Link
            href="/profile"
            className="hidden rounded-lg px-3 py-1.5 font-inter text-[13px] font-medium text-white/80 hover:text-white md:block"
          >
            Profile
          </Link>
          <Link
            href="/sell"
            className="rounded-lg bg-hz-accent px-4 py-1.5 font-montserrat text-xs font-bold text-white transition hover:brightness-95"
          >
            List property
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-white lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-2 font-inter text-sm text-white/80">
            <Link href="/buy" onClick={() => setOpen(false)}>
              Buy
            </Link>
            <Link href="/sell" onClick={() => setOpen(false)}>
              Sell
            </Link>
            <Link href="/projects" onClick={() => setOpen(false)}>
              Projects
            </Link>
            <Link href="/emi-calculator" onClick={() => setOpen(false)}>
              EMI Calculator
            </Link>
            <Link href="/login" onClick={() => setOpen(false)}>
              Login
            </Link>
          </div>
        </div>
      )}
      <div className="h-0.5 w-full bg-gradient-to-r from-hz-blue via-hz-accent to-hz-blue" />
    </header>
  );
}
