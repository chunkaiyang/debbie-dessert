import Link from "next/link";
import { AlertCircle, CakeSlice, CircleDollarSign, Palette } from "lucide-react";
import { AdminShell, StatusBadge } from "@/components/admin-shell";
import { getAdminDashboardData } from "@/lib/admin-data";
import { getOwnerSession } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
const date = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeZone: "Australia/Brisbane" });

export default async function AdminPage() {
  const ownerSession = await getOwnerSession();
  if (!ownerSession.ok) redirect("/admin/login");
  const data = await getAdminDashboardData();
  const pending = data.allOrders.filter((order) => order.status === "pending_confirmation").length;
  const gross = data.allOrders.reduce((sum, order) => sum + order.subtotalCents, 0);
  const nextCommitted = data.nextDate?.committedUnits ?? 0;

  return (
    <AdminShell ownerEmail={ownerSession.user.email ?? "Owner"}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl font-semibold">Good evening, Debbie</h1>
          <p className="mt-2 text-black/55">Live orders, availability and catalogue data.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/availability" className="focus-ring inline-flex min-h-11 items-center rounded-full border border-black/15 bg-white px-5 text-sm font-semibold">Manage availability</Link>
          <Link href="/admin/availability/new" className="focus-ring inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white">Create date</Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [CakeSlice, data.nextDate ? `Cakes due ${date.format(new Date(`${data.nextDate.serviceDate}T00:00:00+10:00`))}` : "No published date", nextCommitted, data.nextDate ? `${Math.max(data.nextDate.capacityUnits - nextCommitted, 0)} capacity remaining` : "Create the next cake date"],
          [Palette, "Active flavours", data.products.filter((product) => product.active).length, "Shown on the storefront"],
          [CircleDollarSign, "Pending confirmation", pending, "Live manual cake orders"],
          [AlertCircle, "Total order value", money.format(gross / 100), `${data.allOrders.length} orders`],
        ].map(([Icon, label, value, note]) => {
          const Component = Icon as typeof CakeSlice;
          return <div key={label as string} className="rounded-2xl border border-black/8 bg-white p-5"><Component size={20} className="text-forest" /><p className="mt-5 text-sm text-black/55">{label as string}</p><p className="display mt-1 text-4xl font-semibold">{value as string | number}</p><p className="mt-2 text-xs text-black/45">{note as string}</p></div>;
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-black/8 bg-white">
          <div className="flex items-center justify-between border-b border-black/8 p-5">
            <div><h2 className="font-semibold">Production list</h2><p className="mt-1 text-xs text-black/45">Confirmed, in-production and ready orders for the next date</p></div>
            <span className="text-sm font-semibold text-forest print:hidden">Print from your browser</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-black/[0.025] text-xs text-black/45"><tr><th className="px-5 py-3">Flavour</th><th className="px-5 py-3">Size</th><th className="px-5 py-3">Quantity</th></tr></thead>
              <tbody className="divide-y divide-black/8">
                {data.production.length ? data.production.map((item) => <tr key={item.flavour}><td className="px-5 py-4 font-semibold">{item.flavour}</td><td className="px-5 py-4">6 inch</td><td className="px-5 py-4">{item.quantity}</td></tr>) : <tr><td colSpan={3} className="px-5 py-8 text-center text-black/45">No confirmed production for the next date.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-black/8 bg-white">
          <div className="flex items-center justify-between border-b border-black/8 p-5"><div><h2 className="font-semibold">Cake dates</h2><p className="mt-1 text-xs text-black/45">Live capacity and pickup windows</p></div><Link href="/admin/availability" className="text-sm font-semibold text-forest">Manage</Link></div>
          <div className="divide-y divide-black/8">
            {data.availability.slice(0, 4).map((item) => <div key={item.id} className="p-5"><div className="flex justify-between gap-4"><div><p className="font-semibold">{date.format(new Date(`${item.serviceDate}T00:00:00+10:00`))}</p><p className="mt-1 text-xs text-black/45">{item.slots.filter((slot) => slot.active).length} pickup slots</p></div><StatusBadge value={item.status} /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-black/8"><div className="h-full rounded-full bg-forest" style={{ width: `${item.capacityUnits ? Math.min(item.committedUnits / item.capacityUnits * 100, 100) : 100}%` }} /></div><div className="mt-2 flex justify-between text-xs text-black/45"><span>{item.committedUnits} committed</span><span>{Math.max(item.capacityUnits - item.committedUnits, 0)} remaining</span></div></div>)}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-black/8 bg-white">
        <div className="flex items-center justify-between border-b border-black/8 p-5"><div><h2 className="font-semibold">Recent cake orders</h2><p className="mt-1 text-xs text-black/45">Synced directly from storefront submissions</p></div><Link href="/admin/orders" className="text-sm font-semibold text-forest">View all</Link></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-black/[0.025] text-xs text-black/45"><tr>{["Order", "Customer", "Pickup date", "Items", "Pickup", "Status", "Total"].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-black/8">
              {data.orders.map((order) => <tr key={order.id}><td className="px-5 py-4 font-semibold">{order.orderNumber}</td><td className="px-5 py-4">{order.customerName}</td><td className="px-5 py-4">{date.format(new Date(`${order.serviceDate}T00:00:00+10:00`))}</td><td className="px-5 py-4">{order.items.map((item) => `${item.quantity} ${item.name}`).join(" · ")}</td><td className="px-5 py-4">{order.pickupLocation}</td><td className="px-5 py-4"><StatusBadge value={order.status} /></td><td className="px-5 py-4">{money.format(order.subtotalCents / 100)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
