import Link from "next/link";
import { Logo } from "./Logo";
import { TabLink } from "./TabLink";

type Variant = "home" | "sub";

const NAV: Record<Variant, { href: string; label: string; tab?: string }[]> = {
  home: [
    { href: "#layanan", label: "Layanan" },
    { href: "#beli", label: "Isi Ulang" },
    { href: "/?tab=game#beli", label: "Game", tab: "game" },
    { href: "#promo", label: "Promo" },
    { href: "#faq", label: "FAQ" },
    { href: "/cek-pesanan/", label: "Lacak" },
  ],
  sub: [
    { href: "/#layanan", label: "Layanan" },
    { href: "/layanan/pulsa/", label: "Pulsa" },
    { href: "/layanan/top-up-game/", label: "Game" },
    { href: "/#promo", label: "Promo" },
    { href: "/#faq", label: "FAQ" },
    { href: "/cek-pesanan/", label: "Lacak" },
  ],
};

export function Header({ variant = "sub" }: { variant?: Variant }) {
  const nav = NAV[variant];

  return (
    <>
      <div className="bg-[#2A428C] text-[#FFEF4D]">
        <div className="max-w-6xl mx-auto px-5 py-2 flex items-center justify-between gap-4 text-[10px] font-bold tracking-[.14em] uppercase">
          <span>Proses otomatis 24 jam</span>
          <span className="hidden sm:block">Tanpa daftar · Harga transparan</span>
          <a href="https://wa.me/6285711172317" target="_blank" rel="noreferrer" className="hover:underline">
            WA 0857 1117 2317
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E1E5F2]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          {variant === "home" ? (
            <a href="#" aria-label="Chainovaku">
              <Logo />
            </a>
          ) : (
            <Link href="/" aria-label="Chainovaku">
              <Logo />
            </Link>
          )}

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#5C6480]">
            {nav.map((item) =>
              item.tab ? (
                <TabLink key={item.label} tab={item.tab} href={item.href} className="hover:text-[#1D2650]">
                  {item.label}
                </TabLink>
              ) : item.href.startsWith("#") ? (
                <a key={item.label} href={item.href} className="hover:text-[#1D2650]">
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} href={item.href} className="hover:text-[#1D2650]">
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <Link
            href={variant === "home" ? "#beli" : "/#layanan"}
            className="btn-lemon px-4 py-2.5 text-sm"
          >
            {variant === "home" ? "Mulai transaksi" : "Semua layanan"}
          </Link>
        </div>
      </header>
    </>
  );
}
