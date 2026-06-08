"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Palette } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function AboutPage() {
  const { language } = useLanguage();
  return (
    <div>
      <section className="section-pad">
        <div className="container-shell grid items-center gap-14 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full"><Image src="/assets/mandala-class.jpg" alt="Debbie creating a mandala dot painting" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
          <div>
            <h1 className="display text-6xl leading-none font-semibold md:text-8xl">{language === "en" ? "Made by Debbie" : "關於 Debbie"}</h1>
            <p className="mt-4 font-serif text-2xl text-caramel">甜品療癒師</p>
            <div className="mt-7 space-y-5 leading-8 text-cocoa/70">
              <p>{language === "en" ? "Debbie Dessert began with a simple belief: thoughtful food and quiet creativity can make an ordinary day feel cared for." : "Debbie Dessert 源自一個簡單的信念：用心的甜點與安靜的創作，能讓平凡日子多一份被照顧的感覺。"}</p>
              <p>{language === "en" ? "Every cheesecake is made in a small batch around Debbie’s real availability. The mandala classes share the same approach: unhurried, welcoming, and focused on the pleasure of making." : "每一個乳酪蛋糕，都依照 Debbie 真正能製作的時間少量手作；曼陀羅課程也一樣，慢慢進行、歡迎每個人，專注享受創作本身。"}</p>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {[[Leaf, "Natural", "天然食材"], [Heart, "Vegetarian", "全素食選材"], [Palette, "Handmade", "用心手作"]].map(([Icon, en, zh]) => {
                const Component = Icon as typeof Leaf;
                return <div key={en as string} className="rounded-xl border border-cocoa/12 p-4"><Component className="text-forest" /><p className="mt-3 font-semibold">{en as string}</p><p className="mt-1 text-xs text-cocoa/50">{zh as string}</p></div>;
              })}
            </div>
            <Link href="/cakes" className="focus-ring mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-forest px-6 py-3 font-semibold text-white">Order a cake <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
