import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { ProfileForm } from "@/components/owner/ProfileForm";
import { updateSettings } from "../actions";

export default async function ProfilePage() {
  const owner = await requireOwner();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/settings"
        className="mb-3 inline-flex items-center gap-0.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
      >
        <ChevronLeft className="size-4" />
        Account
      </Link>
      <h1 className="font-display text-xl font-bold text-zinc-900">Profile</h1>
      <p className="mt-1 text-sm text-zinc-500">Your name and contact details.</p>

      <div className="mt-6">
        <ProfileForm
          action={updateSettings}
          defaults={{
            name: owner.name,
            phone: owner.phone ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
