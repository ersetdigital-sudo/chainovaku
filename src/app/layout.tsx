import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chainovaku · Isi Ulang & Bayar Tagihan",
  description:
    "Pulsa, paket data, token PLN, top up game, e-wallet, dan bayar tagihan. Proses otomatis 24 jam tanpa daftar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
