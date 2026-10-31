"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SERVICE_UNAVAILABLE_MESSAGE,
  PublicDbError,
  mapRpcError,
  toPublicError,
} from "./errors";
import {
  mapCreateBill,
  mapCreateOrder,
  mapOrderLookupList,
  mapPaymentInfo,
  mapVoucherCheck,
} from "./mappers";
import type {
  CheckOrderInput,
  CheckVoucherInput,
  CreateBillCheckInput,
  CreateBillResult,
  CreateOrderInput,
  CreateOrderResult,
  OrderLookup,
  PaymentInfo,
  VoucherCheck,
} from "./types";

let browserClient: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new PublicDbError(SERVICE_UNAVAILABLE_MESSAGE, "unavailable");
  }

  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return browserClient;
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  try {
    const { data, error } = await getClient().rpc(fn, args);
    if (error) throw mapRpcError(error);
    return data as T;
  } catch (error) {
    throw toPublicError(error);
  }
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const data = await rpc<unknown>("create_order", {
    p_brand_slug: input.brandSlug,
    p_service_id: input.serviceId,
    p_product_id: input.productId,
    p_nomor_tujuan: input.nomorTujuan,
    p_input: input.input,
    p_payment_method_id: input.paymentMethodId,
    p_voucher_kode: input.voucherCode ?? null,
  });
  const result = mapCreateOrder(data);
  if (!result.ref || !result.expires_at) {
    throw new PublicDbError(SERVICE_UNAVAILABLE_MESSAGE, "unavailable");
  }
  return result;
}

export async function createBillCheck(
  input: CreateBillCheckInput,
): Promise<CreateBillResult> {
  const data = await rpc<unknown>("create_bill_check", {
    p_brand_slug: input.brandSlug,
    p_service_id: input.serviceId,
    p_nomor_tujuan: input.nomorTujuan,
    p_input: input.input,
    p_wa_pembeli: input.waPembeli,
    p_payment_method_id: input.paymentMethodId,
    p_voucher_kode: input.voucherCode ?? null,
  });
  const result = mapCreateBill(data);
  if (!result.ref) {
    throw new PublicDbError(SERVICE_UNAVAILABLE_MESSAGE, "unavailable");
  }
  return result;
}

export async function getPayment(ref: string): Promise<PaymentInfo> {
  const data = await rpc<unknown>("get_payment", { p_ref: ref.trim() });
  return mapPaymentInfo(data);
}

export async function checkOrder(input: CheckOrderInput): Promise<OrderLookup[]> {
  const data = await rpc<unknown>("cek_order", {
    p_brand_slug: input.brandSlug,
    p_ref: input.ref?.trim() || null,
    p_nomor_tujuan: input.nomorTujuan?.trim() || null,
  });
  return mapOrderLookupList(data);
}

export async function checkVoucher(
  input: CheckVoucherInput,
): Promise<VoucherCheck> {
  const data = await rpc<unknown>("cek_voucher", {
    p_brand_slug: input.brandSlug,
    p_kode: input.code.trim().toUpperCase(),
    p_service_id: input.serviceId ?? null,
    p_subtotal: input.subtotal ?? 0,
  });
  return mapVoucherCheck(data);
}
