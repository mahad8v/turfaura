import Link from 'next/link';
import { Goal } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { UserMenu } from '@/components/shared/UserMenu';
import { logout } from '../(owner)/actions';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-600/30">
              <Goal className="size-4" strokeWidth={2.5} />
            </span>
            <span className="font-display truncate text-lg font-extrabold tracking-tight text-zinc-900">
              TurfAura
            </span>
          </Link>
          <UserMenu loggedIn={Boolean(user)} logoutAction={logout} />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <Goal className="size-4 text-emerald-600" />
            TurfAura
          </div>
          <p className="text-xs text-zinc-400">
            Book a pitch in minutes. No account needed.
          </p>
        </div>
      </footer>
    </div>
  );
}
