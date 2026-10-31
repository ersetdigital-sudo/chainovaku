"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "../../lib/format";

export function Countdown({ expiresAt }: { expiresAt: string | null }) {
  const target = expiresAt ? new Date(expiresAt).getTime() : 0;
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    setRemaining(Math.max(0, target - Date.now()));
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (!expiresAt) return null;

  if (remaining !== null && remaining <= 0) {
    return (
      <div className="adm-note adm-note-warn">
        Waktu bayar sudah habis. Transaksi akan dibatalkan otomatis.
      </div>
    );
  }

  return (
    <div className="adm-note adm-note-warn">
      Sisa waktu bayar{" "}
      <b className="adm-mono">
        {remaining === null ? "--:--:--" : formatDuration(remaining)}
      </b>
      . Lewat dari itu transaksi batal otomatis.
    </div>
  );
}
