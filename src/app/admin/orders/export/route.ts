import { getAdminOrders } from "@/lib/admin-data";
import { getOwnerSession } from "@/lib/supabase/server";

function csv(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: Request) {
  const owner = await getOwnerSession();
  if (!owner.ok) return new Response("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const orders = await getAdminOrders({
    search: url.searchParams.get("search") ?? "",
    orderFrom: url.searchParams.get("orderFrom") ?? "",
    orderTo: url.searchParams.get("orderTo") ?? "",
    pickupFrom: url.searchParams.get("pickupFrom") ?? "",
    pickupTo: url.searchParams.get("pickupTo") ?? "",
    status: url.searchParams.get("status") ?? "",
    paymentStatus: url.searchParams.get("paymentStatus") ?? "",
  });
  const header = ["Order number", "Order date", "Pickup date", "Customer", "Items", "Status", "Payment status", "Payment method", "Subtotal", "Paid", "Refunded", "Net received", "Currency"];
  const rows = orders.map((order) => [
    order.orderNumber,
    order.createdAt,
    order.serviceDate,
    order.customerName,
    order.items.map((item) => `${item.quantity} x ${item.name} (${item.variant})`).join("; "),
    order.status,
    order.paymentStatus,
    order.paymentMethod ?? "",
    (order.subtotalCents / 100).toFixed(2),
    (order.paidCents / 100).toFixed(2),
    (order.refundedCents / 100).toFixed(2),
    ((order.paidCents - order.refundedCents) / 100).toFixed(2),
    order.currency,
  ]);
  const body = [header, ...rows].map((row) => row.map(csv).join(",")).join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="debbie-dessert-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
