import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/modules/admin/data/auth";
import { uploadBrandAsset } from "@/modules/admin/data/settings";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind");
  if (kind !== "logo" && kind !== "qris") {
    return NextResponse.json({ error: "Jenis gambar tidak valid." }, { status: 400 });
  }

  const { brand, supabase } = await requireAdmin();

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File gambar tidak ditemukan." }, { status: 400 });
    }

    const result = await uploadBrandAsset({
      supabase,
      brandId: brand.id,
      kind,
      file,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.url });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengupload gambar. Coba lagi." },
      { status: 500 },
    );
  }
}
