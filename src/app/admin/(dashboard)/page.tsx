import type { Metadata } from "next";
import { DashboardView } from "@/modules/admin/components/dashboard/DashboardView";
import { requireAdmin } from "@/modules/admin/data/auth";
import {
  getDashboardSummary,
  getRecentOrders,
} from "@/modules/admin/data/dashboard";
import { currentMonthKey, isValidMonthKey } from "@/modules/admin/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const params = await searchParams;
  const monthKey =
    typeof params.bulan === "string" && isValidMonthKey(params.bulan)
      ? params.bulan
      : currentMonthKey();

  const { brand, supabase } = await requireAdmin();
  const [summary, recent] = await Promise.all([
    getDashboardSummary(supabase, brand.id, monthKey),
    getRecentOrders(supabase, brand.id, 6),
  ]);

  return (
    <DashboardView
      brand={brand}
      monthKey={monthKey}
      summary={summary}
      recent={recent}
    />
  );
}
