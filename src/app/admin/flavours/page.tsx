import { redirect } from "next/navigation";
import { AdminFlavourForm } from "@/components/admin-flavour-form";
import { AdminShell } from "@/components/admin-shell";
import { getAdminProducts } from "@/lib/admin-data";
import { getOwnerSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FlavoursPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const owner = await getOwnerSession();
  if (!owner.ok) redirect("/admin/login");
  const [products, params] = await Promise.all([getAdminProducts(), searchParams]);
  return (
    <AdminShell ownerEmail={owner.user.email ?? "Owner"}>
      <h1 className="display text-5xl font-semibold">Cake flavours</h1>
      <p className="mt-2 text-black/55">Changes update the order form and homepage flavour section.</p>
      {params.error ? <p role="alert" className="mt-5 rounded-xl bg-red-100 p-4 text-sm text-red-800">{decodeURIComponent(params.error)}</p> : null}
      <div className="mt-7 space-y-6">
        {products.map((product) => <AdminFlavourForm key={product.id} product={product} />)}
        <AdminFlavourForm />
      </div>
    </AdminShell>
  );
}
