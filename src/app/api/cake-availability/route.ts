import { NextResponse } from "next/server";
import { getCakeOrderingData } from "@/lib/cake-availability-server";

export async function GET() {
  const data = await getCakeOrderingData();
  return NextResponse.json(data);
}
