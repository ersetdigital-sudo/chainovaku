import type { Metadata } from "next";
import { VouchersView } from "@/modules/admin/components/vouchers/VouchersView";
import { requireAdmin } from "@/modules/admin/data/auth";
import { getVoucherData } from "@/modules/admin/data/vouchers";

export const metadata: Metadata = { title: "Voucher" };

export default async function VoucherPage() {
  const { brand, supabase } = await requireAdmin();
  const { services, vouchers } = await getVoucherData(supabase, brand.id);

  return <VouchersView services={services} vouchers={vouchers} />;
}
