import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { REMEMBER_COOKIE } from "../../constants";
import { requireAdminEnv } from "../env";

const REMEMBER_DAYS = 30;
const REMEMBER_SECONDS = 60 * 60 * 24 * REMEMBER_DAYS;

export async function createServerSupabase(options?: { remember?: boolean }) {
  const env = requireAdminEnv();
  const cookieStore = await cookies();
  const remember =
    options?.remember ?? cookieStore.get(REMEMBER_COOKIE)?.value === "1";

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
            if (!value) {
              cookieStore.set(name, "", {
                ...cookieOptions,
                maxAge: 0,
                expires: new Date(0),
              });
              return;
            }
            const nextOptions = { ...cookieOptions };
            if (remember) {
              nextOptions.maxAge = REMEMBER_SECONDS;
            } else {
              delete nextOptions.maxAge;
              delete nextOptions.expires;
            }
            cookieStore.set(name, value, nextOptions);
          });
        } catch {
          // Server Component tidak boleh menulis cookie; refresh tetap berlaku untuk request ini.
        }
      },
    },
  });
}

export function createAnonSupabase() {
  const env = requireAdminEnv();
  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function setRememberPreference(remember: boolean) {
  const cookieStore = await cookies();
  if (remember) {
    cookieStore.set(REMEMBER_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: REMEMBER_SECONDS,
    });
  } else {
    cookieStore.delete(REMEMBER_COOKIE);
  }
}

export async function clearRememberPreference() {
  const cookieStore = await cookies();
  cookieStore.delete(REMEMBER_COOKIE);
}
