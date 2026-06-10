import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell, StatusBadge } from "@/components/admin-shell";
import { getAdminOrder, orderStatuses, paymentStatuses } from "@/lib/admin-data";
import { getOwnerSession } from "@/lib/supabase/server";
import { updateCakeOrder } from "../../actions";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
const dateTime = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short", timeZone: "Australia/Brisbane" });
const date = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeZone: "Australia/Brisbane" });

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return typeof item === "string" ? item : "";
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const owner = await getOwnerSession();
  if (!owner.ok) redirect("/admin/login");

  const { id } = await params;
  const query = await searchParams;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const error = value(query, "error");
  const updated = value(query, "updated");

  return (
    <AdminShell ownerEmail={owner.user.email ?? "Owner"}>
      <Link href="/admin/orders" className="text-sm font-semibold text-forest">
        ← Back to order history
      </Link>
      {error ? (
        <p role="alert" className="mt-5 rounded-xl bg-red-100 p-4 text-sm text-red-800">
          {decodeURIComponent(error)}
        </p>
      ) : null}
      {updated ? (
        <p role="status" className="mt-5 rounded-xl bg-green-100 p-4 text-sm text-green-900">
          Order updated.
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="display text-5xl font-semibold">{order.orderNumber}</h1>
            <StatusBadge value={order.status} />
            <StatusBadge value={order.paymentStatus} />
          </div>
          <p className="mt-2 text-black/55">
            Ordered {dateTime.format(new Date(order.createdAt))} · Pickup{" "}
            {date.format(new Date(`${order.serviceDate}T00:00:00+10:00`))}
          </p>
        </div>
        <p className="display text-4xl font-semibold">{money.format(order.subtotalCents / 100)}</p>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-black/8 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/45">Customer</p>
          <p className="mt-3 font-semibold">{order.customerName}</p>
          <p className="text-sm">{order.customerEmail}</p>
          <p className="text-sm">{order.customerPhone}</p>
          {order.customerNotes ? <p className="mt-3 text-sm text-black/55">{order.customerNotes}</p> : null}
        </section>
        <section className="rounded-2xl border border-black/8 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/45">Pickup</p>
          <p className="mt-3 font-semibold">{order.pickupLocation}</p>
          <p className="text-sm text-black/55">
            {dateTime.format(new Date(order.pickupStartsAt))}
          </p>
        </section>
        <section className="rounded-2xl border border-black/8 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/45">Financials</p>
          <p className="mt-3 text-sm">Paid: {money.format(order.paidCents / 100)}</p>
          <p className="text-sm">Refunded: {money.format(order.refundedCents / 100)}</p>
          <p className="font-semibold">Net: {money.format((order.paidCents - order.refundedCents) / 100)}</p>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-black/8 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-black/45">Items</p>
        <div className="mt-3 divide-y divide-black/8">
          {order.items.map((item) => (
            <div key={`${item.name}-${item.variant}`} className="flex justify-between gap-4 py-3 text-sm">
              <span>{item.quantity} × {item.name} ({item.variant})</span>
              <span className="font-semibold">{money.format(item.lineTotalCents / 100)}</span>
            </div>
          ))}
        </div>
      </section>

      <form action={updateCakeOrder} className="mt-5 grid gap-4 rounded-2xl border border-black/8 bg-white p-5 md:grid-cols-3">
        <input type="hidden" name="orderId" value={order.id} />
        <label className="grid gap-1 text-xs font-semibold">
          Order status
          <select name="status" defaultValue={order.status} className="min-h-11 rounded-lg border border-black/15 px-3 text-sm font-normal">
            {orderStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold">
          Payment status
          <select name="paymentStatus" defaultValue={order.paymentStatus} className="min-h-11 rounded-lg border border-black/15 px-3 text-sm font-normal">
            {paymentStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold">
          Method
          <select name="paymentMethod" defaultValue={order.paymentMethod ?? ""} className="min-h-11 rounded-lg border border-black/15 px-3 text-sm font-normal">
            <option value="">Not recorded</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold">
          Paid (AUD)
          <input name="paidDollars" type="number" min="0" step="0.01" defaultValue={(order.paidCents / 100).toFixed(2)} className="min-h-11 rounded-lg border border-black/15 px-3 text-sm font-normal" />
        </label>
        <label className="grid gap-1 text-xs font-semibold">
          Refunded (AUD)
          <input name="refundedDollars" type="number" min="0" step="0.01" defaultValue={(order.refundedCents / 100).toFixed(2)} className="min-h-11 rounded-lg border border-black/15 px-3 text-sm font-normal" />
        </label>
        <label className="grid gap-1 text-xs font-semibold">
          Reason
          <input name="reason" className="min-h-11 rounded-lg border border-black/15 px-3 text-sm font-normal" />
        </label>
        <button className="min-h-11 rounded-full bg-forest px-5 text-sm font-semibold text-white md:col-start-3">
          Save order
        </button>
      </form>
    </AdminShell>
  );
}
