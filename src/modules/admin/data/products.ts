import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductRow, ServiceRow } from "../types";

export async function getCatalog(
  supabase: SupabaseClient,
  brandId: string,
): Promise<{ services: ServiceRow[]; products: ProductRow[] }> {
  const [servicesResult, productsResult] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("brand_id", brandId)
      .order("urutan", { ascending: true })
      .order("nama", { ascending: true }),
    supabase
      .from("products")
      .select("*")
      .eq("brand_id", brandId)
      .order("urutan", { ascending: true })
      .order("nama", { ascending: true }),
  ]);

  if (servicesResult.error) throw servicesResult.error;
  if (productsResult.error) throw productsResult.error;

  return {
    services: (servicesResult.data ?? []) as ServiceRow[],
    products: (productsResult.data ?? []) as ProductRow[],
  };
}
