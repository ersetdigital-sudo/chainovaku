import type { LucideIcon } from "../../icons";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "adm-empty adm-empty-compact" : "adm-empty"}>
      <span className="adm-empty-icon">
        <Icon size={22} />
      </span>
      <b>{title}</b>
      <p>{description}</p>
      {action}
    </div>
  );
}
