import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export const getSupabaseServerClient = cache(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always persist refreshed cookies.
        }
      },
    },
  });
});

export type OwnerSession =
  | { ok: true; user: User }
  | { ok: false; reason: "not_configured" | "not_signed_in" | "not_owner" | "auth_error" };

export const getOwnerSession = cache(async (): Promise<OwnerSession> => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) return { ok: false, reason: "auth_error" };
  if (!user) return { ok: false, reason: "not_signed_in" };

  const { data: isOwner, error: ownerError } = await supabase.rpc("is_owner");
  if (ownerError) return { ok: false, reason: "auth_error" };
  if (!isOwner) return { ok: false, reason: "not_owner" };

  return { ok: true, user };
});
