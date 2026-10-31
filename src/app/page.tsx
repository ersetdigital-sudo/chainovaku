import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icons";
import { BuyWidget } from "@/components/BuyWidget";
import { CopyButton } from "@/components/CopyButton";
import { HeroKinetic } from "@/components/HeroKinetic";
import { services, serviceBySlug } from "@/lib/services";
import { getStorefront } from "@/lib/catalog-hydrate";
import type { Service } from "@/lib/services";

const FAQ = [
  ["Perlu bikin akun dulu?", "Tidak perlu. Isi nomor, pilih nominal, lalu bayar lewat QRIS."],
  ["Berapa lama prosesnya?", "Rata-rata di bawah 1 menit setelah pembayaran diverifikasi admin."],
  ["Kalau transaksi gagal?", "Dana dikembalikan otomatis ke metode pembayaranmu."],
  ["Metode pembayaran apa saja?", "QRIS, virtual account bank, dan e-wallet populer."],
  ["Bisa cek status pesanan?", "Bisa. Simpan nomor invoice lalu buka halaman Lacak."],
];

function ServiceTile({ service }: { service: Service }) {
  return (
    <Link
      href={`/layanan/${service.slug}/`}
      className="tile group flex items-start gap-3.5 rounded-xl border border-[#E1E5F2] bg-white p-4"
    >
      <span
        className="w-10 h-10 shrink-0 rounded-lg grid place-items-center"
        style={{ background: service.icon.bg }}
      >
        <Icon name={service.icon.name} size={18} stroke={service.icon.stroke} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-tight">{service.title}</span>
        <span className="block text-xs text-[#5C6480] mt-1 leading-snug">{service.blurb}</span>
      </span>
      <span className="tile-arrow w-6 h-6 shrink-0 rounded-md border border-[#E1E5F2] grid place-items-center text-[#5C6480] text-xs transition">
        →
      </span>
    </Link>
  );
}

export default async function Home() {
  const storefront = await getStorefront();

  return (
    <>
      <Header variant="home" />

      <main>
        {/* HERO */}
        <HeroKinetic services={services} />

        {/* LAYANAN GRID */}
        <section id="layanan" className="max-w-6xl mx-auto px-5 py-12 md:py-14 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="kicker text-[#2A428C]">Katalog</div>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold">Dari pulsa sampai angsuran.</h2>
            </div>
            <p className="text-sm text-[#5C6480] max-w-xs">
              Sembilan layanan harian, terkoneksi dalam satu alur pembayaran.
            </p>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {services.map((service) => (
              <ServiceTile key={service.slug} service={service} />
            ))}
          </div>
        </section>

        {/* QUICK BUY */}
        <section id="beli" className="bg-white border-y border-[#E1E5F2] scroll-mt-24">
          <div className="max-w-6xl mx-auto px-5 py-12 md:py-14 grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
            <div className="lg:sticky lg:top-28">
              <div className="kicker text-[#2A428C]">Langsung dari HP</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold leading-tight">
                Isi kebutuhanmu, tanpa drama.
              </h2>
              <p className="mt-3 text-[#5C6480] leading-relaxed max-w-sm">
                Butuh pulsa, token, atau bayar tagihan? Pilih, isi tujuan, scan QRIS. Selesai tanpa
                bolak-balik.
              </p>
              <ol className="mt-6 space-y-4">
                {[
                  ["Pilih yang kamu butuh", "Pulsa, data, game, token, sampai tagihan rumah."],
                  ["Isi nomor tujuan", "Operator langsung kebaca, nggak perlu pilih manual."],
                  ["Scan QRIS, langsung beres", "Bayar dari e-wallet atau m-banking favoritmu."],
                ].map(([title, desc], i) => (
                  <li key={title} className="flex gap-3">
                    <span className="w-7 h-7 shrink-0 rounded bg-[#2A428C] text-[#FFEF4D] grid place-items-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{title}</span>
                      <span className="block text-xs text-[#5C6480] mt-0.5">{desc}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-lg bg-[#EEF1FB] border border-[#D9DEF0] p-3.5 text-xs text-[#4A5375]">
                Bingung di tengah jalan? Admin siap bantu lewat WhatsApp{" "}
                <a
                  href="https://wa.me/6285711172317"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#2A428C] hover:underline"
                >
                  0857 1117 2317
                </a>
              </div>
            </div>
            <BuyWidget services={storefront.services} games={storefront.games} />
          </div>
        </section>

        {/* PROMO */}
        <section id="promo" className="max-w-6xl mx-auto px-5 py-12 md:py-14 scroll-mt-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="kicker text-[#2A428C]">Penawaran aktif</div>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold">Lebih hemat di tiap transaksi.</h2>
            </div>
          </div>
          <div className="mt-5 grid md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#FFEF4D] border border-[#E8D83F] p-6">
              <div className="kicker text-[#2A428C]">Hemat listrik</div>
              <h3 className="mt-2 text-2xl font-bold">Balik 10% untuk token PLN</h3>
              <p className="mt-2 text-sm text-[#3B456B]">Maksimal Rp10.000. Pakai kodenya saat checkout.</p>
              <CopyButton code="CHAINOVA10" />
            </div>
            <div className="rounded-xl bg-[#2A428C] border border-[#223773] p-6 text-white">
              <div className="kicker text-[#FFEF4D]">Bonus pelanggan</div>
              <h3 className="mt-2 text-2xl font-bold">Transaksi kelima, admin kami yang tanggung</h3>
              <p className="mt-2 text-sm text-white/70">Otomatis dihitung setiap bulan.</p>
              <div className="mt-5 flex gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className="w-8 h-8 rounded-md border border-white/20 grid place-items-center text-xs font-bold text-white/70"
                  >
                    {n}
                  </span>
                ))}
                <span className="h-8 rounded-md bg-[#FFEF4D] px-2.5 grid place-items-center text-[10px] font-extrabold text-[#1D2650]">
                  FREE
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-white border-t border-[#E1E5F2] scroll-mt-24">
          <div className="max-w-6xl mx-auto px-5 py-12 md:py-14 grid lg:grid-cols-[0.7fr_1.3fr] gap-8">
            <div>
              <div className="kicker text-[#2A428C]">FAQ</div>
              <h2 className="mt-2 text-3xl font-bold">Yang sering ditanya.</h2>
              <p className="mt-3 text-sm text-[#5C6480] max-w-xs">
                Kalau belum terjawab, hubungi admin lewat WhatsApp.
              </p>
              <a
                href="https://wa.me/6285711172317"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm font-bold text-[#2A428C] hover:underline"
              >
                Chat admin →
              </a>
            </div>
            <div className="space-y-2.5">
              {FAQ.map(([q, a]) => (
                <details key={q} className="card px-4 py-3.5">
                  <summary className="flex justify-between gap-3 cursor-pointer text-sm font-bold">
                    {q}
                    <span className="pl transition text-xl leading-none text-[#5C6480]">+</span>
                  </summary>
                  <p className="text-sm text-[#5C6480] mt-2.5 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
