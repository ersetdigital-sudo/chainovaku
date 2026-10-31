import { STATUS_META } from "../../constants";
import type { OrderStatus } from "../../types";

export function StatusPill({
  status,
  label,
}: {
  status: OrderStatus;
  label?: string;
}) {
  return (
    <span className={STATUS_META[status].pill}>{label ?? STATUS_META[status].label}</span>
  );
}
