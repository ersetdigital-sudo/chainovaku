import type { LucideIcon } from "../../icons";
import { cn } from "../../lib/utils";

export function PageHero({
  icon: Icon,
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("adm-hero", className)}>
      <div className="adm-hero-row">
        <div className="adm-hero-title">
          <span className="adm-tile">
            <Icon size={28} strokeWidth={1.8} />
          </span>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        {actions ? <div className="adm-hero-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
