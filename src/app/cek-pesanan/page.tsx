import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackClient } from "@/components/TrackClient";

export const metadata = {
  title: "Lacak Pesanan · Chainovaku",
};

export default function TrackPage() {
  return (
    <>
      <Header />

      <main className="max-w-3xl mx-auto px-5 py-8 min-h-[70vh]">
        <div className="kicker text-[#2A428C]">Lacak</div>
        <h1 className="text-2xl md:text-3xl font-bold mt-1.5">Cek status pesanan</h1>
        <p className="text-sm text-[#5C6480] mt-2">
          Masukkan nomor invoice untuk melihat status dan rincian transaksi.
        </p>

        <Suspense fallback={<div className="h-32" />}>
          <TrackClient />
        </Suspense>

        <div className="mt-6 text-center text-xs text-[#5C6480]">
          <Link href="/" className="font-bold text-[#2A428C] hover:underline">
            ← Kembali ke beranda
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
