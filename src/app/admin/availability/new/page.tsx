import { redirect } from "next/navigation";
import { AdminAvailabilityForm } from "@/components/admin-availability-form";
import { AdminShell } from "@/components/admin-shell";
import { getAdminPickupLocations } from "@/lib/admin-data";
import { getOwnerSession } from "@/lib/supabase/server";

export default async function NewAvailabilityPage() {
  const owner = await getOwnerSession();
  if (!owner.ok) redirect("/admin/login");
  const savedLocations = await getAdminPickupLocations();
  return <AdminShell ownerEmail={owner.user.email ?? "Owner"}><h1 className="display text-5xl font-semibold">Create cake date</h1><p className="mt-2 text-black/55">Start as a draft, then publish when details are ready.</p><AdminAvailabilityForm savedLocations={savedLocations} /></AdminShell>;
}
