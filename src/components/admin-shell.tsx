import Link from "next/link";
import type { ReactNode } from "react";
import { signOutOwner } from "@/app/admin/login/actions";

export function AdminShell({ ownerEmail, children }: { ownerEmail: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f1ec] text-[#2e2925]">
      <header className="border-b border-black/10 bg-white">
        <div className="container-shell flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
          <Link href="/admin">
            <p className="display text-2xl font-semibold">Owner dashboard</p>
            <p className="text-xs text-black/50">Debbie Dessert · Australia/Brisbane</p>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <Link className="rounded-full px-3 py-2 hover:bg-black/5" href="/admin/orders">Orders</Link>
            <Link className="rounded-full px-3 py-2 hover:bg-black/5" href="/admin/availability">Availability</Link>
            <Link className="rounded-full px-3 py-2 hover:bg-black/5" href="/admin/flavours">Flavours</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-black/55 sm:inline">{ownerEmail}</span>
            <form action={signOutOwner}>
              <button className="focus-ring min-h-10 rounded-full border border-black/15 px-4 text-sm font-semibold">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-shell py-10">{children}</main>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const warm = ["pending_confirmation", "unpaid", "pending", "failed"].includes(value);
  const muted = ["cancelled", "refunded", "closed", "cancelled"].includes(value);
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${muted ? "bg-black/10 text-black/60" : warm ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
