"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export interface AuthActionState {
  error?: string;
  info?: string;
}

export async function login(_prevState: AuthActionState | null, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // A super admin has no turf of their own — landing on the owner dashboard
  // would just show its empty state. Send them straight to the admin section.
  const owner = await prisma.owner.findUnique({ where: { supabaseUserId: data.user.id }, select: { role: true } });
  // `welcome=1` is a one-time signal for BiometricEnrollPrompt to offer
  // quick-unlock after a genuine password sign-in — it strips the param
  // itself once shown (or once it determines it doesn't apply).
  redirect(owner?.role === "ADMIN" ? "/admin?welcome=1" : "/dashboard?welcome=1");
}

/** Used by the login page after a successful biometric unlock (no server action was involved, so there's no redirect() to piggyback on) to find where this owner belongs. */
export async function resolveLoginDestination(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/login";
  const owner = await prisma.owner.findUnique({ where: { supabaseUserId: user.id }, select: { role: true } });
  return owner?.role === "ADMIN" ? "/admin" : "/dashboard";
}

export interface SignupActionState extends AuthActionState {
  awaitingCode?: boolean;
  email?: string;
}

export async function signup(_prevState: SignupActionState | null, formData: FormData): Promise<SignupActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!name) return { error: "Your name is required." };
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  // No emailRedirectTo — the confirmation email shows a 6-digit code
  // (Supabase's "Confirm signup" template, edited to include {{ .Token }})
  // instead of a clickable link, so there's no redirect URL to get wrong.
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  if (!data.user) return { error: "Could not create your account. Please try again." };

  try {
    await prisma.owner.create({
      data: { supabaseUserId: data.user.id, name, email, phone },
    });
  } catch {
    return { error: "An account with that email already exists." };
  }

  if (!data.session) {
    return { awaitingCode: true, email };
  }

  redirect("/dashboard");
}

export async function verifySignupCode(_prevState: SignupActionState | null, formData: FormData): Promise<SignupActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();

  if (!token) return { error: "Enter the code from your email.", awaitingCode: true, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
  if (error) return { error: error.message, awaitingCode: true, email };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const owner = user ? await prisma.owner.findUnique({ where: { supabaseUserId: user.id }, select: { role: true } }) : null;
  redirect(owner?.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function resendSignupCode(email: string): Promise<{ error?: string; sent?: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) return { error: error.message };
  return { sent: true };
}

export async function logout() {
  // Not supabase.auth.signOut() — even with { scope: "local" }, it still
  // revokes the refresh token server-side (confirmed directly: identical
  // token, valid right up until this call, dead immediately after). That
  // would kill quick-unlock's separately-stored copy of the same token on
  // every ordinary logout, defeating the point of the feature. Clearing the
  // session cookie ourselves ends this browser's session (getUser() on the
  // next request sees no session at all) without touching Supabase's own
  // revocation, so a device with quick-unlock enabled keeps working. Full
  // revocation is still available via "Forget this device" in Account
  // settings, which is the deliberate one-way-door for that.
  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")) {
      cookieStore.delete(cookie.name);
    }
  }
  redirect("/login");
}
