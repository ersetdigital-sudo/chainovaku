"use client";

import { cn } from "../../lib/utils";

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cn("adm-switch", checked && "is-on")}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}
