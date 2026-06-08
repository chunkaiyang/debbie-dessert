"use client";

import Link from "next/link";
import { Camera, Mail, MapPin } from "lucide-react";
import { useLanguage } from "./language-provider";

export function Footer() {
  const { language } = useLanguage();
  return (
    <footer className="border-t border-cocoa/10 bg-cocoa text-porcelain">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="display text-3xl">Debbie Dessert</p>
          <p className="mt-2 text-porcelain/75">甜品療癒師</p>
          <p className="mt-5 max-w-sm text-sm leading-7 text-porcelain/70">
            {language === "en" ? "Handcrafted vegetarian cheesecake and mindful creativity, made gently in Brisbane." : "在布里斯本，用手作素食乳酪蛋糕與靜心創作，分享生活裡的溫柔。"}
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">{language === "en" ? "Explore" : "探索"}</p>
          <div className="mt-4 flex flex-col gap-3 text-porcelain/70">
            <Link href="/cakes">Cakes · 巴斯克蛋糕</Link>
            <Link href="/classes">Classes · 曼陀羅課程</Link>
            <Link href="/lookup">Order lookup · 訂單查詢</Link>
            <Link href="/admin">Owner admin</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold">{language === "en" ? "Contact" : "聯絡"}</p>
          <div className="mt-4 flex flex-col gap-3 text-porcelain/70">
            <span className="flex items-center gap-2"><MapPin size={16} /> Brisbane, Queensland</span>
            <span className="flex items-center gap-2"><Mail size={16} /> hello@debbiedessert.com.au</span>
            <span className="flex items-center gap-2"><Camera size={16} /> @debbiedessert</span>
          </div>
        </div>
      </div>
      <div className="border-t border-porcelain/10 py-5 text-center text-xs text-porcelain/55">
        © 2026 Debbie Dessert · Prices in AUD
      </div>
    </footer>
  );
}
