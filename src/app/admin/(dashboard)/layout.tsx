import { AdminShell } from "@/modules/admin/components/layout/AdminShell";
import { requireAdmin } from "@/modules/admin/data/auth";
import { getActionableCount } from "@/modules/admin/data/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { brand, supabase } = await requireAdmin();
  const actionCount = await getActionableCount(supabase, brand.id);

  return (
    <AdminShell brandName={brand.nama} actionCount={actionCount}>
      {children}
    </AdminShell>
  );
}
