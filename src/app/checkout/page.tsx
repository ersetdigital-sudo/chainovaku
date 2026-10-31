import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckoutClient } from "@/components/CheckoutClient";
import { getCatalog } from "@/lib/db/server";

export const metadata = {
  title: "Pembayaran · Chainovaku",
};

export default async function CheckoutPage() {
  const catalog = await getCatalog();
  const brand = catalog.data?.brand ?? null;
  const qrisMethodId =
    catalog.data?.methods.find((method) => method.name === "QRIS")?.id ?? null;
  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-5 py-7">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6480] hover:text-[#1D2650]">
          ← Kembali
        </Link>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="kicker text-[#2A428C]">Checkout</div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">Selesaikan pembayaran</h1>
          </div>
          <p className="text-xs text-[#5C6480] max-w-xs">
            Pembayaran diverifikasi manual oleh admin setelah bukti dikirim.
          </p>
        </div>

        <CheckoutClient
          brandSlug={brand?.slug ?? ""}
          qrisMethodId={qrisMethodId}
          qrisImageUrl={brand?.qris_image_url ?? null}
        />
      </main>

      <Footer />
    </>
  );
}
