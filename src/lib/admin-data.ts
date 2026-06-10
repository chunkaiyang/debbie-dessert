import "server-only";

import { redirect } from "next/navigation";
import { orderStatuses, paymentStatuses, type AdminOrderFilters } from "@/lib/admin-orders";
import { getOwnerSession, getSupabaseServerClient } from "@/lib/supabase/server";

export { orderStatuses, paymentStatuses };

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes: string | null;
  createdAt: string;
  serviceDate: string;
  pickupLocation: string;
  pickupStartsAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotalCents: number;
  paidCents: number;
  refundedCents: number;
  currency: string;
  items: Array<{ name: string; variant: string; quantity: number; lineTotalCents: number }>;
};

export type AdminOrderReport = {
  orders: AdminOrder[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: {
    grossCents: number;
    paidCents: number;
    refundedCents: number;
    netReceivedCents: number;
  };
};

export type AdminAvailability = {
  id: string;
  serviceDate: string;
  status: string;
  capacityUnits: number;
  orderingCutoffAt: string;
  customerNoteEn: string | null;
  customerNoteZh: string | null;
  committedUnits: number;
  slots: Array<{
    id: string;
    locationName: string;
    address: string;
    startsAt: string;
    endsAt: string;
    active: boolean;
  }>;
};

export type AdminPickupLocation = {
  key: string;
  locationName: string;
  address: string;
};

export type AdminProduct = {
  id: string;
  variantId: string;
  slug: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string;
  descriptionZh: string;
  ingredientsEn: string;
  ingredientsZh: string;
  allergensEn: string;
  allergensZh: string;
  imagePath: string | null;
  active: boolean;
  displayOrder: number;
  homepageNotesEn: string[];
  homepageNotesZh: string[];
  priceCents: number;
  variantActive: boolean;
};

async function requireOwnerClient() {
  const session = await getOwnerSession();
  if (!session.ok) redirect("/admin/login");
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=setup");
  return { supabase, user: session.user };
}

const emptyOrderReport: AdminOrderReport = {
  orders: [],
  totalCount: 0,
  page: 1,
  pageSize: 25,
  totalPages: 0,
  totals: {
    grossCents: 0,
    paidCents: 0,
    refundedCents: 0,
    netReceivedCents: 0,
  },
};

export async function getAdminOrderReport(
  filters: AdminOrderFilters = {},
  options: { page?: number; pageSize?: number; includeItems?: boolean; exportAll?: boolean } = {},
) {
  const { supabase } = await requireOwnerClient();
  const { data, error } = await supabase.rpc("owner_order_report", {
    p_filters: filters,
    p_page: options.page ?? 1,
    p_page_size: options.pageSize ?? 25,
    p_include_items: options.includeItems ?? false,
    p_export: options.exportAll ?? false,
  });
  if (error) throw new Error(`Could not load orders: ${error.message}`);
  return {
    ...emptyOrderReport,
    ...(data as AdminOrderReport | null),
  };
}

export async function getAdminOrders(filters: AdminOrderFilters = {}) {
  const report = await getAdminOrderReport(filters, { includeItems: true, exportAll: true });
  return report.orders;
}

export async function getAdminOrder(orderId: string) {
  const { supabase } = await requireOwnerClient();
  const { data: row, error } = await supabase
    .from("cake_orders")
    .select(`
      id, order_number, status, payment_status, payment_method, subtotal_cents, paid_cents,
      refunded_cents, currency, customer_notes, created_at,
      customers!inner(name, email, phone),
      cake_availability_dates!inner(service_date),
      pickup_slots!inner(location_name, starts_at),
      cake_order_items(product_name_en_snapshot, variant_name_snapshot, quantity, line_total_cents)
    `)
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error(`Could not load order: ${error.message}`);
  if (!row) return null;

  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
  const availability = Array.isArray(row.cake_availability_dates) ? row.cake_availability_dates[0] : row.cake_availability_dates;
  const pickup = Array.isArray(row.pickup_slots) ? row.pickup_slots[0] : row.pickup_slots;
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: customer?.name ?? "",
    customerEmail: customer?.email ?? "",
    customerPhone: customer?.phone ?? "",
    customerNotes: row.customer_notes,
    createdAt: row.created_at,
    serviceDate: availability?.service_date ?? "",
    pickupLocation: pickup?.location_name ?? "",
    pickupStartsAt: pickup?.starts_at ?? "",
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    subtotalCents: row.subtotal_cents,
    paidCents: row.paid_cents ?? 0,
    refundedCents: row.refunded_cents ?? 0,
    currency: row.currency,
    items: (row.cake_order_items ?? []).map((item) => ({
      name: item.product_name_en_snapshot,
      variant: item.variant_name_snapshot,
      quantity: item.quantity,
      lineTotalCents: item.line_total_cents,
    })),
  } satisfies AdminOrder;
}

export async function getAdminAvailability() {
  const { supabase } = await requireOwnerClient();
  const [{ data: dates, error }, { data: orders, error: ordersError }] = await Promise.all([
    supabase
      .from("cake_availability_dates")
      .select("id, service_date, status, capacity_units, ordering_cutoff_at, customer_note_en, customer_note_zh, pickup_slots(id, location_name, address, starts_at, ends_at, active)")
      .order("service_date", { ascending: true }),
    supabase
      .from("cake_orders")
      .select("availability_date_id, total_capacity_units, status")
      .in("status", ["pending_confirmation", "held", "awaiting_payment", "confirmed", "in_production", "ready"]),
  ]);
  if (error) throw new Error(`Could not load availability: ${error.message}`);
  if (ordersError) throw new Error(`Could not load capacity: ${ordersError.message}`);

  const committed = new Map<string, number>();
  for (const order of orders ?? []) {
    committed.set(order.availability_date_id, (committed.get(order.availability_date_id) ?? 0) + order.total_capacity_units);
  }

  return (dates ?? []).map((date) => ({
    id: date.id,
    serviceDate: date.service_date,
    status: date.status,
    capacityUnits: date.capacity_units,
    orderingCutoffAt: date.ordering_cutoff_at,
    customerNoteEn: date.customer_note_en,
    customerNoteZh: date.customer_note_zh,
    committedUnits: committed.get(date.id) ?? 0,
    slots: (date.pickup_slots ?? []).map((slot) => ({
      id: slot.id,
      locationName: slot.location_name,
      address: slot.address,
      startsAt: slot.starts_at,
      endsAt: slot.ends_at,
      active: slot.active,
    })),
  } satisfies AdminAvailability));
}

export async function getAdminPickupLocations() {
  const { supabase } = await requireOwnerClient();
  const { data, error } = await supabase
    .from("pickup_slots")
    .select("location_name, address, starts_at")
    .order("starts_at", { ascending: false });
  if (error) throw new Error(`Could not load pickup locations: ${error.message}`);

  const locations = new Map<string, AdminPickupLocation>();
  for (const slot of data ?? []) {
    const key = `${slot.location_name.trim().toLowerCase()}|${slot.address.trim().toLowerCase()}`;
    if (!locations.has(key)) {
      locations.set(key, {
        key,
        locationName: slot.location_name,
        address: slot.address,
      });
    }
  }
  return Array.from(locations.values()).sort((a, b) => a.locationName.localeCompare(b.locationName));
}

export async function getAdminProducts() {
  const { supabase } = await requireOwnerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name_en, name_zh, description_en, description_zh, ingredients_en, ingredients_zh, allergens_en, allergens_zh, image_path, active, display_order, homepage_notes_en, homepage_notes_zh, product_variants(id, price_cents, active)")
    .order("display_order", { ascending: true });
  if (error) throw new Error(`Could not load flavours: ${error.message}`);

  return (data ?? []).map((product) => {
    const variant = product.product_variants?.[0];
    return {
      id: product.id,
      variantId: variant?.id ?? "",
      slug: product.slug,
      nameEn: product.name_en,
      nameZh: product.name_zh,
      descriptionEn: product.description_en,
      descriptionZh: product.description_zh,
      ingredientsEn: product.ingredients_en,
      ingredientsZh: product.ingredients_zh,
      allergensEn: product.allergens_en,
      allergensZh: product.allergens_zh,
      imagePath: product.image_path,
      active: product.active,
      displayOrder: product.display_order,
      homepageNotesEn: product.homepage_notes_en ?? [],
      homepageNotesZh: product.homepage_notes_zh ?? [],
      priceCents: variant?.price_cents ?? 0,
      variantActive: variant?.active ?? false,
    } satisfies AdminProduct;
  });
}

export async function getAdminDashboardData() {
  const [allOrders, availability, products] = await Promise.all([
    getAdminOrders(),
    getAdminAvailability(),
    getAdminProducts(),
  ]);
  const nextDate = availability.find((date) => date.status === "published" && date.serviceDate >= new Date().toISOString().slice(0, 10));
  const productionOrders = allOrders.filter((order) => nextDate && order.serviceDate === nextDate.serviceDate && ["confirmed", "in_production", "ready"].includes(order.status));
  const production = new Map<string, number>();
  for (const order of productionOrders) {
    for (const item of order.items) production.set(item.name, (production.get(item.name) ?? 0) + item.quantity);
  }
  return { orders: allOrders.slice(0, 6), allOrders, availability, products, nextDate, production: Array.from(production, ([flavour, quantity]) => ({ flavour, quantity })) };
}

export async function getOwnerForAction() {
  return requireOwnerClient();
}
