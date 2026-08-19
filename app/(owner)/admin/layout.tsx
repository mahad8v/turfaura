import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logout } from "../actions";
import { DashboardShell, type DashboardNavItem } from "@/components/shared/DashboardShell";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard", exact: true },
  { href: "/admin/owners", label: "Owners", icon: "Users" },
  { href: "/admin/pitches", label: "Pitches", icon: "MapPinned" },
  { href: "/admin/bookings", label: "Bookings", icon: "CalendarCheck" },
  { href: "/admin/calendar", label: "Calendar", icon: "CalendarDays" },
  { href: "/admin/earnings", label: "Earnings", icon: "Wallet" },
  { href: "/dashboard/settings", label: "Account", icon: "User" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const owner = await prisma.owner.findUnique({ where: { supabaseUserId: user.id } });
  if (!owner) redirect("/login");
  if (owner.role !== "ADMIN") redirect("/dashboard");

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      theme="indigo"
      brandSubtitle="admin"
      userName={owner.name}
      userMeta={owner.email}
      logoutAction={logout}
      headerExtra={
        <Link
          href="/dashboard"
          aria-label="Owner view"
          className="flex items-center gap-2 rounded-xl bg-emerald-50 px-2.5 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 sm:px-3"
        >
          <ArrowLeftRight className="size-4 shrink-0" />
          <span className="hidden sm:inline">Owner view</span>
        </Link>
      }
    >
      {children}
    </DashboardShell>
  );
}
