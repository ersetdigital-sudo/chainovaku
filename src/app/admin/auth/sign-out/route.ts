import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { REMEMBER_COOKIE } from "@/modules/admin/constants";
import { adminEnvStatus } from "@/modules/admin/data/env";
import {
  clearRememberPreference,
  createServerSupabase,
} from "@/modules/admin/data/supabase/server";

export const dynamic = "force-dynamic";

async function signOut(request: NextRequest) {
  const target = new URL("/admin/login", request.url);
  const reason = request.nextUrl.searchParams.get("reason");
  if (reason === "inactive" || reason === "no_access") {
    target.searchParams.set("error", reason);
  }

  if (adminEnvStatus().configured) {
    try {
      const supabase = await createServerSupabase();
      await supabase.auth.signOut();
    } catch {
      // Sesi tetap dibersihkan lewat response di bawah.
    }
    try {
      await clearRememberPreference();
    } catch {
      // Cookie dihapus lewat response.
    }
  }

  const response = NextResponse.redirect(target);
  response.cookies.delete(REMEMBER_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  return signOut(request);
}

export async function POST(request: NextRequest) {
  return signOut(request);
}
