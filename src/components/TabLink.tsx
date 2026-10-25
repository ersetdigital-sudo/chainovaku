"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export const TAB_EVENT = "chainovaku:tab";

export function TabLink({
  tab,
  href,
  className,
  children,
}: {
  tab: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (!onHome) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(TAB_EVENT, { detail: tab }));
        window.history.replaceState(null, "", `/?tab=${tab}`);
        document.getElementById("beli")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </Link>
  );
}
