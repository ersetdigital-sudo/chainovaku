export const SERVICE_UNAVAILABLE_MESSAGE =
  "Layanan lagi gangguan, coba lagi sebentar.";

export type PublicErrorCode = "not_found" | "unavailable" | "business";

export class PublicDbError extends Error {
  code: PublicErrorCode;

  constructor(message: string, code: PublicErrorCode) {
    super(message);
    this.name = "PublicDbError";
    this.code = code;
  }
}

const BUSINESS_MESSAGE_PATTERN =
  /voucher|produk|layanan|nomor|denda|nominal|wajib|tidak tersedia|tidak valid|terlalu banyak|batas|brand|order/i;

export function mapRpcError(error: { message?: string } | null): PublicDbError {
  const message = error?.message?.trim() ?? "";
  if (/order tidak ditemukan/i.test(message)) {
    return new PublicDbError("Kode referensi tidak ditemukan.", "not_found");
  }
  if (message && BUSINESS_MESSAGE_PATTERN.test(message)) {
    return new PublicDbError(message, "business");
  }
  return new PublicDbError(SERVICE_UNAVAILABLE_MESSAGE, "unavailable");
}

export function toPublicError(error: unknown): PublicDbError {
  if (error instanceof PublicDbError) return error;
  return new PublicDbError(SERVICE_UNAVAILABLE_MESSAGE, "unavailable");
}
