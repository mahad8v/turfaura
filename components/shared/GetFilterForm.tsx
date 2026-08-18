"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A GET-style filter form (status/date/etc. dropdowns that narrow a list)
 * that navigates client-side via the router instead of a native HTML form
 * submission — a plain `<form method="get">` triggers a full page reload,
 * which this avoids while keeping the same shareable-URL behavior.
 */
export function GetFilterForm({
  basePath,
  className,
  children,
}: {
  basePath: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value) params.set(key, value);
    }
    router.push(params.size > 0 ? `${basePath}?${params.toString()}` : basePath);
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
