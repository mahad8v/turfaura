import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldUser } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logout } from "../actions";
import { DashboardShell, type DashboardNavItem } from "@/components/shared/DashboardShell";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "LayoutDashboard", exact: true },
  { href: "/dashboard/bookings", label: "Bookings", icon: "CalendarCheck" },
  { href: "/dashboard/calendar", label: "Calendar", icon: "CalendarDays" },
  { href: "/dashboard/settings", label: "Account", icon: "User" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const owner = await prisma.owner.findUnique({ where: { supabaseUserId: user.id } });

  if (!owner) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">Account setup incomplete</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Your login worked, but we couldn&apos;t find an owner profile for it. Try creating your account again.
        </p>
        <Link href="/signup" className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800">
          Go to sign up
        </Link>
      </div>
    );
  }

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      theme="emerald"
      brandSubtitle="owner"
      userName={owner.name}
      userMeta={owner.email}
      logoutAction={logout}
      headerExtra={
        owner.role === "ADMIN" ? (
          <Link
            href="/admin"
            aria-label="Admin panel"
            className="flex items-center gap-2 rounded-xl bg-indigo-50 px-2.5 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 sm:px-3"
          >
            <ShieldUser className="size-4 shrink-0" />
            <span className="hidden sm:inline">Admin panel</span>
          </Link>
        ) : undefined
      }
    >
      {children}
    </DashboardShell>
  );
}
