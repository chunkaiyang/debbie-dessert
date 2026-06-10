import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell, StatusBadge } from "@/components/admin-shell";
import { getAdminAvailability } from "@/lib/admin-data";
import { getOwnerSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const date = new Intl.DateTimeFormat("en-AU", { dateStyle: "full", timeZone: "Australia/Brisbane" });

export default async function AvailabilityPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const owner = await getOwnerSession();
  if (!owner.ok) redirect("/admin/login");
  const dates = await getAdminAvailability();
  const params = await searchParams;
  return (
    <AdminShell ownerEmail={owner.user.email ?? "Owner"}>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="display text-5xl font-semibold">Availability</h1><p className="mt-2 text-black/55">Publish cake dates, capacity and pickup windows.</p></div><Link href="/admin/availability/new" className="inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white">Create date</Link></div>
      {params.error ? <p role="alert" className="mt-5 rounded-xl bg-red-100 p-4 text-sm text-red-800">{decodeURIComponent(params.error)}</p> : null}
      <div className="mt-7 grid gap-5">
        {dates.map((item) => (
          <article key={item.id} className="rounded-2xl border border-black/8 bg-white p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div><div className="flex items-center gap-3"><h2 className="text-lg font-semibold">{date.format(new Date(`${item.serviceDate}T00:00:00+10:00`))}</h2><StatusBadge value={item.status} /></div><p className="mt-2 text-sm text-black/50">{item.committedUnits} committed · {Math.max(item.capacityUnits - item.committedUnits, 0)} of {item.capacityUnits} remaining</p></div>
              <Link href={`/admin/availability/${item.id}`} className="inline-flex min-h-10 items-center rounded-full border border-black/15 px-4 text-sm font-semibold">Edit date</Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {item.slots.map((slot) => <div key={slot.id} className={`rounded-xl bg-[#f4f1ec] p-4 text-sm ${slot.active ? "" : "opacity-50"}`}><p className="font-semibold">{slot.locationName}</p><p className="mt-1 text-black/50">{slot.address}</p><p className="mt-2">{new Intl.DateTimeFormat("en-AU", { timeStyle: "short", timeZone: "Australia/Brisbane" }).format(new Date(slot.startsAt))}–{new Intl.DateTimeFormat("en-AU", { timeStyle: "short", timeZone: "Australia/Brisbane" }).format(new Date(slot.endsAt))}</p></div>)}
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
