"use client";

import { useState, useTransition } from "react";
import { CircleAlert, TriangleAlert } from "lucide-react";
import { Button } from "@/components/shared/Button";

interface CancelResult {
  error?: string;
}

export function CancelBookingButton({
  reference,
  cancelBooking,
}: {
  reference: string;
  cancelBooking: (reference: string) => Promise<CancelResult>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button type="button" variant="secondary" onClick={() => setConfirming(true)}>
        Request cancellation
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="flex items-center gap-1.5 text-sm font-medium text-amber-800">
        <TriangleAlert className="size-4 shrink-0" />
        Are you sure? This will cancel your booking.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="danger"
          size="sm"
          pending={isPending}
          pendingText="Cancelling…"
          onClick={() =>
            startTransition(async () => {
              const result = await cancelBooking(reference);
              if (result.error) setError(result.error);
            })
          }
        >
          Yes, cancel my booking
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(false)}>
          Never mind
        </Button>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
