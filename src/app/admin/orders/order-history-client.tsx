"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState, useTransition } from "react";
import { orderStatuses, paymentStatuses, type AdminOrderFilters } from "@/lib/admin-orders";

const emptyFilters: Required<AdminOrderFilters> = {
  search: "",
  orderFrom: "",
  orderTo: "",
  pickupFrom: "",
  pickupTo: "",
  status: "",
  paymentStatus: "",
};

function filterFieldClass(active: boolean) {
  return `min-h-11 rounded-lg border px-3 text-sm font-normal outline-none transition ${
    active
      ? "border-forest bg-green-50 ring-2 ring-forest/20"
      : "border-black/15 bg-white focus:border-forest"
  }`;
}

function filtersUrl(filters: Required<AdminOrderFilters>) {
  const params = new URLSearchParams();
  for (const [key, item] of Object.entries(filters)) {
    if (item) params.set(key, item);
  }
  const query = params.toString();
  return `/admin/orders${query ? `?${query}` : ""}`;
}

export function OrderHistoryClient({
  initialFilters,
  children,
}: {
  initialFilters: AdminOrderFilters;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<Required<AdminOrderFilters>>({
    ...emptyFilters,
    ...initialFilters,
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function updateFilter(key: keyof AdminOrderFilters, item: string) {
    setFilters((current) => ({ ...current, [key]: item }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFiltersExpanded(false);
    startTransition(() => router.replace(filtersUrl(filters), { scroll: false }));
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setFiltersExpanded(false);
    startTransition(() => router.replace("/admin/orders", { scroll: false }));
  }

  return (
    <>
      <section
        className={`mt-7 rounded-2xl border bg-white ${
          activeFilterCount ? "border-forest/35 shadow-[0_0_0_3px_rgba(37,83,66,0.06)]" : "border-black/8"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <button
            type="button"
            aria-expanded={filtersExpanded}
            aria-controls="order-filters"
            onClick={() => setFiltersExpanded((expanded) => !expanded)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest/8 text-forest">
              <SlidersHorizontal size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">Filter orders</span>
              <span className="mt-0.5 block text-xs font-normal text-black/50">
                {activeFilterCount
                  ? `${activeFilterCount} active ${activeFilterCount === 1 ? "filter" : "filters"}`
                  : "Search and narrow the order history"}
              </span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            {activeFilterCount ? (
              <button
                type="button"
                onClick={clearFilters}
                disabled={isPending}
                className="inline-flex min-h-9 items-center rounded-full border border-black/15 px-3 text-xs font-semibold hover:bg-black/5 disabled:opacity-60"
              >
                Clear all
              </button>
            ) : null}
            <button
              type="button"
              aria-label={filtersExpanded ? "Collapse order filters" : "Expand order filters"}
              aria-expanded={filtersExpanded}
              aria-controls="order-filters"
              onClick={() => setFiltersExpanded((expanded) => !expanded)}
              className="grid size-10 place-items-center rounded-full border border-black/10 text-forest hover:bg-forest/5"
            >
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={`transition-transform ${filtersExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
        {filtersExpanded ? (
          <form
            id="order-filters"
            onSubmit={applyFilters}
            className="grid gap-4 border-t border-black/8 p-4 sm:p-5 md:grid-cols-4"
          >
            <label className={`grid gap-1 text-xs font-semibold md:col-span-2 ${filters.search ? "text-forest" : ""}`}>
              Search
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Order, customer or email"
                className={filterFieldClass(Boolean(filters.search))}
              />
            </label>
            <label className={`grid gap-1 text-xs font-semibold ${filters.status ? "text-forest" : ""}`}>
              Status
              <select
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
                className={filterFieldClass(Boolean(filters.status))}
              >
                <option value="">All statuses</option>
                {orderStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className={`grid gap-1 text-xs font-semibold ${filters.paymentStatus ? "text-forest" : ""}`}>
              Payment
              <select
                value={filters.paymentStatus}
                onChange={(event) => updateFilter("paymentStatus", event.target.value)}
                className={filterFieldClass(Boolean(filters.paymentStatus))}
              >
                <option value="">All payment states</option>
                {paymentStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className={`grid gap-1 text-xs font-semibold ${filters.orderFrom ? "text-forest" : ""}`}>
              Ordered from
              <input
                type="date"
                value={filters.orderFrom}
                onChange={(event) => updateFilter("orderFrom", event.target.value)}
                className={filterFieldClass(Boolean(filters.orderFrom))}
              />
            </label>
            <label className={`grid gap-1 text-xs font-semibold ${filters.orderTo ? "text-forest" : ""}`}>
              Ordered to
              <input
                type="date"
                value={filters.orderTo}
                onChange={(event) => updateFilter("orderTo", event.target.value)}
                className={filterFieldClass(Boolean(filters.orderTo))}
              />
            </label>
            <label className={`grid gap-1 text-xs font-semibold ${filters.pickupFrom ? "text-forest" : ""}`}>
              Pickup from
              <input
                type="date"
                value={filters.pickupFrom}
                onChange={(event) => updateFilter("pickupFrom", event.target.value)}
                className={filterFieldClass(Boolean(filters.pickupFrom))}
              />
            </label>
            <label className={`grid gap-1 text-xs font-semibold ${filters.pickupTo ? "text-forest" : ""}`}>
              Pickup to
              <input
                type="date"
                value={filters.pickupTo}
                onChange={(event) => updateFilter("pickupTo", event.target.value)}
                className={filterFieldClass(Boolean(filters.pickupTo))}
              />
            </label>
            <div className="flex flex-wrap justify-end gap-3 md:col-span-4">
              {activeFilterCount ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={isPending}
                  className="inline-flex min-h-11 items-center rounded-full border border-black/15 px-5 text-sm font-semibold hover:bg-black/5 disabled:opacity-60"
                >
                  Clear all filters
                </button>
              ) : null}
              <button
                disabled={isPending}
                className="min-h-11 rounded-full bg-cocoa px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isPending ? "Applying..." : "Apply filters"}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <div className="relative" aria-busy={isPending}>
        {isPending ? (
          <div className="pointer-events-none absolute inset-0 z-10 mt-6 rounded-2xl bg-cream/65 backdrop-blur-[1px]">
            <div className="flex min-h-28 items-center justify-center text-sm font-semibold text-forest">
              Updating orders...
            </div>
          </div>
        ) : null}
        <div className={isPending ? "opacity-45" : ""}>{children}</div>
      </div>
    </>
  );
}
