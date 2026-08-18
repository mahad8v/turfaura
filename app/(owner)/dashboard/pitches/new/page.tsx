import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireOwner } from "@/lib/auth";
import { PitchForm } from "@/components/owner/PitchForm";
import { createPitch } from "./actions";

export default async function NewPitchPage() {
  await requireOwner();

  return (
    <div className="max-w-2xl">
      <Link
        href="/dashboard"
        className="mb-3 inline-flex items-center gap-0.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
      >
        <ChevronLeft className="size-4" />
        Pitches
      </Link>
      <h1 className="font-display text-xl font-bold text-zinc-900">Add a pitch</h1>
      <p className="mt-1 text-sm text-zinc-500">
        You can add photos and set up blocked dates once the pitch is created.
      </p>
      <div className="mt-6">
        <PitchForm action={createPitch} submitLabel="Create pitch" />
      </div>
    </div>
  );
}
