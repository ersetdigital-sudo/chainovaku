import type { Metadata } from "next";
import { SettingsView } from "@/modules/admin/components/settings/SettingsView";
import { requireAdmin } from "@/modules/admin/data/auth";
import { getPaymentMethods } from "@/modules/admin/data/settings";

export const metadata: Metadata = { title: "Pembayaran & Brand" };

export default async function SettingsPage() {
  const { brand, supabase } = await requireAdmin();
  const paymentMethods = await getPaymentMethods(supabase, brand.id);

  return <SettingsView brand={brand} paymentMethods={paymentMethods} />;
}
