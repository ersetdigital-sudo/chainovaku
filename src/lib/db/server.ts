import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SERVICE_UNAVAILABLE_MESSAGE,
  mapRpcError,
  toPublicError,
} from "./errors";
import { mapOrderLookupList, mapPaymentInfo } from "./mappers";
import type { DbResult, OrderLookup, PaymentInfo, WebBrand } from "./types";

const CACHE_SECONDS = 60;
const BRAND_COLUMNS =
  "id,nama,slug,domain,tagline,logo_url,warna_utama,wa_cs,qris_image_url,batas_bayar_menit,jam_cek_tagihan";

type Env = { url: string; anonKey: string; brandSlug: string };

type ServiceRow = {
  id: string;
  nama: string;
  slug: string;
  jenis: string;
  input_fields: unknown;
  urutan: number;
};

type ProductRow = {
  id: string;
  service_id: string;
  nama: string;
  harga_jual: number | string;
  urutan: number;
};

type MethodRow = {
  id: string;
  nama: string;
  tipe: string;
  biaya_admin: number | string;
  urutan: number;
};

export type CatalogProduct = {
  id: string;
  nama: string;
  hargaJual: number;
};

export type CatalogService = {
  id: string;
  dbId: string;
  nama: string;
  slug: string;
  jenis: "nominal" | "tagihan";
  inputs: {
    key: string;
    label: string;
    placeholder: string;
    wajib: boolean;
  }[];
  products: CatalogProduct[];
};

export type CatalogMethod = {
  id: string;
  name: string;
  fee: number;
  type: "qr" | "ewallet" | "va";
};

export type PublicCatalog = {
  brand: WebBrand;
  services: CatalogService[];
  methods: CatalogMethod[];
};

function readEnv(): Env | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const brandSlug = process.env.BRAND_SLUG?.trim();
  if (!url || !anonKey || !brandSlug) return null;
  return { url, anonKey, brandSlug };
}

const cachedFetch = ((input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, {
    ...init,
    next: { revalidate: CACHE_SECONDS },
  } as RequestInit)) as typeof fetch;

const liveFetch = ((input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, { ...init, cache: "no-store" })) as typeof fetch;

let cachedClient: SupabaseClient | null = null;
let liveClient: SupabaseClient | null = null;

function getClient(live = false): SupabaseClient | null {
  const env = readEnv();
  if (!env) return null;

  if (live) {
    if (!liveClient) {
      liveClient = createClient(env.url, env.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: { fetch: liveFetch },
      });
    }
    return liveClient;
  }

  if (!cachedClient) {
    cachedClient = createClient(env.url, env.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: { fetch: cachedFetch },
    });
  }
  return cachedClient;
}

function parseInputFields(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const field = item as Record<string, unknown>;
    const key = typeof field.key === "string" ? field.key.trim() : "";
    const label = typeof field.label === "string" ? field.label.trim() : "";
    if (!key || !label) return [];
    return [
      {
        key,
        label,
        placeholder:
          typeof field.placeholder === "string" ? field.placeholder : "",
        wajib: field.wajib === true,
      },
    ];
  });
}

function methodType(tipe: string): CatalogMethod["type"] | null {
  if (tipe === "qr") return "qr";
  if (tipe === "ewallet") return "ewallet";
  if (tipe === "va") return "va";
  return null;
}

export async function getPublicBrand(): Promise<DbResult<WebBrand>> {
  const env = readEnv();
  const client = getClient();
  if (!env || !client) {
    return { data: null, error: SERVICE_UNAVAILABLE_MESSAGE };
  }

  try {
    const { data, error } = await client
      .from("brands")
      .select(BRAND_COLUMNS)
      .eq("slug", env.brandSlug)
      .maybeSingle();

    if (error || !data) {
      return { data: null, error: SERVICE_UNAVAILABLE_MESSAGE };
    }

    const row = data as Record<string, unknown>;
    return {
      data: {
        id: String(row.id),
        nama: String(row.nama),
        slug: String(row.slug),
        domain: String(row.domain),
        tagline: typeof row.tagline === "string" ? row.tagline : null,
        logo_url: typeof row.logo_url === "string" ? row.logo_url : null,
        warna_utama:
          typeof row.warna_utama === "string" ? row.warna_utama : null,
        wa_cs: typeof row.wa_cs === "string" ? row.wa_cs : null,
        qris_image_url:
          typeof row.qris_image_url === "string" ? row.qris_image_url : null,
        batas_bayar_menit: Number(row.batas_bayar_menit) || 15,
        jam_cek_tagihan:
          typeof row.jam_cek_tagihan === "string"
            ? row.jam_cek_tagihan
            : null,
      } as WebBrand,
      error: null,
    };
  } catch {
    return { data: null, error: SERVICE_UNAVAILABLE_MESSAGE };
  }
}

export async function getCatalog(): Promise<DbResult<PublicCatalog>> {
  const brandResult = await getPublicBrand();
  const brand = brandResult.data;
  if (!brand) {
    return {
      data: null,
      error: brandResult.error ?? SERVICE_UNAVAILABLE_MESSAGE,
    };
  }

  const client = getClient();
  if (!client) return { data: null, error: SERVICE_UNAVAILABLE_MESSAGE };

  try {
    const [servicesResult, productsResult, methodsResult] = await Promise.all([
      client
        .from("services")
        .select("id,nama,slug,jenis,input_fields,urutan")
        .eq("brand_id", brand.id)
        .eq("aktif", true)
        .order("urutan", { ascending: true }),
      client
        .from("products")
        .select("id,service_id,nama,harga_jual,urutan")
        .eq("brand_id", brand.id)
        .eq("aktif", true)
        .order("urutan", { ascending: true }),
      client
        .from("payment_methods")
        .select("id,nama,tipe,biaya_admin,urutan")
        .eq("brand_id", brand.id)
        .eq("aktif", true)
        .order("urutan", { ascending: true }),
    ]);

    if (servicesResult.error || productsResult.error || methodsResult.error) {
      return { data: null, error: SERVICE_UNAVAILABLE_MESSAGE };
    }

    const productsByService = new Map<string, CatalogProduct[]>();
    ((productsResult.data ?? []) as ProductRow[]).forEach((product) => {
      const list = productsByService.get(product.service_id) ?? [];
      list.push({
        id: product.id,
        nama: product.nama,
        hargaJual: Number(product.harga_jual),
      });
      productsByService.set(product.service_id, list);
    });

    const services = ((servicesResult.data ?? []) as ServiceRow[]).map(
      (row) =>
        ({
          id: row.slug,
          dbId: row.id,
          nama: row.nama,
          slug: row.slug,
          jenis: row.jenis === "tagihan" ? "tagihan" : "nominal",
          inputs: parseInputFields(row.input_fields),
          products: productsByService.get(row.id) ?? [],
        }) satisfies CatalogService,
    );

    const methods = ((methodsResult.data ?? []) as MethodRow[]).flatMap(
      (row) => {
        const type = methodType(row.tipe);
        if (!type) return [];
        return [
          {
            id: row.id,
            name: row.nama,
            fee: Number(row.biaya_admin) || 0,
            type,
          } satisfies CatalogMethod,
        ];
      },
    );

    return { data: { brand, services, methods }, error: null };
  } catch {
    return { data: null, error: SERVICE_UNAVAILABLE_MESSAGE };
  }
}

export async function getPaymentByRef(
  refInput: string,
): Promise<DbResult<PaymentInfo>> {
  const ref = refInput.trim();
  if (!ref) return { data: null, error: "Kode referensi tidak ditemukan." };

  const client = getClient(true);
  if (!client) return { data: null, error: SERVICE_UNAVAILABLE_MESSAGE };

  try {
    const { data, error } = await client.rpc("get_payment", { p_ref: ref });
    if (error) return { data: null, error: mapRpcError(error).message };
    if (!data) return { data: null, error: SERVICE_UNAVAILABLE_MESSAGE };
    return { data: mapPaymentInfo(data), error: null };
  } catch (error) {
    return { data: null, error: toPublicError(error).message };
  }
}

export async function getOrderByRef(
  refInput: string,
): Promise<DbResult<OrderLookup[]>> {
  const ref = refInput.trim();
  const env = readEnv();
  const client = getClient(true);
  if (!ref || !env || !client) {
    return { data: null, error: SERVICE_UNAVAILABLE_MESSAGE };
  }

  try {
    const { data, error } = await client.rpc("cek_order", {
      p_brand_slug: env.brandSlug,
      p_ref: ref,
      p_nomor_tujuan: null,
    });
    if (error) return { data: null, error: mapRpcError(error).message };
    return { data: mapOrderLookupList(data), error: null };
  } catch (error) {
    return { data: null, error: toPublicError(error).message };
  }
}
