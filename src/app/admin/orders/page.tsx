import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminShell, StatusBadge } from "@/components/admin-shell";
import { getAdminOrderReport } from "@/lib/admin-data";
import type { AdminOrderFilters } from "@/lib/admin-orders";
import { getOwnerSession } from "@/lib/supabase/server";
import { OrderHistoryClient } from "./order-history-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
const dateTime = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short", timeZone: "Australia/Brisbane" });
const date = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeZone: "Australia/Brisbane" });

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return typeof item === "string" ? item : "";
}

function pageNumber(rawPage: string) {
  const parsed = Number.parseInt(rawPage, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function queryString(filters: AdminOrderFilters, page?: number) {
  const params = new URLSearchParams();
  for (const [key, item] of Object.entries(filters)) {
    if (item) params.set(key, item);
  }
  if (page && page > 1) params.set("page", page.toString());
  return params.toString();
}

function ResultsSkeleton() {
  return (
    <div className="mt-6 animate-pulse space-y-4" aria-label="Loading orders">
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 rounded-2xl bg-black/5" />)}
      </div>
      {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-32 rounded-2xl bg-black/5" />)}
    </div>
  );
}

async function OrderResults({ filters, page }: { filters: AdminOrderFilters; page: number }) {
  const report = await getAdminOrderReport(filters, { page, pageSize: PAGE_SIZE });
  if (report.totalPages > 0 && page > report.totalPages) {
    const query = queryString(filters, report.totalPages);
    redirect(`/admin/orders${query ? `?${query}` : ""}`);
  }

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ["Orders", report.totalCount.toString()],
          ["Gross orders", money.format(report.totals.grossCents / 100)],
          ["Paid", money.format(report.totals.paidCents / 100)],
          ["Net received", money.format(report.totals.netReceivedCents / 100)],
        ].map(([label, amount]) => (
          <div key={label} className="rounded-2xl border border-black/8 bg-white p-5">
            <p className="text-xs text-black/50">{label}</p>
            <p className="display mt-2 text-3xl font-semibold">{amount}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {report.orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-black/8 bg-white p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold">{order.orderNumber}</h2>
                  <StatusBadge value={order.status} />
                  <StatusBadge value={order.paymentStatus} />
                </div>
                <p className="mt-2 font-semibold">{order.customerName}</p>
                <p className="text-sm text-black/55">{order.customerEmail}</p>
              </div>
              <div className="text-sm text-black/60">
                <p>Ordered {dateTime.format(new Date(order.createdAt))}</p>
                <p className="mt-1">Pickup {date.format(new Date(`${order.serviceDate}T00:00:00+10:00`))}</p>
                <p className="mt-1">{order.pickupLocation}</p>
              </div>
              <div className="flex items-center justify-between gap-5 lg:block lg:text-right">
                <p className="display text-3xl font-semibold">{money.format(order.subtotalCents / 100)}</p>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="mt-3 inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white"
                >
                  Manage order
                </Link>
              </div>
            </div>
          </article>
        ))}
        {!report.orders.length ? (
          <div className="rounded-2xl border border-black/8 bg-white p-10 text-center text-black/50">
            No orders match these filters.
          </div>
        ) : null}
      </div>

      {report.totalPages > 1 ? (
        <nav aria-label="Order history pages" className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-black/55">
            Page {report.page} of {report.totalPages}
          </p>
          <div className="flex gap-2">
            {report.page > 1 ? (
              <Link
                href={`/admin/orders?${queryString(filters, report.page - 1)}`}
                className="inline-flex min-h-10 items-center rounded-full border border-black/15 px-4 text-sm font-semibold hover:bg-black/5"
              >
                Previous
              </Link>
            ) : null}
            {report.page < report.totalPages ? (
              <Link
                href={`/admin/orders?${queryString(filters, report.page + 1)}`}
                className="inline-flex min-h-10 items-center rounded-full border border-black/15 px-4 text-sm font-semibold hover:bg-black/5"
              >
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const owner = await getOwnerSession();
  if (!owner.ok) redirect("/admin/login");

  const params = await searchParams;
  const filters: AdminOrderFilters = {
    search: value(params, "search"),
    orderFrom: value(params, "orderFrom"),
    orderTo: value(params, "orderTo"),
    pickupFrom: value(params, "pickupFrom"),
    pickupTo: value(params, "pickupTo"),
    status: value(params, "status"),
    paymentStatus: value(params, "paymentStatus"),
  };
  const page = pageNumber(value(params, "page"));
  const exportQuery = queryString(filters);
  const routeQuery = queryString(filters, page);
  const error = value(params, "error");

  return (
    <AdminShell ownerEmail={owner.user.email ?? "Owner"}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl font-semibold">Order history</h1>
          <p className="mt-2 text-black/55">Filter, manage and export every cake order.</p>
        </div>
        <a
          href={`/admin/orders/export${exportQuery ? `?${exportQuery}` : ""}`}
          className="inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white"
        >
          Export CSV
        </a>
      </div>
      {error ? (
        <p role="alert" className="mt-5 rounded-xl bg-red-100 p-4 text-sm text-red-800">
          {decodeURIComponent(error)}
        </p>
      ) : null}

      <OrderHistoryClient key={routeQuery || "all-orders"} initialFilters={filters}>
        <Suspense key={routeQuery || "all-orders"} fallback={<ResultsSkeleton />}>
          <OrderResults filters={filters} page={page} />
        </Suspense>
      </OrderHistoryClient>
    </AdminShell>
  );
}
