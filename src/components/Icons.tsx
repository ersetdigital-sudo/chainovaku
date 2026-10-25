import type { SVGProps } from "react";
import type { IconName } from "@/lib/icons";

export type { IconName };

type Props = {
  name: IconName;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
} & Omit<SVGProps<SVGSVGElement>, "name">;

export function Icon({
  name,
  size = 18,
  stroke = "currentColor",
  strokeWidth = 1.8,
  ...rest
}: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };

  switch (name) {
    case "phone":
      return (
        <svg {...common}>
          <rect x="6" y="2" width="12" height="20" rx="3" />
          <path d="M11 18h2" />
        </svg>
      );
    case "wifi":
      return (
        <svg {...common}>
          <path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="2" y="6" width="20" height="14" rx="3" />
          <path d="M16 13h2M2 10h20" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </svg>
      );
    case "drop":
      return (
        <svg {...common}>
          <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
        </svg>
      );
    case "tv":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M8 2l4 4 4-4" />
        </svg>
      );
    case "gamepad":
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="11" rx="5" />
          <path d="M7 11v3M5.5 12.5h3M16 12h.01M18 14h.01" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "bank":
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20M6 15h4" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} strokeWidth={3}>
          <path d="M5 12l5 5L20 7" />
        </svg>
      );
    case "spinner":
      return (
        <svg {...common} strokeWidth={2.5}>
          <path d="M12 3a9 9 0 1 0 9 9" />
        </svg>
      );
    case "chevronLeft":
      return (
        <svg {...common} strokeWidth={2.2}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      );
    case "chevronDown":
      return (
        <svg {...common} strokeWidth={2.2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case "shieldCheck":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "zap":
      return (
        <svg {...common}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </svg>
      );
  }
}
