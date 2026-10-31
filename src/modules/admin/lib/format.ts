import type { Numeric } from "../types";

export const JAKARTA_TZ = "Asia/Jakarta";

const numberFormat = new Intl.NumberFormat("id-ID");
const dateFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: JAKARTA_TZ,
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: JAKARTA_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const dateTimeFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: JAKARTA_TZ,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function toNumber(value: Numeric | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatRupiah(value: Numeric | null | undefined): string {
  const rounded = Math.round(toNumber(value));
  return `${rounded < 0 ? "-" : ""}Rp${numberFormat.format(Math.abs(rounded))}`;
}

export function formatNumber(value: Numeric | null | undefined): string {
  return numberFormat.format(toNumber(value));
}

export function formatInteger(value: number | null | undefined): string {
  return numberFormat.format(Math.max(0, Math.round(value ?? 0)));
}

export function formatPercent(value: Numeric | null | undefined): string {
  const parsed = toNumber(value);
  return `${parsed.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return dateFormat.format(new Date(value));
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "-";
  return timeFormat.format(new Date(value)).replace(":", ".");
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return dateTimeFormat.format(new Date(value)).replace(":", ".");
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function jakartaParts(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
}

export function currentMonthKey(): string {
  const parts = jakartaParts();
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

export function isValidMonthKey(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return false;
  const month = Number(value.slice(5, 7));
  return month >= 1 && month <= 12;
}

export function shiftMonthKey(key: string, delta: number): string {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7));
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1, 12));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthParts(key: string): { month: string; year: string } {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1, 12));
  return {
    month: new Intl.DateTimeFormat("id-ID", {
      timeZone: "UTC",
      month: "long",
    }).format(date),
    year: new Intl.DateTimeFormat("id-ID", {
      timeZone: "UTC",
      year: "numeric",
    }).format(date),
  };
}

export function monthDatabaseValue(key: string): string {
  return `${key}-01`;
}

export function formatWaDisplay(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "-";
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  return digits;
}

export function formatInputValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
