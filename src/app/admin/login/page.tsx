import Image from "next/image";
import { signInOwner } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  return (
    <section className="section-pad">
      <div className="container-shell max-w-md">
        <div className="rounded-2xl border border-cocoa/12 bg-white p-7">
          <Image src="/assets/logo.jpg" alt="Debbie Dessert" width={72} height={72} className="mx-auto rounded-full" />
          <h1 className="display mt-5 text-center text-4xl font-semibold">Owner sign in</h1>
          <p className="mt-2 text-center text-sm text-cocoa/55">Secure access to orders, production and classes.</p>
          {query.error ? <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">The email or password was not accepted.</p> : null}
          <form action={signInOwner} className="mt-6">
            <label className="grid gap-2 text-sm font-semibold">Email<input required name="email" type="email" autoComplete="email" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal" /></label>
            <label className="mt-5 grid gap-2 text-sm font-semibold">Password<input required name="password" type="password" autoComplete="current-password" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal" /></label>
            <button className="focus-ring mt-6 min-h-12 w-full rounded-full bg-forest px-5 font-semibold text-white">Sign in</button>
          </form>
        </div>
      </div>
    </section>
  );
}
