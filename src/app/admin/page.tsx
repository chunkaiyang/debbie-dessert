import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, CalendarDays, CakeSlice, ChevronRight, CircleDollarSign, Clock, Palette, Users } from "lucide-react";
import { adminOrders, cakeDates, classSessions } from "@/lib/site-data";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

const production = [
  { flavour: "Original", size: '6"', quantity: 3 },
  { flavour: "Chocolate", size: '6"', quantity: 1 },
  { flavour: "Taro", size: '6"', quantity: 3 },
];

export default async function AdminPage() {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!.auth.getUser();
    if (!data.user) redirect("/admin/login");
  }
  const totalCakes = production.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="min-h-screen bg-[#f4f1ec] text-[#2e2925]">
      <div className="border-b border-black/10 bg-white">
        <div className="container-shell flex min-h-20 items-center justify-between gap-4">
          <div><p className="display text-2xl font-semibold">Owner dashboard</p><p className="text-xs text-black/50">Debbie Dessert · Australia/Brisbane</p></div>
          <div className="flex items-center gap-3"><span className="hidden text-sm text-black/55 sm:inline">Demo owner</span><div className="flex size-10 items-center justify-center rounded-full bg-forest font-semibold text-white">D</div></div>
        </div>
      </div>
      <div className="container-shell py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="display text-5xl font-semibold">Good evening, Debbie</h1><p className="mt-2 text-black/55">Here is what needs your attention next.</p></div>
          <div className="flex gap-2"><button className="focus-ring min-h-11 rounded-full border border-black/15 bg-white px-5 text-sm font-semibold">Manage availability</button><button className="focus-ring min-h-11 rounded-full bg-forest px-5 text-sm font-semibold text-white">Create date</button></div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [CakeSlice, "Cakes due 20 Jun", totalCakes, "8 capacity remaining"],
            [Palette, "Next class", "5 booked", "3 seats remaining"],
            [CircleDollarSign, "Awaiting payment", 1, "Cake checkout"],
            [AlertCircle, "Needs attention", 2, "1 refund · 1 failed email"],
          ].map(([Icon, label, value, note]) => {
            const Component = Icon as typeof CakeSlice;
            return <div key={label as string} className="rounded-2xl border border-black/8 bg-white p-5"><Component size={20} className="text-forest" /><p className="mt-5 text-sm text-black/55">{label as string}</p><p className="display mt-1 text-4xl font-semibold">{value as string | number}</p><p className="mt-2 text-xs text-black/45">{note as string}</p></div>;
          })}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-black/8 bg-white">
            <div className="flex items-center justify-between border-b border-black/8 p-5"><div><h2 className="font-semibold">Production list · 20 June</h2><p className="mt-1 text-xs text-black/45">Confirmed paid orders only</p></div><button className="text-sm font-semibold text-forest">Print list</button></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead className="bg-black/[0.025] text-xs text-black/45"><tr><th className="px-5 py-3 font-medium">Flavour</th><th className="px-5 py-3 font-medium">Size</th><th className="px-5 py-3 font-medium">Quantity</th><th className="px-5 py-3 font-medium">Progress</th></tr></thead>
                <tbody className="divide-y divide-black/8">{production.map((item) => <tr key={item.flavour}><td className="px-5 py-4 font-semibold">{item.flavour}</td><td className="px-5 py-4">{item.size}</td><td className="px-5 py-4">{item.quantity}</td><td className="px-5 py-4"><select className="min-h-10 rounded-lg border border-black/15 bg-white px-3"><option>Not started</option><option>In production</option><option>Ready</option></select></td></tr>)}</tbody>
              </table>
            </div>
            <div className="border-t border-black/8 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-black/45">Pickup breakdown</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">{["Park Ridge · 2", "Calamvale · 1", "Sunnybank · 4"].map((item) => <div key={item} className="rounded-xl bg-[#f4f1ec] p-4 text-sm">{item}</div>)}</div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/8 bg-white">
            <div className="border-b border-black/8 p-5"><h2 className="font-semibold">Published cake dates</h2><p className="mt-1 text-xs text-black/45">Capacity and pickup windows</p></div>
            <div className="divide-y divide-black/8">
              {cakeDates.map((date) => <div key={date.id} className="p-5"><div className="flex justify-between gap-4"><div><p className="font-semibold">{date.date}</p><p className="mt-1 text-xs text-black/45">{date.slots.length} pickup slots</p></div><span className="h-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Published</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-black/8"><div className="h-full w-[62%] rounded-full bg-forest" /></div><div className="mt-2 flex justify-between text-xs text-black/45"><span>{20 - date.remaining} confirmed</span><span>{date.remaining} remaining</span></div></div>)}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-black/8 bg-white">
          <div className="flex items-center justify-between border-b border-black/8 p-5"><div><h2 className="font-semibold">Recent cake orders</h2><p className="mt-1 text-xs text-black/45">Payment and fulfilment are tracked separately</p></div><button className="text-sm font-semibold text-forest">View all</button></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-black/[0.025] text-xs text-black/45"><tr>{["Order", "Customer", "Date", "Items", "Pickup", "Status", ""].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-black/8">{adminOrders.map((order) => <tr key={order.id}><td className="px-5 py-4 font-semibold">{order.id}</td><td className="px-5 py-4">{order.customer}</td><td className="px-5 py-4">{order.date}</td><td className="px-5 py-4">{order.items}</td><td className="px-5 py-4">{order.slot}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === "Awaiting payment" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{order.status}</span></td><td className="px-5 py-4"><ChevronRight size={17} /></td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-black/8 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold">Upcoming class</h2><p className="mt-1 text-xs text-black/45">{classSessions[0].title.en}</p></div><Link href="/classes" className="text-sm font-semibold text-forest">View public page</Link></div>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-[#f4f1ec] p-4"><CalendarDays size={18} /><p className="mt-3 text-sm font-semibold">21 June 2026</p></div>
            <div className="rounded-xl bg-[#f4f1ec] p-4"><Clock size={18} /><p className="mt-3 text-sm font-semibold">1:30–4:00 pm</p></div>
            <div className="rounded-xl bg-[#f4f1ec] p-4"><Users size={18} /><p className="mt-3 text-sm font-semibold">5 / 8 booked</p></div>
            <div className="rounded-xl bg-[#f4f1ec] p-4"><CircleDollarSign size={18} /><p className="mt-3 text-sm font-semibold">Pay after class</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
