"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "../../lib/utils";
import type {
  ActionResult,
  BillSettingsDraft,
  ProductDraft,
  ServiceDraft,
  ServiceInputField,
} from "../../types";
import { requireAdmin } from "../auth";

function refreshCatalog() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/produk");
}

function dbError(error: { message?: string; code?: string } | null): string {
  if (error?.code === "23505") {
    return "Nama tersebut sudah dipakai. Gunakan nama lain.";
  }
  const message = error?.message ?? "";
  if (/wajib|tidak|ditolak|ditemukan|nominal|harga|layanan/i.test(message)) {
    return message;
  }
  return "Gagal menyimpan perubahan. Coba lagi.";
}

function normalizeFields(fields: ServiceDraft["inputFields"]): ServiceInputField[] {
  const used = new Set<string>();
  return fields.map((field, index) => {
    const label = field.label.trim();
    let base =
      field.key && /^[a-z0-9_]+$/.test(field.key)
        ? field.key
        : slugify(label).replace(/-/g, "_");
    if (!base) base = `kolom_${index + 1}`;
    let key = base;
    let suffix = 2;
    while (used.has(key)) {
      key = `${base}_${suffix}`;
      suffix += 1;
    }
    used.add(key);
    return {
      key,
      label,
      placeholder: field.placeholder.trim(),
      wajib: field.wajib,
    };
  });
}

function validateServiceDraft(draft: ServiceDraft): string | null {
  if (!draft.nama.trim()) return "Nama layanan wajib diisi.";
  if (!["nominal", "tagihan"].includes(draft.jenis)) return "Jenis layanan tidak valid.";
  if (!Number.isFinite(draft.urutan)) return "Urutan tidak valid.";
  if (draft.inputFields.length === 0) {
    return "Tambahkan minimal satu kolom input pembeli.";
  }
  if (draft.inputFields.some((field) => !field.label.trim())) {
    return "Label kolom input wajib diisi.";
  }
  return null;
}

async function uniqueServiceSlug(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  brandId: string,
  nama: string,
): Promise<string> {
  const base = slugify(nama) || `layanan-${Date.now()}`;
  let slug = base;
  for (let attempt = 2; attempt < 50; attempt += 1) {
    const { data } = await supabase
      .from("services")
      .select("id")
      .eq("brand_id", brandId)
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${attempt}`;
  }
  return `${base}-${Date.now()}`;
}

export async function createServiceAction(
  draft: ServiceDraft,
): Promise<ActionResult<{ id: string }>> {
  const validation = validateServiceDraft(draft);
  if (validation) return { ok: false, message: validation };

  const { brand, supabase } = await requireAdmin();
  const slug = await uniqueServiceSlug(supabase, brand.id, draft.nama);

  const { data, error } = await supabase
    .from("services")
    .insert({
      brand_id: brand.id,
      nama: draft.nama.trim(),
      slug,
      jenis: draft.jenis,
      input_fields: normalizeFields(draft.inputFields),
      urutan: Math.round(draft.urutan),
      aktif: draft.aktif,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, message: dbError(error) };

  refreshCatalog();
  return {
    ok: true,
    message: "Layanan berhasil ditambahkan.",
    data: { id: data.id as string },
  };
}

export async function updateServiceAction(
  serviceId: string,
  draft: ServiceDraft,
): Promise<ActionResult> {
  const validation = validateServiceDraft(draft);
  if (validation) return { ok: false, message: validation };
  if (!serviceId) return { ok: false, message: "Layanan tidak ditemukan." };

  const { brand, supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("services")
    .update({
      nama: draft.nama.trim(),
      jenis: draft.jenis,
      input_fields: normalizeFields(draft.inputFields),
      urutan: Math.round(draft.urutan),
      aktif: draft.aktif,
    })
    .eq("id", serviceId)
    .eq("brand_id", brand.id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: dbError(error) };
  if (!data) return { ok: false, message: "Layanan tidak ditemukan." };

  refreshCatalog();
  return { ok: true, message: "Layanan berhasil diperbarui." };
}

export async function saveProductAction(
  draft: ProductDraft,
): Promise<ActionResult> {
  if (!draft.nama.trim()) return { ok: false, message: "Nama nominal wajib diisi." };
  if (!Number.isFinite(draft.harga_modal) || draft.harga_modal < 0) {
    return { ok: false, message: "Harga modal tidak valid." };
  }
  if (!Number.isFinite(draft.harga_jual) || draft.harga_jual < 0) {
    return { ok: false, message: "Harga jual tidak valid." };
  }
  if (!draft.serviceId) return { ok: false, message: "Layanan tidak ditemukan." };

  const { brand, supabase } = await requireAdmin();
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id,jenis")
    .eq("id", draft.serviceId)
    .eq("brand_id", brand.id)
    .maybeSingle();
  if (serviceError) return { ok: false, message: dbError(serviceError) };
  if (!service) return { ok: false, message: "Layanan tidak ditemukan." };
  if (service.jenis !== "nominal") {
    return { ok: false, message: "Nominal hanya bisa ditambahkan ke layanan nominal." };
  }

  const payload = {
    brand_id: brand.id,
    service_id: draft.serviceId,
    nama: draft.nama.trim(),
    harga_modal: Math.round(draft.harga_modal),
    harga_jual: Math.round(draft.harga_jual),
    urutan: Math.round(draft.urutan),
    aktif: draft.aktif,
  };

  if (draft.id) {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", draft.id)
      .eq("brand_id", brand.id)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, message: dbError(error) };
    if (!data) return { ok: false, message: "Nominal tidak ditemukan." };
  } else {
    const { error } = await supabase.from("products").insert(payload);
    if (error) return { ok: false, message: dbError(error) };
  }

  refreshCatalog();
  return {
    ok: true,
    message: draft.id ? "Nominal berhasil diperbarui." : "Nominal berhasil ditambahkan.",
  };
}

export async function toggleProductAction(
  productId: string,
  aktif: boolean,
): Promise<ActionResult> {
  if (!productId) return { ok: false, message: "Nominal tidak ditemukan." };
  const { brand, supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .update({ aktif })
    .eq("id", productId)
    .eq("brand_id", brand.id)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, message: dbError(error) };
  if (!data) return { ok: false, message: "Nominal tidak ditemukan." };

  refreshCatalog();
  return {
    ok: true,
    message: aktif ? "Nominal diaktifkan." : "Nominal dinonaktifkan dari web.",
  };
}

export async function saveBillSettingsAction(
  draft: BillSettingsDraft,
): Promise<ActionResult> {
  if (!draft.serviceId) return { ok: false, message: "Layanan tidak ditemukan." };
  if (!Number.isFinite(draft.biaya_admin) || draft.biaya_admin < 0) {
    return { ok: false, message: "Biaya admin tidak valid." };
  }
  if (!Number.isFinite(draft.biaya_supplier) || draft.biaya_supplier < 0) {
    return { ok: false, message: "Biaya supplier tidak valid." };
  }

  const { brand, supabase } = await requireAdmin();
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id,jenis")
    .eq("id", draft.serviceId)
    .eq("brand_id", brand.id)
    .maybeSingle();
  if (serviceError) return { ok: false, message: dbError(serviceError) };
  if (!service) return { ok: false, message: "Layanan tidak ditemukan." };
  if (service.jenis !== "tagihan") {
    return { ok: false, message: "Pengaturan ini khusus layanan tagihan." };
  }

  const { error: serviceUpdateError } = await supabase
    .from("services")
    .update({
      biaya_admin: Math.round(draft.biaya_admin),
      biaya_supplier: Math.round(draft.biaya_supplier),
    })
    .eq("id", draft.serviceId)
    .eq("brand_id", brand.id);
  if (serviceUpdateError) {
    return { ok: false, message: dbError(serviceUpdateError) };
  }

  const { error: brandUpdateError } = await supabase
    .from("brands")
    .update({ jam_cek_tagihan: draft.jam_cek_tagihan.trim() || null })
    .eq("id", brand.id);
  if (brandUpdateError) {
    return { ok: false, message: dbError(brandUpdateError) };
  }

  refreshCatalog();
  return { ok: true, message: "Pengaturan tagihan disimpan." };
}
