"use client";

import { useState, useTransition, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/shared/Button";

export function ToggleButton({
  id,
  active,
  onLabel,
  offLabel,
  onIcon,
  offIcon,
  action,
}: {
  id: string;
  active: boolean;
  onLabel: string;
  offLabel: string;
  onIcon: ReactNode;
  offIcon: ReactNode;
  action: (id: string) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="text-right">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        pending={isPending}
        icon={active ? offIcon : onIcon}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            try {
              await action(id);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not update.");
            }
          })
        }
      >
        {active ? offLabel : onLabel}
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
