"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Goal, Mail, Lock, User, Phone, CircleAlert, CircleCheck } from "lucide-react";
import { signup } from "../actions";
import { TextField } from "@/components/shared/fields";
import { Button } from "@/components/shared/Button";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-600/30">
            <Goal className="size-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-zinc-900">TurfAura</span>
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-7">
          <h1 className="font-display text-xl font-bold text-zinc-900">Create your owner account</h1>
          <p className="mt-1 text-sm text-zinc-500">List pitches, set pricing, and manage bookings.</p>

          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <TextField label="Full name" name="name" autoComplete="name" icon={<User className="size-4" />} required />
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              icon={<Mail className="size-4" />}
              required
            />
            <TextField
              label="Phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              icon={<Phone className="size-4" />}
              hint="Used as your WhatsApp contact by default."
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              icon={<Lock className="size-4" />}
              hint="At least 8 characters."
              required
            />
            {state?.error && (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <CircleAlert className="size-4 shrink-0" />
                {state.error}
              </p>
            )}
            {state?.info && (
              <p className="flex items-center gap-1.5 text-sm text-emerald-700">
                <CircleCheck className="size-4 shrink-0" />
                {state.info}
              </p>
            )}
            <Button type="submit" pending={pending} pendingText="Creating account…" size="lg" className="mt-1">
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
