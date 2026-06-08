import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const orderSchema = z.object({
  items: z.array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().positive().max(6) })).min(1),
  availabilityDateId: z.string().uuid(),
  pickupSlotId: z.string().uuid(),
  customer: z.object({ name: z.string().min(2), email: z.email(), phone: z.string().min(8), notes: z.string().max(1000).optional() }),
  idempotencyKey: z.string().min(12).max(100),
});

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid order", details: parsed.error.flatten() }, { status: 400 });
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ mode: "demo", reference: "DD-DEMO-1051", checkoutUrl: null }, { status: 201 });

  const { data, error } = await supabase.rpc("reserve_cake_order", { payload: parsed.data });
  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json(data, { status: 201 });
}
