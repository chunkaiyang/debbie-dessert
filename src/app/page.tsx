"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Leaf, Palette, ShoppingBag } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage } from "@/components/language-provider";
import { cakeDates, products } from "@/lib/site-data";

export default function HomePage() {
  const { language, t } = useLanguage();
  return (
    <>
      <section className="overflow-hidden">
        <div className="container-shell grid min-h-[760px] items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <div className="relative z-10">
            <h1 className="display max-w-2xl text-6xl leading-[0.92] font-semibold tracking-[-0.03em] md:text-8xl">
              Healing through dessert
            </h1>
            <p className="mt-5 font-serif text-2xl text-caramel md:text-3xl">以甜品療癒日常</p>
            <p className="mt-7 max-w-xl text-lg leading-8 text-cocoa/70">
              {language === "en"
                ? "Natural vegetarian Basque cheesecake and mindful mandala classes, handcrafted in small batches around the days Debbie is available."
                : "以天然食材、小批量手作的素食巴斯克乳酪蛋糕，與靜心曼陀羅課程，陪伴每一個需要慢下來的日常。"}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/cakes" className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-forest px-6 py-3 font-semibold text-white hover:bg-cocoa">
                <ShoppingBag size={18} /> {language === "en" ? "Order a cake" : "訂購蛋糕"}
              </Link>
              <Link href="/classes" className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full border border-cocoa/30 px-6 py-3 font-semibold hover:bg-blush/40">
                <Palette size={18} /> {language === "en" ? "Book a class" : "預約課程"}
              </Link>
            </div>
          </div>
          <div className="relative min-h-[540px]">
            <div className="absolute inset-y-0 right-0 w-[82%] overflow-hidden rounded-[48%_48%_20%_20%] bg-blush">
              <Image src="/assets/694685329_27727454103509648_3353211077646939741_n.jpg" alt="Handcrafted Basque cheesecakes in a gift box" fill sizes="(max-width: 1024px) 82vw, 46vw" className="object-cover" priority />
            </div>
            <div className="mandala-dots absolute bottom-4 left-0 h-44 w-44 rounded-full border border-caramel/25 bg-porcelain" />
            <div className="absolute bottom-16 left-4 rounded-2xl border border-cocoa/10 bg-porcelain p-5 shadow-[0_18px_50px_rgba(75,48,34,0.12)]">
              <Leaf className="text-forest" />
              <p className="mt-3 text-sm font-semibold">{language === "en" ? "Natural · Vegetarian" : "天然 · 素食"}</p>
              <p className="mt-1 text-xs text-cocoa/60">{language === "en" ? "Made without preservatives" : "無添加防腐劑"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blush/55">
        <div className="container-shell grid md:grid-cols-2">
          <Link href="/cakes" className="focus-ring group border-b border-cocoa/10 py-16 md:border-r md:border-b-0 md:pr-12">
            <ShoppingBag className="text-forest" />
            <h2 className="display mt-8 text-5xl font-semibold">Basque cheesecake</h2>
            <p className="mt-2 font-serif text-xl text-caramel">巴斯克乳酪蛋糕</p>
            <p className="mt-5 max-w-md leading-7 text-cocoa/65">{language === "en" ? "Choose your flavour, then collect from a published Brisbane pickup location." : "選擇喜愛的口味，再從已公布的布里斯本取貨地點中預約。"}</p>
            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-forest">Explore cakes <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} /></span>
          </Link>
          <Link href="/classes" className="focus-ring group py-16 md:pl-12">
            <Palette className="text-forest" />
            <h2 className="display mt-8 text-5xl font-semibold">Mandala classes</h2>
            <p className="mt-2 font-serif text-xl text-caramel">曼陀羅靜心繪畫</p>
            <p className="mt-5 max-w-md leading-7 text-cocoa/65">{language === "en" ? "Slow down, learn dot painting, and create your own meditative artwork." : "慢下腳步，學習點繪技巧，完成屬於自己的療癒作品。"}</p>
            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-forest">View classes <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} /></span>
          </Link>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell">
          <SectionHeading title={language === "en" ? "Three comforting flavours" : "三種幸福滋味"} chinese={language === "en" ? "經典原味 · 法芙娜可可 · 厚芋泥" : "Original · Chocolate · Taro"} description={language === "en" ? "Balanced sweetness, creamy texture, and carefully selected ingredients in every six-inch cake." : "每一個六吋蛋糕，都有恰到好處的甜度、綿密口感與用心挑選的食材。"} />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
                  <Image src={product.image} alt={`${product.name.en} Basque cheesecake`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" style={{ objectPosition: product.imagePosition }} />
                </div>
                <div className="flex items-start justify-between gap-4 pt-6">
                  <div>
                    <h3 className="display text-3xl font-semibold">{t(product.name)}</h3>
                    <p className="mt-1 text-sm text-caramel">{language === "en" ? product.name.zh : product.name.en}</p>
                  </div>
                  <p className="font-semibold">from ${product.price}</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-cocoa/65">{t(product.description)}</p>
              </article>
            ))}
          </div>
          <Link href="/cakes" className="focus-ring mt-12 inline-flex min-h-12 items-center gap-2 rounded-full bg-cocoa px-6 py-3 font-semibold text-white">Build your order <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="bg-forest text-porcelain">
        <div className="container-shell grid items-center gap-12 py-20 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <SectionHeading title={language === "en" ? "Next cake days" : "下一次蛋糕日"} chinese="少量手作 · 預約取貨" />
            <p className="mt-5 max-w-xl leading-8 text-porcelain/70">{language === "en" ? "Debbie publishes only the dates and pickup windows she can personally fulfil. Reserve early, as each day has a small production limit." : "Debbie 只會開放能親自製作與交付的日期和時段。每日數量有限，建議提早預訂。"}</p>
          </div>
          <div className="divide-y divide-porcelain/15 rounded-2xl border border-porcelain/20">
            {cakeDates.map((date) => (
              <div key={date.id} className="flex items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                  <CalendarDays className="text-blush" />
                  <div><p className="font-semibold">{language === "en" ? date.date : date.dateZh}</p><p className="mt-1 text-sm text-porcelain/60">{date.slots.length} pickup options</p></div>
                </div>
                <span className="text-sm text-blush">{date.remaining} left</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell grid items-center gap-14 lg:grid-cols-2">
          <div className="relative grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-full"><Image src="/assets/mandala-class.jpg" alt="Debbie teaching mandala dot painting" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" /></div>
            <div className="relative mt-20 aspect-[3/4] overflow-hidden rounded-b-full"><Image src="/assets/mandala.jpg" alt="Green and gold hand-painted mandala artwork" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" /></div>
          </div>
          <div>
            <SectionHeading title={language === "en" ? "Create space to breathe" : "留一點空間，讓心呼吸"} chinese="Mandala drawing · 曼陀羅點繪" description={language === "en" ? "A welcoming guided class for beginners and returning makers. All materials are included, so you can simply arrive and enjoy the process." : "適合初學者與想再次創作的朋友。材料皆已準備好，只需要帶著自己，享受慢慢完成作品的過程。"} />
            <Link href="/classes" className="focus-ring mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-forest px-6 py-3 font-semibold text-white">See upcoming classes <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="paper border-y border-cocoa/10">
        <div className="container-shell py-24 text-center">
          <p className="display mx-auto max-w-3xl text-4xl leading-tight font-semibold md:text-6xl">“Made gently, shared with joy.”</p>
          <p className="mt-4 font-serif text-xl text-caramel">用心製作每一份甜點，分享幸福滋味</p>
          <Link href="/about" className="focus-ring mt-8 inline-flex items-center gap-2 font-semibold text-forest">Meet Debbie <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
