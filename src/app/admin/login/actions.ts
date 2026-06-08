"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function signInOwner(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/admin");

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=invalid");
  redirect("/admin");
}
