"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  TicketPercent,
  X,
  type LucideIcon,
} from "../../icons";
import { cn } from "../../lib/utils";
import { ToastProvider } from "../providers/ToastProvider";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: boolean;
};

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "UTAMA",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "PENJUALAN",
    items: [
      {
        href: "/admin/transaksi",
        label: "Transaksi",
        icon: ReceiptText,
        badge: true,
      },
      { href: "/admin/produk", label: "Produk & Harga", icon: Package },
      { href: "/admin/voucher", label: "Voucher", icon: TicketPercent },
    ],
  },
  {
    label: "PENGATURAN",
    items: [
      {
        href: "/admin/pengaturan",
        label: "Pembayaran & Brand",
        icon: CreditCard,
      },
    ],
  },
];

export function AdminShell({
  brandName,
  actionCount,
  children,
}: {
  brandName: string;
  actionCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const active = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <ToastProvider>
      <div className="adm-app">
        <header className="adm-topbar">
          <button
            type="button"
            className="adm-icon-btn adm-burger"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            aria-expanded={open}
            aria-controls="adm-sidebar"
          >
            <Menu size={22} />
          </button>
          <b>{brandName} Admin</b>
        </header>

        {open ? (
          <button
            type="button"
            className="adm-shade"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <aside
          id="adm-sidebar"
          className={cn("adm-side", open && "is-open")}
          aria-label="Navigasi admin"
        >
          <button
            type="button"
            className="adm-icon-btn adm-side-close"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>

          <div className="adm-side-brand">
            <b>{brandName}</b>
            <span>ADMIN</span>
          </div>

          <nav className="adm-nav">
            {GROUPS.map((group) => (
              <div key={group.label} className="adm-nav-group">
                <div className="adm-nav-label">{group.label}</div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn("adm-nav-link", isActive && "is-active")}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      <Icon size={20} strokeWidth={1.9} />
                      <span>{item.label}</span>
                      {item.badge && actionCount > 0 ? (
                        <span className="adm-nav-badge">{actionCount}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="adm-side-foot">
            <form action="/admin/auth/sign-out" method="post">
              <button type="submit" className="adm-nav-link">
                <LogOut size={20} strokeWidth={1.9} />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </aside>

        <main className="adm-main">{children}</main>
      </div>
    </ToastProvider>
  );
}
