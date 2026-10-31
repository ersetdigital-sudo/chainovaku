import { cn, initials } from "../../lib/utils";

export function BrandMark({
  name,
  logoUrl,
  color,
  size = "md",
  className,
}: {
  name: string;
  logoUrl?: string | null;
  color?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn("adm-brandmark", `adm-brandmark-${size}`, className)}
      style={{ backgroundColor: color || "#3B4FD8" }}
      aria-hidden={logoUrl ? undefined : true}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={`Logo ${name}`} />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  );
}
