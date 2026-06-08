"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";
import { Header } from "./header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const usesCustomChrome = pathname === "/" || pathname.startsWith("/admin");

  return (
    <>
      {usesCustomChrome ? null : <Header />}
      <main>{children}</main>
      {usesCustomChrome ? null : <Footer />}
    </>
  );
}
