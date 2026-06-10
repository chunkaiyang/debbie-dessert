import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { signOutOwner } from "@/app/admin/login/actions";

export function AdminShell({ ownerEmail, children }: { ownerEmail: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f1ec] text-[#2e2925]">
      <header className="border-b border-black/10 bg-white">
        <div className="container-shell flex min-h-20 flex-wrap items-center justify-between gap-x-5 gap-y-3 py-3">
          <Link
            href="/admin"
            aria-label="Debbie Dessert owner dashboard"
            className="focus-ring flex min-w-0 items-center gap-3 rounded-lg"
          >
            <Image
              src="/assets/logo.jpg"
              alt=""
              width={52}
              height={52}
              className="size-13 shrink-0 rounded-full object-cover"
              priority
            />
            <span className="min-w-0">
              <span className="display block text-xl font-semibold tracking-wide sm:text-2xl">
                Debbie Dessert
              </span>
              <span className="block text-xs text-black/50">Owner dashboard · Brisbane</span>
            </span>
          </Link>
          <nav className="order-3 flex w-full flex-wrap items-center gap-1 border-t border-black/8 pt-3 text-sm font-semibold lg:order-none lg:w-auto lg:border-0 lg:pt-0">
            <Link className="rounded-full px-3 py-2 hover:bg-black/5" href="/admin/orders">Orders</Link>
            <Link className="rounded-full px-3 py-2 hover:bg-black/5" href="/admin/availability">Availability</Link>
            <Link className="rounded-full px-3 py-2 hover:bg-black/5" href="/admin/flavours">Flavours</Link>
            <Link
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest/5 px-3 py-2 text-forest hover:bg-forest/10 lg:ml-1"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View website
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
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
