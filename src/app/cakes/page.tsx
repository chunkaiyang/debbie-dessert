"use client";

import Image from "next/image";
import { CakeOrderForm } from "@/components/cake-order-form";
import { useLanguage } from "@/components/language-provider";

export default function CakesPage() {
  const { language } = useLanguage();
  return (
    <>
      <section className="bg-blush/45">
        <div className="container-shell grid items-center gap-10 py-16 lg:grid-cols-[1fr_420px]">
          <div>
            <h1 className="display text-6xl leading-none font-semibold md:text-8xl">{language === "en" ? "Order a cake" : "訂購巴斯克蛋糕"}</h1>
            <p className="mt-4 font-serif text-2xl text-caramel">濃郁奶香 · 綿密細緻 · 幸福滋味</p>
            <p className="mt-6 max-w-2xl leading-8 text-cocoa/70">{language === "en" ? "Every six-inch cheesecake is vegetarian, handmade in small batches, and best enjoyed within four days. Select only from the dates and pickup windows Debbie can fulfil." : "每個六吋乳酪蛋糕皆為素食、小批量手作，建議四天內享用。請從 Debbie 已開放的日期與取貨時段中選擇。"}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src="/assets/694685329_27727454103509648_3353211077646939741_n.jpg" alt="Original and chocolate Basque cheesecakes" fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" /></div>
        </div>
      </section>
      <section className="section-pad">
        <div className="container-shell"><CakeOrderForm /></div>
      </section>
    </>
  );
}
