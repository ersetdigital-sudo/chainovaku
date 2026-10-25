"use client";

import { useState } from "react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard?.writeText(code);
        } catch {
          /* clipboard unavailable */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1D2650] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#2A428C] transition"
    >
      <span className="font-mono tracking-wide">{code}</span>
      <span className="text-[#FFEF4D]">{copied ? "Tersalin" : "Salin"}</span>
    </button>
  );
}
