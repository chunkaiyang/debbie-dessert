import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const provider = request.headers.get("x-payment-provider");
  if (!provider) return NextResponse.json({ error: "Missing payment provider" }, { status: 400 });

  // Provider adapters must verify the signature before calling the database
  // confirmation function. The database migration enforces event idempotency.
  return NextResponse.json({ received: true, provider }, { status: 202 });
}
