"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "./language-provider";

const navigation = [
  { href: "/", en: "Home", zh: "首頁" },
  { href: "/cakes", en: "Cakes", zh: "蛋糕" },
  { href: "/classes", en: "Mandala Classes", zh: "曼陀羅課程" },
  { href: "/about", en: "About", zh: "關於我們" },
  { href: "/faq", en: "FAQ", zh: "常見問題" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-cocoa/10 bg-porcelain/95 backdrop-blur">
      <div className="container-shell flex h-20 items-center justify-between gap-5">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-lg" aria-label="Debbie Dessert home">
          <Image src="/assets/logo.jpg" alt="" width={48} height={48} className="rounded-full" priority />
          <span className="display text-xl font-semibold tracking-wide">Debbie Dessert</span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring rounded text-sm font-medium hover:text-forest">
              {language === "en" ? item.en : item.zh}
            </Link>
          ))}
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
                {language === "en" ? item.en : item.zh}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-2 border-t border-cocoa/10 pt-4">
            <button className={`focus-ring min-h-11 rounded-full px-4 ${language === "en" ? "bg-cocoa text-white" : "border border-cocoa/20"}`} onClick={() => setLanguage("en")}>English</button>
            <button className={`focus-ring min-h-11 rounded-full px-4 ${language === "zh" ? "bg-cocoa text-white" : "border border-cocoa/20"}`} onClick={() => setLanguage("zh")}>繁體中文</button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
