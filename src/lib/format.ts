export const rp = (v: number) => "Rp" + Math.round(v).toLocaleString("id-ID");

export function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function operator(v: string) {
  v = v.replace(/\D/g, "");
  if (v.length < 4) return "";
  const p = v.slice(0, 4);
  if (/^08(1[1-3]|2[1-3]|5[1-3])/.test(p)) return "Telkomsel";
  if (/^08(1[4-6]|5[5-8])/.test(p)) return "Indosat";
  if (/^08(1[7-9]|59|77|78)/.test(p)) return "XL";
  if (/^083[1-3]|^083[8-9]/.test(p)) return "Axis";
  if (/^089[5-9]/.test(p)) return "Tri";
  if (/^088/.test(p)) return "Smartfren";
  return "";
}
