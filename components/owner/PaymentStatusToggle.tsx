"use client";

import { useState, useTransition } from "react";
import { CircleCheck, CircleAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/shared/Button";

export function PaymentStatusToggle({
  ownerId,
  year,
  month,
  paid,
  markPaid,
  markUnpaid,
}: {
  ownerId: string;
  year: number;
  month: number;
  paid: boolean;
  markPaid: (ownerId: string, year: number, month: number) => Promise<void>;
  markUnpaid: (ownerId: string, year: number, month: number) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        if (paid) await markUnpaid(ownerId, year, month);
        else await markPaid(ownerId, year, month);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update.");
      }
    });
  }

  return (
    <div className="text-right">
      <Button
        type="button"
        variant={paid ? "secondary" : "primary"}
        size="sm"
        pending={isPending}
        icon={paid ? <RotateCcw className="size-3.5" /> : <CircleCheck className="size-3.5" />}
        onClick={handleClick}
      >
        {paid ? "Mark unpaid" : "Mark paid"}
      </Button>
      {error && (
        <p className="mt-1.5 flex items-center justify-end gap-1 text-xs text-red-600">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
