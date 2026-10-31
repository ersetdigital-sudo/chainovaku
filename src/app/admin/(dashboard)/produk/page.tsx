import type { Metadata } from "next";
import { ProductsView } from "@/modules/admin/components/products/ProductsView";
import { requireAdmin } from "@/modules/admin/data/auth";
import { getCatalog } from "@/modules/admin/data/products";

export const metadata: Metadata = { title: "Produk & Harga" };

export default async function ProductsPage() {
  const { brand, supabase } = await requireAdmin();
  const { services, products } = await getCatalog(supabase, brand.id);

  return (
    <ProductsView brand={brand} services={services} products={products} />
  );
}
