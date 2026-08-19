import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  buildHref,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-xs text-zinc-500">
        Showing {rangeStart}–{rangeEnd} of {totalCount}
      </p>
      <div className="flex items-center gap-1.5">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            <ChevronLeft className="size-3.5" />
            Previous
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-300">
            <ChevronLeft className="size-3.5" />
            Previous
          </span>
        )}
        <span className="px-2 text-xs font-medium text-zinc-500">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            Next
            <ChevronRight className="size-3.5" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-300">
            Next
            <ChevronRight className="size-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
