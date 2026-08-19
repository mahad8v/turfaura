"use server";

import { redirect } from "next/navigation";
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
  redirect(owner?.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function signup(_prevState: AuthActionState | null, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!name) return { error: "Your name is required." };
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
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
    return { info: "Account created — check your email to confirm it, then log in." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
