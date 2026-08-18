"use client";

import { useActionState } from "react";
import { CircleAlert, User, Phone } from "lucide-react";
import { TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";

interface FormState {
  error?: string;
}

export function BookingForm({
  action,
}: {
  action: (prevState: FormState | null, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <TextField label="Your name" name="customerName" icon={<User className="size-4" />} required />
      <TextField
        label="Phone number"
        name="customerPhone"
        type="tel"
        icon={<Phone className="size-4" />}
        required
        hint="We'll use this to reach you about your booking."
      />
      {state?.error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert className="size-4 shrink-0" />
          {state.error}
        </p>
      )}
      <Button type="submit" pending={pending} pendingText="Booking…" size="lg">
        Request booking
      </Button>
    </form>
  );
}
