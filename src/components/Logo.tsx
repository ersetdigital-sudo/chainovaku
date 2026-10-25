export function Logo({ variant = "default" }: { variant?: "default" | "light" }) {
  const ink = variant === "light" ? "#fff" : "#1D2650";

  return (
    <span className="flex items-center gap-2.5" data-logo="chain-c">
      <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#2A428C" />
        <path
          d="M27 12.8a8.8 8.8 0 1 0 .4 14.2"
          fill="none"
          stroke="#FFEF4D"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <rect x="23.2" y="10.8" width="6.6" height="4.4" rx="2.2" fill="#FFEF4D" />
        <rect x="23.4" y="24.8" width="6.6" height="4.4" rx="2.2" fill="#FFEF4D" />
      </svg>
      <span className="flex items-center gap-1.5">
        <span className="disp text-[19px] font-bold tracking-[-.05em]" style={{ color: ink }}>
          chainovaku
        </span>
        <span className="rounded-[4px] bg-[#FFEF4D] px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[.12em] text-[#1D2650]">
          PPOB
        </span>
      </span>
    </span>
  );
}
