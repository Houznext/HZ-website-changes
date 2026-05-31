import type { ReactNode } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  ChevronDown,
  Eye,
  Heart,
  Home,
  Landmark,
  LogIn,
  LogOut,
  Menu as MenuIcon,
  MessageCircle,
  Newspaper,
  Plus,
  User,
  Wrench,
  X,
} from 'lucide-react';
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

function DrawerIcon({
  children,
  bg,
}: {
  children: ReactNode;
  bg: string;
}) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      style={{ background: bg }}
    >
      {children}
    </span>
  );
}

function DrawerItem({
  href,
  onClick,
  icon,
  iconBg,
  children,
}: {
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  iconBg: string;
  children: ReactNode;
}) {
  const className =
    'flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left font-inter text-[13.5px] font-medium text-white/75 transition active:bg-white/[0.06]';
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        <DrawerIcon bg={iconBg}>{icon}</DrawerIcon>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      <DrawerIcon bg={iconBg}>{icon}</DrawerIcon>
      {children}
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  useEffect(() => setMounted(true), []);
  const authed = mounted && status === 'authenticated' && session?.user;

  const closeDrawer = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-[200] border-b border-white/5 bg-navy shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mx-auto flex h-14 w-full max-w-infra items-center justify-between gap-3 px-4 md:h-16 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6 lg:px-7">
        <div className="flex min-w-0 shrink-0 items-center">
          <Link href="/" className="flex shrink-0 items-center gap-1.5 lg:gap-2" aria-label="Houznext home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Houznext Logo.png"
              alt="Houznext"
              className="h-[22px] w-auto md:h-7 lg:h-8"
              style={{ objectFit: 'contain' }}
            />
            <span className="rounded bg-hz-blue px-1 py-0.5 font-montserrat text-[7.5px] font-bold uppercase tracking-widest text-white lg:px-1.5 lg:text-[8px]">
              Infra
            </span>
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-0.5 px-6 lg:flex lg:px-14">
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

        <div className="flex shrink-0 items-center justify-end gap-2 lg:col-start-3 lg:gap-3">
          {/* List property — desktop / tablet landscape only */}
          <Link
            href="/sell"
            className="hidden min-h-[40px] items-center gap-2 rounded-full bg-white px-4 py-2 font-montserrat text-[13px] font-bold text-navy shadow-sm transition hover:bg-white/95 active:scale-[0.98] md:inline-flex"
          >
            <Plus className="h-4 w-4 shrink-0 text-navy" strokeWidth={2.5} aria-hidden />
            <span className="whitespace-nowrap">List property</span>
          </Link>

          {/* Profile menu — desktop only */}
          <Menu as="div" className="relative hidden shrink-0 lg:block">
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

          {/* Unified mobile menu button */}
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg border border-white/[0.18] bg-white/10 px-3 font-montserrat text-[12.5px] font-bold text-white transition active:bg-white/[0.18] md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4 shrink-0" /> : <MenuIcon className="h-4 w-4 shrink-0" />}
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile slide-down drawer */}
      {open && (
        <div className="animate-drawer-in border-t border-white/[0.07] bg-[#09192a] md:hidden">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-hz-blue/40 bg-hz-blue/20">
              <User className="h-[18px] w-[18px] text-hz-blue" strokeWidth={1.8} aria-hidden />
            </div>
            <div className="min-w-0">
              {authed ? (
                <>
                  <p className="truncate font-montserrat text-[13.5px] font-bold leading-tight text-white">
                    {session.user?.name || session.user?.email || 'Account'}
                  </p>
                  <p className="mt-0.5 font-inter text-[11px] text-white/45">Signed in</p>
                </>
              ) : (
                <>
                  <p className="font-montserrat text-[13.5px] font-bold leading-tight text-white">Welcome</p>
                  <p className="mt-0.5 font-inter text-[11px] text-white/45">Login to access your profile</p>
                </>
              )}
            </div>
          </div>

          <div className="mx-4 h-px bg-white/[0.07]" />

          <p className="px-4 pb-1 pt-3 font-montserrat text-[11px] font-bold uppercase tracking-[0.1em] text-white/30">
            Explore
          </p>
          <DrawerItem href="/buy" onClick={closeDrawer} iconBg="#e8f1fd" icon={<Home className="h-3.5 w-3.5 text-hz-blue" strokeWidth={1.8} />}>
            Buy Property
          </DrawerItem>
          <DrawerItem href="/sell" onClick={closeDrawer} iconBg="#fef3c7" icon={<Plus className="h-3.5 w-3.5 text-hz-amber" strokeWidth={1.8} />}>
            Sell Property
          </DrawerItem>
          <DrawerItem href="/services" onClick={closeDrawer} iconBg="#ccfbf1" icon={<Wrench className="h-3.5 w-3.5 text-hz-teal" strokeWidth={1.8} />}>
            Services
          </DrawerItem>
          <DrawerItem href="/news" onClick={closeDrawer} iconBg="#f3e8ff" icon={<Newspaper className="h-3.5 w-3.5 text-violet-600" strokeWidth={1.8} />}>
            News &amp; Guide
          </DrawerItem>
          <DrawerItem href="/projects" onClick={closeDrawer} iconBg="#e8f1fd" icon={<Landmark className="h-3.5 w-3.5 text-hz-blue" strokeWidth={1.8} />}>
            Projects
          </DrawerItem>

          <div className="mx-4 my-1 h-px bg-white/[0.07]" />

          <p className="px-4 pb-1 pt-2 font-montserrat text-[11px] font-bold uppercase tracking-[0.1em] text-white/30">
            Account
          </p>
          {!authed ? (
            <DrawerItem href="/login" onClick={closeDrawer} iconBg="#e8f1fd" icon={<LogIn className="h-3.5 w-3.5 text-hz-blue" strokeWidth={1.8} />}>
              Login / Sign up
            </DrawerItem>
          ) : (
            <DrawerItem
              onClick={() => {
                closeDrawer();
                if (typeof window !== 'undefined') localStorage.removeItem('infra_token');
                void signOut({ callbackUrl: '/' });
              }}
              iconBg="#fee2e2"
              icon={<LogOut className="h-3.5 w-3.5 text-red-600" strokeWidth={1.8} />}
            >
              Sign out
            </DrawerItem>
          )}
          <DrawerItem
            href={authed ? '/profile?tab=saved' : '/login?callbackUrl=%2Fprofile%3Ftab%3Dsaved'}
            onClick={closeDrawer}
            iconBg="#fef3c7"
            icon={<Heart className="h-3.5 w-3.5 text-orange-600" strokeWidth={1.8} />}
          >
            Saved properties
          </DrawerItem>
          <DrawerItem
            href={authed ? '/profile?tab=seen' : '/login?callbackUrl=%2Fprofile%3Ftab%3Dseen'}
            onClick={closeDrawer}
            iconBg="#dcfce7"
            icon={<Eye className="h-3.5 w-3.5 text-green-600" strokeWidth={1.8} />}
          >
            Seen properties
          </DrawerItem>
          <DrawerItem
            href={authed ? '/profile?tab=enq' : '/login?callbackUrl=%2Fprofile%3Ftab%3Denq'}
            onClick={closeDrawer}
            iconBg="#e8f1fd"
            icon={<MessageCircle className="h-3.5 w-3.5 text-hz-blue" strokeWidth={1.8} />}
          >
            My enquiries
          </DrawerItem>
          <DrawerItem
            href={authed ? '/profile' : '/login?callbackUrl=/profile'}
            onClick={closeDrawer}
            iconBg="#f5f7fa"
            icon={<User className="h-3.5 w-3.5 text-muted" strokeWidth={1.8} />}
          >
            My profile
          </DrawerItem>

          <div className="px-4 pb-5 pt-3">
            <Link
              href="/sell"
              onClick={closeDrawer}
              className="flex min-h-[44px] w-full items-center justify-center rounded-[10px] bg-hz-accent font-montserrat text-[13.5px] font-bold tracking-wide text-white"
            >
              + List Your Property
            </Link>
          </div>
        </div>
      )}

      <div className="h-0.5 w-full bg-gradient-to-r from-hz-blue via-hz-accent to-hz-blue" />
    </header>
  );
}
