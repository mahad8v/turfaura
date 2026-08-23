"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/shared/Button";

export function ErrorFallback({
  error,
  reset,
  homeHref,
  homeLabel,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref: string;
  homeLabel: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <TriangleAlert className="size-6" strokeWidth={2} />
      </span>
      <h1 className="font-display mt-5 text-lg font-bold text-zinc-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-500">
        This page hit an unexpected error. It&apos;s been logged — try again, or head back home.
      </p>
      {error.digest && <p className="mt-1 text-xs text-zinc-400">Reference: {error.digest}</p>}
      <div className="mt-6 flex items-center gap-3">
        <Button type="button" onClick={reset} icon={<RotateCw className="size-3.5" />}>
          Try again
        </Button>
        <Link
          href={homeHref}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <Home className="size-3.5" />
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
