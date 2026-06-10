import Link from "next/link";
import { AlertCircle, CakeSlice, CircleDollarSign, Palette } from "lucide-react";
import { AdminShell, StatusBadge } from "@/components/admin-shell";
import { getAdminDashboardData } from "@/lib/admin-data";
import { getOwnerSession } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
const date = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeZone: "Australia/Brisbane" });
const cutoffDateTime = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Australia/Brisbane",
});

const productionState = {
  taking_orders: {
    label: "Taking orders",
    className: "bg-green-100 text-green-800",
  },
  ordering_closed: {
    label: "Ordering closed",
    className: "bg-black/10 text-black/60",
  },
  draft: {
    label: "Draft",
    className: "bg-amber-100 text-amber-800",
  },
} as const;

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
          [CakeSlice, data.nextDate ? `Cakes due ${date.format(new Date(`${data.nextDate.serviceDate}T00:00:00+10:00`))}` : "No published date", nextCommitted, data.nextDate ? `${Math.max(data.nextDate.capacityUnits - nextCommitted, 0)} capacity remaining` : "Create the next cake date", "bg-forest text-white", "bg-white/15 text-white"],
          [Palette, "Active flavours", data.products.filter((product) => product.active).length, "Shown on the storefront", "bg-sage text-white", "bg-white/15 text-white"],
          [CircleDollarSign, "Pending confirmation", pending, "Live manual cake orders", "bg-caramel text-white", "bg-white/15 text-white"],
          [AlertCircle, "Total order value", money.format(gross / 100), `${data.allOrders.length} orders`, "bg-blush text-cocoa", "bg-cocoa/10 text-cocoa"],
        ].map(([Icon, label, value, note, cardClass, iconClass]) => {
          const Component = Icon as typeof CakeSlice;
          return (
            <div key={label as string} className={`rounded-2xl p-5 shadow-sm ${cardClass as string}`}>
              <span className={`grid size-10 place-items-center rounded-full ${iconClass as string}`}><Component size={19} /></span>
              <p className="mt-5 text-sm opacity-80">{label as string}</p>
              <p className="display mt-1 text-4xl font-semibold">{value as string | number}</p>
              <p className="mt-2 text-xs opacity-70">{note as string}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="min-w-0 rounded-2xl border border-black/8 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl bg-forest p-5 text-white">
            <div><h2 className="display text-2xl font-semibold">Upcoming production</h2><p className="mt-1 text-xs text-white/70">Confirmed production and pending demand grouped by pickup date</p></div>
            <span className="hidden text-sm font-semibold text-white/80 print:hidden sm:inline">Print from your browser</span>
          </div>
          <div className="divide-y divide-black/8">
            {data.production.length ? data.production.map((productionDate) => {
              const state = productionState[productionDate.orderingState];
              return (
                <article key={productionDate.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{date.format(new Date(`${productionDate.serviceDate}T00:00:00+10:00`))}</h3>
                      <p className="mt-1 text-xs text-black/45">Ordering cutoff: {cutoffDateTime.format(new Date(productionDate.orderingCutoffAt))}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${state.className}`}>{state.label}</span>
                  </div>
                  <div className="mt-4 space-y-3 sm:hidden">
                    {productionDate.items.length ? productionDate.items.map((item) => (
                      <div key={item.flavour} className="rounded-xl border border-black/8 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">{item.flavour}</p>
                          <span className="text-xs text-black/45">6 inch</span>
                        </div>
                        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg bg-forest/5 p-2">
                            <dt className="text-[11px] text-black/45">Confirmed</dt>
                            <dd className="mt-1 font-semibold text-forest">{item.confirmedQuantity}</dd>
                          </div>
                          <div className="rounded-lg bg-amber-50 p-2">
                            <dt className="text-[11px] text-black/45">Pending</dt>
                            <dd className="mt-1 font-semibold text-amber-700">{item.pendingQuantity}</dd>
                          </div>
                          <div className="rounded-lg bg-black/[0.035] p-2">
                            <dt className="text-[11px] text-black/45">Potential</dt>
                            <dd className="mt-1 font-semibold">{item.potentialQuantity}</dd>
                          </div>
                        </dl>
                      </div>
                    )) : <p className="rounded-xl border border-black/8 px-4 py-6 text-center text-sm text-black/45">No confirmed or pending cakes for this date.</p>}
                  </div>
                  <div className="mt-4 hidden overflow-x-auto rounded-xl border border-black/8 sm:block">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="bg-black/[0.025] text-xs text-black/45">
                        <tr>
                          <th className="px-4 py-3 font-medium">Flavour</th>
                          <th className="px-4 py-3 font-medium">Size</th>
                          <th className="px-4 py-3 text-right font-medium">Confirmed</th>
                          <th className="px-4 py-3 text-right font-medium">Pending</th>
                          <th className="px-4 py-3 text-right font-medium">Potential total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/8">
                        {productionDate.items.length ? productionDate.items.map((item) => (
                          <tr key={item.flavour}>
                            <td className="px-4 py-3 font-semibold">{item.flavour}</td>
                            <td className="px-4 py-3">6 inch</td>
                            <td className="px-4 py-3 text-right font-semibold text-forest">{item.confirmedQuantity}</td>
                            <td className="px-4 py-3 text-right text-amber-700">{item.pendingQuantity}</td>
                            <td className="px-4 py-3 text-right font-semibold">{item.potentialQuantity}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="px-4 py-6 text-center text-black/45">No confirmed or pending cakes for this date.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>
              );
            }) : <p className="p-8 text-center text-sm text-black/45">No upcoming production dates.</p>}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-black/8 bg-white">
          <div className="flex items-center justify-between rounded-t-2xl bg-forest p-5 text-white"><div><h2 className="display text-2xl font-semibold">Cake dates</h2><p className="mt-1 text-xs text-white/70">Live capacity and pickup windows</p></div><Link href="/admin/availability" className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/25">Manage</Link></div>
          <div className="divide-y divide-black/8">
            {data.availability.slice(0, 4).map((item) => <div key={item.id} className="p-5"><div className="flex justify-between gap-4"><div><p className="font-semibold">{date.format(new Date(`${item.serviceDate}T00:00:00+10:00`))}</p><p className="mt-1 text-xs text-black/45">{item.slots.filter((slot) => slot.active).length} pickup slots</p></div><StatusBadge value={item.status} /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-black/8"><div className="h-full rounded-full bg-forest" style={{ width: `${item.capacityUnits ? Math.min(item.committedUnits / item.capacityUnits * 100, 100) : 100}%` }} /></div><div className="mt-2 flex justify-between text-xs text-black/45"><span>{item.committedUnits} committed</span><span>{Math.max(item.capacityUnits - item.committedUnits, 0)} remaining</span></div></div>)}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-black/8 bg-white">
        <div className="flex items-center justify-between rounded-t-2xl bg-forest p-5 text-white"><div><h2 className="display text-2xl font-semibold">Recent cake orders</h2><p className="mt-1 text-xs text-white/70">Synced directly from storefront submissions</p></div><Link href="/admin/orders" className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/25">View all</Link></div>
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
