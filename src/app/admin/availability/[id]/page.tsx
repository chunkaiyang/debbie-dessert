import { notFound, redirect } from "next/navigation";
import { AdminAvailabilityForm } from "@/components/admin-availability-form";
import { AdminShell } from "@/components/admin-shell";
import { getAdminAvailability, getAdminPickupLocations } from "@/lib/admin-data";
import { getOwnerSession } from "@/lib/supabase/server";

export default async function EditAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const owner = await getOwnerSession();
  if (!owner.ok) redirect("/admin/login");
  const { id } = await params;
  const [availabilityDates, savedLocations] = await Promise.all([getAdminAvailability(), getAdminPickupLocations()]);
  const availability = availabilityDates.find((item) => item.id === id);
  if (!availability) notFound();
  return <AdminShell ownerEmail={owner.user.email ?? "Owner"}><h1 className="display text-5xl font-semibold">Edit cake date</h1><p className="mt-2 text-black/55">Changes publish to the storefront immediately.</p><AdminAvailabilityForm availability={availability} savedLocations={savedLocations} /></AdminShell>;
}
