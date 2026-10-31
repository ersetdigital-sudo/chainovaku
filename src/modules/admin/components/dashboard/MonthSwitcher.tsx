import Link from "next/link";
import { ChevronLeft, ChevronRight } from "../../icons";
import { monthParts, shiftMonthKey } from "../../lib/format";

export function MonthSwitcher({ monthKey }: { monthKey: string }) {
  const label = monthParts(monthKey);
  return (
    <div className="adm-period" role="group" aria-label="Pilih bulan">
      <Link
        href={`/admin?bulan=${shiftMonthKey(monthKey, -1)}`}
        className="adm-period-btn"
        aria-label="Bulan sebelumnya"
      >
        <ChevronLeft size={18} />
      </Link>
      <span className="adm-period-value">
        <b>{label.month}</b>
        <b>{label.year}</b>
      </span>
      <Link
        href={`/admin?bulan=${shiftMonthKey(monthKey, 1)}`}
        className="adm-period-btn"
        aria-label="Bulan berikutnya"
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}
