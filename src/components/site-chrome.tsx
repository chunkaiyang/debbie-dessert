"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";
import { Header } from "./header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {isAdmin ? null : <Header />}
      <main>{children}</main>
      {isAdmin ? null : <Footer />}
    </>
  );
}
