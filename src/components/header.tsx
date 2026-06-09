"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "./language-provider";

const navigation = [
  { href: "/", en: "Home", zh: "首頁" },
  { href: "/cakes", en: "Cakes", zh: "蛋糕訂購" },
  { href: "/classes", en: "Mandala Classes", zh: "曼陀羅繪畫課程" },
  { href: "/about", en: "About", zh: "關於我" },
  { href: "/faq", en: "FAQ", zh: "常見問題" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-cocoa/10 bg-porcelain/95 backdrop-blur">
      <div className="container-shell flex min-h-20 items-center justify-between gap-5 py-2">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-lg" aria-label="Debbie Dessert home">
          <Image src="/assets/logo.jpg" alt="" width={52} height={52} className="size-13 rounded-full object-cover" priority />
          <span className="display text-xl font-semibold tracking-wide">Debbie Dessert</span>
        </Link>
        <nav className="hidden items-center gap-10 xl:gap-12 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href} className="focus-ring group text-center text-[15px] leading-tight text-cocoa transition hover:text-forest">
                <span className="block font-serif">{item.en}</span>
                <span className="mt-1 block text-xs tracking-[0.15em] text-cocoa/70 group-hover:text-forest/75">{item.zh}</span>
                <span className={`mx-auto mt-2 block h-px bg-current transition-all ${active ? "w-7 opacity-100" : "w-0 opacity-0 group-hover:w-7 group-hover:opacity-60"}`} />
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex rounded-full border border-cocoa/20 p-1 text-xs" aria-label="Language">
            <button className={`focus-ring rounded-full px-3 py-2 ${language === "en" ? "bg-cocoa text-white" : ""}`} onClick={() => setLanguage("en")}>EN</button>
            <button className={`focus-ring rounded-full px-3 py-2 ${language === "zh" ? "bg-cocoa text-white" : ""}`} onClick={() => setLanguage("zh")}>繁中</button>
          </div>
          <Link href="/cakes" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-cocoa">
            <ShoppingBag size={17} />
            {language === "en" ? "Order" : "訂購"}
          </Link>
        </div>
        <button className="focus-ring rounded-lg p-3 lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-cocoa/10 bg-porcelain px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="focus-ring rounded-lg px-3 py-3 font-medium">
                <span className="font-serif">{item.en}</span>
                <span className="ml-3 text-sm tracking-[0.12em] text-cocoa/65">{item.zh}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-2 border-t border-cocoa/10 pt-4">
            <button className={`focus-ring min-h-11 rounded-full px-4 ${language === "en" ? "bg-cocoa text-white" : "border border-cocoa/20"}`} onClick={() => setLanguage("en")}>English</button>
            <button className={`focus-ring min-h-11 rounded-full px-4 ${language === "zh" ? "bg-cocoa text-white" : "border border-cocoa/20"}`} onClick={() => setLanguage("zh")}>繁體中文</button>
            <Link href="/cakes" onClick={() => setOpen(false)} className="focus-ring ml-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-cocoa">
              <ShoppingBag size={17} />
              {language === "en" ? "Order" : "訂購"}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
