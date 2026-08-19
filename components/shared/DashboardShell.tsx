'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RealtimeBookingListener } from '@/components/owner/RealtimeBookingListener';
import {
  Goal,
  LogOut,
  LayoutGrid,
  CalendarCheck,
  CalendarDays,
  Wallet,
  LayoutDashboard,
  Users,
  MapPinned,
  Settings,
  User,
  Receipt,
} from 'lucide-react';

// Server Component layouts build the nav list, but React Server Components
// can't pass raw component references (functions) as props into a "use
// client" component — only serializable data or already-rendered elements.
// So nav items carry a string key here instead, resolved to a real icon
// component client-side.
const ICONS = {
  LayoutGrid,
  CalendarCheck,
  CalendarDays,
  Wallet,
  LayoutDashboard,
  Users,
  MapPinned,
  Settings,
  User,
  Receipt,
} as const;

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  exact?: boolean;
}

type Theme = 'emerald' | 'indigo';

const THEME: Record<
  Theme,
  { gradient: string; shadow: string; activeBg: string; activeText: string }
> = {
  emerald: {
    gradient: 'from-emerald-500 to-emerald-700',
    shadow: 'shadow-emerald-600/30',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
  },
  indigo: {
    gradient: 'from-indigo-500 to-indigo-700',
    shadow: 'shadow-indigo-600/30',
    activeBg: 'bg-indigo-50',
    activeText: 'text-indigo-700',
  },
};

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: DashboardNavItem[];
  theme: Theme;
  brandSubtitle: string;
  userName: string;
  userMeta?: string;
  headerExtra?: React.ReactNode;
  logoutAction: () => Promise<void>;
  /** Owner id to live-update this dashboard for — omit on shells that shouldn't get realtime booking pushes (e.g. admin). */
  realtimeOwnerId?: string;
}

export function DashboardShell({
  children,
  navItems,
  theme,
  brandSubtitle,
  userName,
  userMeta,
  headerExtra,
  logoutAction,
  realtimeOwnerId,
}: DashboardShellProps) {
  const pathname = usePathname();
  const t = THEME[theme];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  function isActive(item: DashboardNavItem) {
    return item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50 lg:flex">
      {realtimeOwnerId && <RealtimeBookingListener ownerId={realtimeOwnerId} />}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:border-zinc-200 lg:bg-white">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-5">
            <span
              className={`flex size-8 items-center justify-center rounded-lg bg-linear-to-br ${t.gradient} text-white shadow-sm ${t.shadow}`}
            >
              <Goal className="size-4" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-zinc-900">
              TurfAura{' '}
              <span className="font-normal text-zinc-400">{brandSubtitle}</span>
            </span>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-4">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = ICONS[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                    active
                      ? `${t.activeBg} ${t.activeText}`
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 transition-transform duration-150 ${active ? '' : 'group-hover:scale-110'}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {headerExtra && <div className="px-3 pb-1">{headerExtra}</div>}

          <div className="p-3">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 ring-1 ring-inset ring-zinc-100">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${t.gradient} text-sm font-semibold text-white shadow-sm ${t.shadow}`}
              >
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {userName}
                </p>
                {userMeta && (
                  <p className="truncate text-xs text-zinc-400">{userMeta}</p>
                )}
              </div>
            </div>
            <form action={logoutAction} className="mt-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <LogOut className="size-3.5" />
                Log out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile: slim top bar (branding + account actions only — section nav lives in the bottom bar) */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <span
            className={`flex size-8 items-center justify-center rounded-lg bg-linear-to-br ${t.gradient} text-white shadow-sm ${t.shadow}`}
          >
            <Goal className="size-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-base font-extrabold text-zinc-900">
            TurfAura
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {headerExtra}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Account menu"
              className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200"
            >
              <User className="size-4" strokeWidth={2.25} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1.5 shadow-lg">
                <div className="border-b border-zinc-100 px-4 py-2.5">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {userName}
                  </p>
                  {userMeta && (
                    <p className="truncate text-xs text-zinc-400">{userMeta}</p>
                  )}
                </div>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: fixed bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="flex items-stretch justify-around">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-center"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full transition-all duration-150 ${
                    active
                      ? `${t.activeBg} ${t.activeText} scale-110`
                      : 'text-zinc-400'
                  }`}
                >
                  <Icon className="size-6" />
                </span>
                <span
                  className={`text-[10px] font-medium ${active ? t.activeText : 'text-zinc-400'}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 lg:py-8 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
