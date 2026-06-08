"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function signInOwner(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=setup");

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=invalid");

  const { data: isOwner, error: ownerError } = await supabase.rpc("is_owner");
  if (ownerError || !isOwner) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  redirect("/admin");
}

export async function signOutOwner() {
  const supabase = await getSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
