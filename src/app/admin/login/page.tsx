import Image from "next/image";
import { redirect } from "next/navigation";
import { signInOwner } from "./actions";
import { getOwnerSession, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const ownerSession = await getOwnerSession();
  if (ownerSession.ok) redirect("/admin");

  const setupRequired = !isSupabaseConfigured() || query.error === "setup";
  const errorMessage =
    query.error === "invalid"
      ? "The email or password was not accepted."
      : query.error === "unauthorized"
        ? "This account is signed in but is not an owner. Add the user to public.staff_roles with role owner."
        : query.error === "setup"
          ? "Supabase is not configured yet. Add the Supabase environment variables before the dashboard can be accessed."
          : null;

  return (
    <section className="section-pad">
      <div className="container-shell max-w-md">
        <div className="rounded-2xl border border-cocoa/12 bg-white p-7">
          <Image src="/assets/logo.jpg" alt="Debbie Dessert" width={72} height={72} className="mx-auto rounded-full" />
          <h1 className="display mt-5 text-center text-4xl font-semibold">Owner sign in</h1>
          <p className="mt-2 text-center text-sm text-cocoa/55">Secure access to orders, production and classes.</p>
          {errorMessage ? <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-800">{errorMessage}</p> : null}
          {setupRequired ? (
            <div className="mt-5 rounded-xl border border-caramel/25 bg-blush/30 p-4 text-sm leading-6 text-cocoa/70">
              Admin details are locked until Supabase Auth is connected. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, apply the migration, then add Debbie&apos;s user ID to `public.staff_roles`.
            </div>
          ) : null}
          <form action={signInOwner} className="mt-6">
            <label className="grid gap-2 text-sm font-semibold">Email<input required disabled={setupRequired} name="email" type="email" autoComplete="email" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal disabled:cursor-not-allowed disabled:opacity-60" /></label>
            <label className="mt-5 grid gap-2 text-sm font-semibold">Password<input required disabled={setupRequired} name="password" type="password" autoComplete="current-password" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal disabled:cursor-not-allowed disabled:opacity-60" /></label>
            <button disabled={setupRequired} className="focus-ring mt-6 min-h-12 w-full rounded-full bg-forest px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Sign in</button>
          </form>
        </div>
      </div>
    </section>
  );
}
