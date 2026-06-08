import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const bookingSchema = z.object({
  sessionId: z.string().uuid(),
  customer: z.object({ name: z.string().min(2), email: z.email(), phone: z.string().min(8) }),
  attendees: z.array(z.object({ name: z.string().min(2), isMinor: z.boolean() })).min(1).max(8),
  guardianName: z.string().min(2).optional(),
  guardianAcknowledged: z.boolean(),
  idempotencyKey: z.string().min(12).max(100),
}).refine((value) => !value.attendees.some((attendee) => attendee.isMinor) || (value.guardianAcknowledged && value.guardianName), { message: "Guardian acknowledgement is required for minors" });

export async function POST(request: Request) {
  const parsed = bookingSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking", details: parsed.error.flatten() }, { status: 400 });
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ mode: "demo", reference: "MC-DEMO-304" }, { status: 201 });

  const { data, error } = await supabase.rpc("reserve_class_booking", { payload: parsed.data });
  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json(data, { status: 201 });
}
