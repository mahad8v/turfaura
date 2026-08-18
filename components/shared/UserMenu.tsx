"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, LogIn, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";

export function UserMenu({
  loggedIn,
  logoutAction,
}: {
  loggedIn: boolean;
  logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200"
      >
        <User className="size-4" strokeWidth={2.25} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1.5 shadow-lg">
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <LayoutDashboard className="size-4 text-zinc-400" />
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  <LogOut className="size-4 text-zinc-400" />
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <LogIn className="size-4 text-zinc-400" />
                Owner login
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                <ArrowRight className="size-4" />
                Register your pitch
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
