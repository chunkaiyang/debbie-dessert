export const orderStatuses = [
  "held",
  "awaiting_payment",
  "pending_confirmation",
  "confirmed",
  "in_production",
  "ready",
  "collected",
  "cancelled",
  "refunded",
  "expired",
] as const;

export const paymentStatuses = ["unpaid", "pending", "paid", "failed", "partially_refunded", "refunded"] as const;

export type AdminOrderFilters = {
  search?: string;
  orderFrom?: string;
  orderTo?: string;
  pickupFrom?: string;
  pickupTo?: string;
  status?: string;
  paymentStatus?: string;
};
