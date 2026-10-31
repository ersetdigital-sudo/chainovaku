import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@/modules/admin/styles/admin.css";
import "@/modules/admin/styles/pages.css";
import "@/modules/admin/styles/catalog.css";
import "@/modules/admin/styles/management.css";

export const metadata: Metadata = {
  title: {
    default: "Admin Panel",
    template: "%s — Admin",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-root" data-admin-root>
      {children}
    </div>
  );
}
