import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** For use inside Server Actions/Route Handlers that require a logged-in pitch owner. */
export async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not signed in.");

  const owner = await prisma.owner.findUnique({ where: { supabaseUserId: user.id } });
  if (!owner) throw new Error("No owner profile for this account.");

  return owner;
}

/** For use inside Server Actions/Route Handlers that require a platform admin. */
export async function requireAdmin() {
  const owner = await requireOwner();
  if (owner.role !== "ADMIN") throw new Error("Admin access required.");
  return owner;
}
