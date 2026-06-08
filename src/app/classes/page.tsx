"use client";

import Image from "next/image";
import { ClassBookingForm } from "@/components/class-booking-form";
import { useLanguage } from "@/components/language-provider";

export default function ClassesPage() {
  const { language } = useLanguage();
  return (
    <>
      <section className="bg-forest text-porcelain">
        <div className="container-shell grid min-h-[560px] items-center gap-12 py-16 lg:grid-cols-2">
          <div>
            <h1 className="display text-6xl leading-none font-semibold md:text-8xl">{language === "en" ? "Mandala classes" : "曼陀羅點繪課程"}</h1>
            <p className="mt-4 font-serif text-2xl text-blush">Slow down · Create · Connect</p>
            <p className="mt-7 max-w-xl leading-8 text-porcelain/70">{language === "en" ? "A gentle, guided creative session where dots become patterns and attention returns to the present moment. No previous art experience is needed." : "在溫柔引導中，讓一個個圓點成為圖案，讓注意力回到當下。無需任何繪畫經驗。"}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[50%_50%_18px_18px]"><Image src="/assets/mandala-class.jpg" alt="Mandala painting class and finished artwork" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority /></div>
        </div>
      </section>
      <section className="section-pad">
        <div className="container-shell"><ClassBookingForm /></div>
      </section>
    </>
  );
}
