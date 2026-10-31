export function txHref({
  status = "all",
  q = "",
  page = 1,
  sel,
}: {
  status?: string;
  q?: string;
  page?: number;
  sel?: string;
}): string {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (q.trim()) params.set("q", q.trim());
  if (page > 1) params.set("page", String(page));
  if (sel) params.set("sel", sel);
  const query = params.toString();
  return query ? `/admin/transaksi?${query}` : "/admin/transaksi";
}

export function exportHref({
  status = "all",
  q = "",
}: {
  status?: string;
  q?: string;
}): string {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (q.trim()) params.set("q", q.trim());
  const query = params.toString();
  return query
    ? `/admin/transaksi/export?${query}`
    : "/admin/transaksi/export";
}
