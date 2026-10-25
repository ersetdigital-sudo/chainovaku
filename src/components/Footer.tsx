import Link from "next/link";
import { Logo } from "./Logo";
import { TabLink } from "./TabLink";

const SERVICE_LINKS = [
  { tab: "pulsa", href: "/?tab=pulsa#beli", label: "Pulsa & Data" },
  { tab: "pln", href: "/?tab=pln#beli", label: "Token PLN" },
  { tab: "game", href: "/?tab=game#beli", label: "Top Up Game" },
  { tab: "ewallet", href: "/?tab=ewallet#beli", label: "E-Wallet" },
  { tab: "tagihan", href: "/?tab=tagihan#beli", label: "Tagihan" },
];

const PAY_METHODS = ["QRIS", "BCA", "BRI", "Mandiri", "BNI", "DANA", "OVO", "GoPay", "ShopeePay"];

export function Footer() {
  return (
    <footer className="bg-[#EEF1FB] border-t border-[#D9DEF0] text-[#5C6480] text-sm">
      <div className="max-w-6xl mx-auto px-5 pt-12 pb-8">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr] gap-10">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs leading-relaxed">
              Platform isi ulang dan bayar tagihan. Proses otomatis, buka 24 jam, tanpa perlu daftar akun.
            </p>
            <a
              href="https://wa.me/6285711172317"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white border border-[#D9DEF0] px-3.5 py-2 text-xs font-bold text-[#1D2650] hover:border-[#2A428C]"
            >
              WhatsApp admin · 0857 1117 2317
            </a>
          </div>

          <div>
            <h4 className="text-[#1D2650] font-bold mb-4">Layanan</h4>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map((item) => (
                <li key={item.label}>
                  <TabLink tab={item.tab} href={item.href} className="hover:text-[#1D2650]">
                    {item.label}
                  </TabLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[#1D2650] font-bold mb-4">Bantuan</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#layanan" className="hover:text-[#1D2650]">
                  Semua layanan
                </Link>
              </li>
              <li>
                <Link href="/#promo" className="hover:text-[#1D2650]">
                  Promo
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#1D2650]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/cek-pesanan/" className="hover:text-[#1D2650]">
                  Lacak pesanan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-[#D9DEF0]">
          <div className="flex flex-wrap gap-2">
            {PAY_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-md border border-[#D9DEF0] bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#5C6480]"
              >
                {method}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs">
            <span>© 2026 Chainovaku. Semua hak dilindungi.</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2A428C]" />
              Sistem operasional normal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
