"use client";

import { useActionState } from "react";
import { Save, CircleAlert, CircleCheck } from "lucide-react";
import { TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";
import type { SettingsFormState } from "@/app/(owner)/dashboard/settings/actions";

export interface ProfileFormDefaults {
  name: string;
  phone?: string;
}

export function ProfileForm({
  action,
  defaults,
}: {
  action: (prevState: SettingsFormState | null, formData: FormData) => Promise<SettingsFormState>;
  defaults: ProfileFormDefaults;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <TextField label="Full name" name="name" defaultValue={defaults.name} required />
      <TextField
        label="Phone"
        name="phone"
        type="tel"
        defaultValue={defaults.phone}
        hint="Your WhatsApp contact number, shown to customers on your pitch pages."
      />

      {state?.error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert className="size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-700">
          <CircleCheck className="size-4 shrink-0" />
          Saved.
        </p>
      )}

      <div>
        <Button type="submit" pending={pending} pendingText="Saving…" size="md" icon={<Save className="size-4" />}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
