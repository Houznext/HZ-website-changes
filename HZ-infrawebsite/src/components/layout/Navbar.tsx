import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDown, Eye, Heart, LogIn, LogOut, Menu as MenuIcon, MessageCircle, Plus, User, X } from 'lucide-react';
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

const profileMenuClass =
  'absolute right-0 z-[300] mt-2 w-[17.5rem] origin-top-right rounded-2xl border border-border bg-white p-2 shadow-xl focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:duration-100 data-[leave]:ease-in';

function profileRowClass(focus: boolean) {
  return clsx(
    'flex w-full items-center gap-3 rounded-xl px-2 py-2.5 font-inter text-[13px] font-medium text-charcoal',
    focus && 'bg-hz-blue-light text-hz-blue',
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  useEffect(() => setMounted(true), []);
  const authed = mounted && status === 'authenticated' && session?.user;

  return (
    <header className="sticky top-0 z-[200] border-b border-white/5 bg-navy shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mx-auto grid h-16 max-w-infra grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:gap-6 md:px-7">
        <div className="flex min-w-0 items-center justify-start">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Houznext home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Houznext Logo.png"
              alt="Houznext"
              className="h-[26px] w-auto md:h-8"
              style={{ objectFit: 'contain' }}
            />
            <span className="rounded bg-hz-blue px-1.5 py-0.5 font-montserrat text-[8px] font-bold uppercase tracking-widest text-white">
              Infra
            </span>
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-0.5 px-6 sm:px-10 md:px-14 lg:flex">
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
            href="/about"
            className="rounded-lg px-3 py-1.5 font-inter text-[13px] font-medium text-white/70 hover:bg-white/[0.07] hover:text-white"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/sell"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 font-montserrat text-[13px] font-bold text-navy shadow-sm transition hover:bg-white/95 active:scale-[0.98] sm:px-5"
          >
            <Plus className="h-4 w-4 shrink-0 text-navy" strokeWidth={2.5} aria-hidden />
            <span>List property</span>
          </Link>

          <Menu as="div" className="relative shrink-0">
            <MenuButton
              type="button"
              disabled={status === 'loading'}
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/[0.08] text-white shadow-inner transition hover:border-white/50 hover:bg-white/[0.12] disabled:cursor-wait disabled:opacity-50',
              )}
              aria-label={authed ? 'Account menu' : 'Account — sign in'}
            >
              <User className="h-5 w-5" strokeWidth={2} aria-hidden />
            </MenuButton>
            <MenuItems className={profileMenuClass}>
              {authed && (
                <div className="mb-1 border-b border-border px-2 pb-2">
                  <p className="font-inter text-[11px] font-medium text-muted">Signed in</p>
                  <p className="truncate font-inter text-xs font-semibold text-charcoal">
                    {session.user?.name || session.user?.email || 'Account'}
                  </p>
                </div>
              )}
              {!authed ? (
                <MenuItem>
                  {({ focus }) => (
                    <Link href="/login" className={profileRowClass(focus)}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <LogIn className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </span>
                      Login / Sign up
                    </Link>
                  )}
                </MenuItem>
              ) : (
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      className={profileRowClass(focus)}
                      onClick={() => {
                        if (typeof window !== 'undefined') localStorage.removeItem('infra_token');
                        void signOut({ callbackUrl: '/' });
                      }}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                        <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </span>
                      Sign out
                    </button>
                  )}
                </MenuItem>
              )}
              <MenuItem>
                {({ focus }) => (
                  <Link
                    href={authed ? '/profile?tab=saved' : '/login?callbackUrl=%2Fprofile%3Ftab%3Dsaved'}
                    className={profileRowClass(focus)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-orange-600">
                      <Heart className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                    Saved properties
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <Link
                    href={authed ? '/profile?tab=seen' : '/login?callbackUrl=%2Fprofile%3Ftab%3Dseen'}
                    className={profileRowClass(focus)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                    Seen properties
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <Link
                    href={authed ? '/profile?tab=enq' : '/login?callbackUrl=%2Fprofile%3Ftab%3Denq'}
                    className={profileRowClass(focus)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                    My enquiries
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <Link
                    href={authed ? '/profile' : '/login?callbackUrl=/profile'}
                    className={profileRowClass(focus)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                      <User className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                    My profile
                  </Link>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>

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
            <Link
              href={authed ? '/profile?tab=saved' : '/login?callbackUrl=%2Fprofile%3Ftab%3Dsaved'}
              onClick={() => setOpen(false)}
            >
              Saved properties
            </Link>
            <Link
              href={authed ? '/profile?tab=seen' : '/login?callbackUrl=%2Fprofile%3Ftab%3Dseen'}
              onClick={() => setOpen(false)}
            >
              Seen properties
            </Link>
            <Link
              href={authed ? '/profile?tab=enq' : '/login?callbackUrl=%2Fprofile%3Ftab%3Denq'}
              onClick={() => setOpen(false)}
            >
              My enquiries
            </Link>
            <Link href={authed ? '/profile' : '/login?callbackUrl=/profile'} onClick={() => setOpen(false)}>
              My profile
            </Link>
            {!authed ? (
              <Link href="/login" onClick={() => setOpen(false)} className="font-semibold text-white">
                Login / Sign up
              </Link>
            ) : (
              <button
                type="button"
                className="text-left font-semibold text-white/90"
                onClick={() => {
                  setOpen(false);
                  if (typeof window !== 'undefined') localStorage.removeItem('infra_token');
                  void signOut({ callbackUrl: '/' });
                }}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
      <div className="h-0.5 w-full bg-gradient-to-r from-hz-blue via-hz-accent to-hz-blue" />
    </header>
  );
}
