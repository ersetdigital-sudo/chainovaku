"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, RefreshCw } from "../../icons";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="adm-btn"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? (
        <Loader2 size={18} className="adm-spin" />
      ) : (
        <RefreshCw size={18} />
      )}
      {pending ? "Memuat..." : "Muat ulang"}
    </button>
  );
}
