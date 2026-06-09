import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const orderSchema = z.object({
  items: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().positive().max(6) })).min(1),
  availabilityDateId: z.string().min(1),
  pickupSlotId: z.string().min(1),
  customer: z.object({
    name: z.string().trim().min(2),
    email: z.email(),
    phone: z.string().trim().min(8),
    notes: z.string().trim().max(1000).optional(),
  }),
  termsAccepted: z.literal(true),
  idempotencyKey: z.string().min(12).max(100),
});

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({
      error: "Please complete all required order fields correctly.",
      details: parsed.error.flatten(),
    }, { status: 400 });
  }
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      mode: "demo",
      orderId: "demo",
      orderNumber: "DD-DEMO-1051",
      reference: "DD-DEMO-1051",
      status: "pending_confirmation",
      message: "Demo order only. No real capacity was reserved.",
      checkoutUrl: null,
    }, { status: 201 });
  }

  const { data, error } = await supabase.rpc("reserve_cake_order", { payload: parsed.data });
  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json(data, { status: 201 });
}
