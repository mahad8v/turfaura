import Link from "next/link";
import { Goal, ArrowRight, LogIn } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
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
          <nav className="flex shrink-0 items-center gap-1.5 text-sm font-medium sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 sm:inline-block"
            >
              Owner login
            </Link>
            <Link
              href="/login"
              aria-label="Owner login"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 sm:hidden"
            >
              <LogIn className="size-4" />
            </Link>
            <Link
              href="/signup"
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-white shadow-sm shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] sm:px-3.5"
            >
              <span className="sm:hidden">List pitch</span>
              <span className="hidden sm:inline">List your pitch</span>
              <ArrowRight className="hidden size-3.5 transition-transform group-hover:translate-x-0.5 sm:inline" />
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <Goal className="size-4 text-emerald-600" />
            TurfAura
          </div>
          <p className="text-xs text-zinc-400">Book a pitch in minutes. No account needed.</p>
        </div>
      </footer>
    </div>
  );
}
