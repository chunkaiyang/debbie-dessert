"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CakeSlice,
  Camera,
  ChevronRight,
  Clock,
  Heart,
  Leaf,
  Mail,
  MapPin,
  Palette,
  Users,
} from "lucide-react";
import { Header } from "@/components/header";
import { classSessions, products } from "@/lib/site-data";
import type { CakeOrderingData } from "@/lib/cake-availability";
import { getDemoCakeOrderingData } from "@/lib/cake-availability";

const flavourDetails = [
  {
    id: "original",
    script: "Original",
    image: "/assets/original-card-crop.png",
    imagePosition: "50% 50%",
    notes: [
      ["Creamy", "濃郁奶香"],
      ["Rich & smooth", "綿密細緻"],
      ["Pure comfort", "幸福首選"],
    ],
  },
  {
    id: "chocolate",
    script: "Chocolate",
    image: "/assets/chocolate-card-crop.png",
    imagePosition: "50% 50%",
    notes: [
      ["Chocolatey", "香濃可可"],
      ["Balanced", "微苦不膩"],
      ["Deep flavour", "層次豐富"],
    ],
  },
  {
    id: "taro",
    script: "Taro",
    image: "/assets/taro-card-crop.png",
    imagePosition: "50% 50%",
    notes: [
      ["Taro", "大甲芋頭"],
      ["Two layers", "雙層享受"],
      ["Natural", "天然食材"],
    ],
  },
];

const values = [
  { icon: Leaf, title: "Natural & Vegetarian", zh: "天然素食", body: "Made with simple, wholesome ingredients.", bodyZh: "選用天然食材，簡單純粹。" },
  { icon: CakeSlice, title: "Handcrafted with Care", zh: "用心手作", body: "Every cake and class is made with intention.", bodyZh: "每一份甜品與課程，都是用心完成。" },
  { icon: Heart, title: "For Your Moments", zh: "療癒時刻", body: "Celebrate, connect, and be present.", bodyZh: "為慶祝、相聚或靜心時刻而生。" },
  { icon: Palette, title: "Create & Restore", zh: "創作與放鬆", body: "Slow down and create from within.", bodyZh: "放慢腳步，由內而外創作。" },
];

const faqs = [
  "How do I order a cake?",
  "Pickup, storage and best enjoyed",
  "Allergens and dietary information",
  "Class details and what to bring",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-porcelain text-cocoa">
      <Header />
      <main>
        <HeroSection />
        <PathwaysSection />
        <FlavoursSection />
        <AvailabilitySection />
        <MandalaSection />
        <ValuesSection />
        <BottomInfoSection />
      </main>
      <HomeFooter />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-cocoa/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_42%,rgba(232,206,193,0.5),transparent_34%),linear-gradient(90deg,#fff9f3_0%,#fff9f3_42%,#f8efe7_100%)]" />
      <div className="container-shell relative grid min-h-[690px] items-center gap-10 py-14 lg:grid-cols-[0.87fr_1.13fr]">
        <div className="relative z-10 max-w-[650px]">
          <h1 className="display text-[clamp(3.8rem,6.1vw,6.35rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-cocoa">
            Healing through
            <br />
            dessert
          </h1>
          <p className="mt-3 text-[clamp(1.85rem,3.4vw,3.35rem)] font-medium leading-tight tracking-[0.08em]">以甜品療癒日常</p>
          <Ornament className="my-6 w-72" />
          <p className="max-w-[370px] text-[15px] leading-6 text-cocoa/80">
            Natural vegetarian Basque cheesecakes and mindful mandala drawing classes in Brisbane.
          </p>
          <p className="mt-3 max-w-[395px] text-[15px] leading-7 tracking-[0.08em] text-cocoa/72">
            天然素食巴斯克乳酪蛋糕，與靜心曼陀羅繪畫課程，在布里斯本。
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/cakes" className="focus-ring inline-flex min-h-[58px] items-center gap-4 rounded-md bg-forest px-6 py-3 text-left font-semibold text-white shadow-sm transition hover:bg-cocoa">
              <CakeSlice size={34} strokeWidth={1.4} />
              <span>
                Order a cake
                <span className="block text-sm tracking-[0.18em]">訂購蛋糕</span>
              </span>
            </Link>
            <Link href="/classes" className="focus-ring inline-flex min-h-[58px] items-center gap-4 rounded-md border border-cocoa/45 bg-porcelain/70 px-6 py-3 text-left font-semibold text-cocoa transition hover:bg-white">
              <Palette size={34} strokeWidth={1.2} className="text-caramel" />
              <span>
                Book a class
                <span className="block text-sm tracking-[0.18em]">預約課程</span>
              </span>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <div className="mandala-dots absolute left-[4%] top-[3%] h-[460px] w-[460px] rounded-full opacity-55 [mask-image:radial-gradient(circle,black_58%,transparent_72%)]" />
          <div className="absolute left-0 top-[2%] h-[520px] w-full lg:left-auto lg:right-[-2%] lg:w-[95%]">
            <Image src="/assets/reference-hero-cake.png" alt="Whole Basque cheesecake with a cut slice and eucalyptus" fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-contain object-left lg:object-right" priority />
          </div>
        </div>
      </div>
    </section>
  );
}

function PathwaysSection() {
  return (
    <section className="border-b border-cocoa/10 bg-[linear-gradient(180deg,#fff9f3_0%,#fcf2ea_100%)] py-8">
      <SectionTitle title="Two paths to your moment of calm" zh="兩種方式，療癒你的日常" />
      <div className="container-shell mt-8 grid overflow-hidden rounded-xl border border-cocoa/12 bg-white/55 shadow-[0_16px_40px_rgba(75,48,34,0.06)] lg:grid-cols-2">
        <Link href="/cakes" className="focus-ring group relative min-h-[335px] overflow-hidden bg-blush/70 p-8 md:p-10">
          <div className="absolute right-0 top-0 h-[68%] min-h-[250px] w-[86%] md:h-[72%] md:w-[76%]">
            <Image src="/assets/original-card-crop.png" alt="Slice of original Basque cheesecake on a plate" fill sizes="(max-width: 1024px) 86vw, 38vw" className="object-contain object-right opacity-100 transition duration-500 group-hover:scale-[1.03]" style={{ objectPosition: "100% 0%" }} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(232,206,193,1)_0%,rgba(232,206,193,0.82)_20%,rgba(232,206,193,0)_48%),linear-gradient(180deg,rgba(232,206,193,0)_0%,rgba(232,206,193,0)_58%,rgba(232,206,193,0.94)_100%)]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(232,206,193,0.96)_0%,rgba(232,206,193,0.78)_38%,rgba(232,206,193,0.12)_68%,rgba(232,206,193,0)_100%)]" />
          <div className="relative max-w-[265px]">
            <CakeSlice size={42} strokeWidth={1.2} />
            <h3 className="display mt-8 text-4xl font-semibold">Cakes</h3>
            <p className="mt-1 text-2xl tracking-[0.08em]">蛋糕訂購</p>
            <p className="mt-8 text-[15px] leading-6 text-cocoa/75">Order freshly made Basque cheesecakes for your special moments.</p>
            <p className="mt-4 text-[14px] leading-6 tracking-[0.08em] text-cocoa/70">公開蛋糕日期，預訂新鮮製作的巴斯克乳酪蛋糕。</p>
            <span className="mt-10 inline-flex items-center text-sm font-semibold text-forest">
              View available dates <ChevronRight size={16} />
            </span>
            <span className="mt-1 block text-sm tracking-[0.12em] text-forest">查看可預訂日期</span>
          </div>
        </Link>
        <Link href="/classes" className="focus-ring group relative min-h-[335px] overflow-hidden bg-porcelain p-8 md:p-10">
          <div className="absolute right-0 top-0 h-full min-h-[335px] w-full md:w-[76%]">
            <Image src="/assets/mandala.jpg" alt="Hand-painted mandala artwork surrounded by greenery" fill sizes="(max-width: 1024px) 100vw, 38vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" style={{ objectPosition: "82% 12%" }} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,249,243,1)_0%,rgba(255,249,243,0.82)_22%,rgba(255,249,243,0)_50%),linear-gradient(180deg,rgba(255,249,243,0)_0%,rgba(255,249,243,0)_62%,rgba(255,249,243,0.92)_100%)]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,249,243,0.98)_0%,rgba(255,249,243,0.82)_38%,rgba(255,249,243,0.16)_68%,rgba(255,249,243,0)_100%)]" />
          <div className="relative ml-auto max-w-[310px] lg:ml-0">
            <Palette className="text-forest" size={42} strokeWidth={1.2} />
            <h3 className="display mt-8 text-4xl font-semibold">Mandala Classes</h3>
            <p className="mt-1 text-2xl tracking-[0.08em]">曼陀羅繪畫課程</p>
            <p className="mt-8 text-[15px] leading-6 text-cocoa/75">Slow down, unwind and create your own mandala art.</p>
            <p className="mt-4 text-[14px] leading-6 tracking-[0.08em] text-cocoa/70">放慢步伐，沉澱心緒，創作屬於你的曼陀羅畫。</p>
            <span className="mt-10 inline-flex items-center text-sm font-semibold text-forest">
              See upcoming classes <ChevronRight size={16} />
            </span>
            <span className="mt-1 block text-sm tracking-[0.12em] text-forest">查看課程時間</span>
          </div>
        </Link>
      </div>
    </section>
  );
}

function FlavoursSection() {
  return (
    <section className="bg-porcelain py-8">
      <SectionTitle title="Basque Cheesecake Flavours" zh="巴斯克乳酪蛋糕口味" />
      <div className="container-shell mt-9 grid gap-8 md:grid-cols-3">
        {products.map((product) => {
          const details = flavourDetails.find((item) => item.id === product.id) ?? flavourDetails[0];
          return (
            <article key={product.id} className="overflow-hidden rounded-lg border border-blush bg-porcelain shadow-[0_10px_26px_rgba(75,48,34,0.04)]">
              <div className="relative h-[245px] overflow-hidden bg-white">
                <Image src={details.image} alt={`${product.name.en} Basque cheesecake slice`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" style={{ objectPosition: details.imagePosition }} />
                <div className="absolute left-5 top-4 rounded-full bg-caramel px-5 py-2 text-sm font-semibold tracking-[0.12em] text-white">{product.name.zh}</div>
                <div className="absolute left-[150px] top-5 font-serif text-2xl italic text-cocoa/80">{details.script}</div>
              </div>
              <div className="grid grid-cols-3 border-y border-blush/80 bg-porcelain">
                {details.notes.map(([en, zh], index) => (
                  <div key={en} className="border-r border-blush/70 px-3 py-4 text-center last:border-r-0">
                    {index === 0 ? <Leaf className="mx-auto text-caramel" size={22} strokeWidth={1.2} /> : index === 1 ? <CakeSlice className="mx-auto text-caramel" size={22} strokeWidth={1.2} /> : <Heart className="mx-auto text-caramel" size={22} strokeWidth={1.2} />}
                    <p className="mt-2 text-xs tracking-[0.08em]">{zh}</p>
                    <p className="mt-1 text-[11px] text-cocoa/65">{en}</p>
                  </div>
                ))}
              </div>
              <p className="py-4 text-center font-serif text-xl">
                From ${product.price} <span className="text-sm">起</span>
              </p>
            </article>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Link href="/cakes" className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-caramel/55 px-8 text-sm font-semibold text-cocoa transition hover:bg-blush/40">
          View all cakes <span className="ml-3 tracking-[0.1em]">查看全部蛋糕</span>
        </Link>
      </div>
    </section>
  );
}

function AvailabilitySection() {
  const [orderingData, setOrderingData] = useState<CakeOrderingData>(() => getDemoCakeOrderingData());

  useEffect(() => {
    let cancelled = false;
    async function loadAvailability() {
      try {
        const response = await fetch("/api/cake-availability", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as CakeOrderingData;
        if (!cancelled && data.dates.length > 0) setOrderingData(data);
      } catch {
        // Keep the demo fallback when live availability cannot be fetched.
      }
    }
    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, []);

  const availabilityCards = orderingData.dates.slice(0, 4);
  const pickupLocations = Array.from(new Set(availabilityCards.flatMap((date) => date.slots.map((slot) => slot.locationName))));

  return (
    <section className="relative overflow-hidden bg-[#fbf5ed] py-10">
      <div className="absolute -left-8 top-10 hidden h-56 w-32 rounded-full border border-sage/35 md:block" />
      <div className="container-shell grid gap-8 lg:grid-cols-[1fr_240px]">
        <div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="display text-3xl font-semibold">Upcoming Cake Availability</h2>
              <p className="mt-1 text-lg tracking-[0.1em]">近期可預訂日期</p>
            </div>
            <Link href="/cakes" className="focus-ring hidden text-sm font-semibold text-forest sm:inline-flex">
              View full calendar <ChevronRight size={16} />
            </Link>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-4">
            {availabilityCards.map((card) => (
              <article key={card.id} className="rounded-lg border border-sage/55 bg-porcelain p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-center font-serif">
                    <p className="text-sm">{card.day}</p>
                    <p className="text-3xl font-semibold">{card.serviceDate.split("-")[2]}</p>
                    <p className="text-sm">{card.month}</p>
                  </div>
                  <div className="pt-1 text-sm leading-6">
                    <p className="font-semibold">{card.slots.length} {card.slots.length === 1 ? "location" : "locations"}</p>
                    <p className="tracking-[0.08em] text-cocoa/70">多個取貨地點</p>
                    <p className="mt-1 text-xs">{card.slots[0]?.label ?? "Pickup to be confirmed"}</p>
                  </div>
                </div>
                <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-cocoa/14">
                  <div className="h-full rounded-full bg-forest" style={{ width: `${card.capacityUnits === 0 ? 100 : ((card.capacityUnits - card.remainingUnits) / card.capacityUnits) * 100}%` }} />
                </div>
                <p className="mt-3 text-sm">
                  {card.soldOut ? "Sold out" : `${card.remainingUnits} / ${card.capacityUnits} cakes left`}
                  <span className="block tracking-[0.08em] text-cocoa/70">{card.soldOut ? "已售完" : `尚餘 ${card.remainingUnits} / ${card.capacityUnits} 個蛋糕`}</span>
                </p>
                <Link href={`/cakes?date=${card.serviceDate}`} className={`focus-ring mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-md border text-sm font-semibold ${card.soldOut ? "border-caramel/45 text-cocoa" : "border-forest bg-forest text-white hover:bg-cocoa"}`}>
                  {card.soldOut ? "View date" : "Order now"}
                  <span className="ml-2 tracking-[0.12em]">{card.soldOut ? "查看日期" : "立即訂購"}</span>
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-cocoa/65">
            <p>All times are in Australia/Brisbane (AEST) 澳洲布里斯本時間</p>
            <p>Orders close 2 days before each date 每個日期前 2 天截止下單</p>
          </div>
        </div>
        <aside className="rounded-lg border border-blush bg-porcelain p-6">
          <h3 className="font-serif text-xl font-semibold">Pickup locations</h3>
          <p className="mt-1 tracking-[0.12em]">取貨地點</p>
          <div className="mt-6 space-y-5 text-sm">
            {(pickupLocations.length > 0 ? pickupLocations : ["Park Ridge", "Sunnybank"]).map((location) => (
              <div key={location} className="flex gap-3">
                <MapPin className="mt-0.5 text-caramel" size={18} strokeWidth={1.4} />
                <p>
                  {location}
                  <span className="block text-cocoa/60">布里斯本南區</span>
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-cocoa/65">and more 更多地點陸續新增</p>
        </aside>
      </div>
    </section>
  );
}

function MandalaSection() {
  const nextClass = classSessions[0];

  return (
    <section className="relative overflow-hidden bg-blush/70">
      <div className="absolute -right-16 -top-20 h-80 w-80 rounded-full border border-white/60 mandala-dots opacity-50" />
      <div className="container-shell grid items-center gap-8 py-10 lg:grid-cols-[390px_1fr_260px]">
        <div className="relative h-[245px] overflow-hidden rounded-r-[80px] lg:rounded-none lg:rounded-r-[120px]">
          <Image src="/assets/mandala-class.jpg" alt="Mandala drawing class with dot painting tools" fill sizes="(max-width: 1024px) 100vw, 380px" className="object-cover" style={{ objectPosition: "44% 52%" }} />
        </div>
        <div className="max-w-xl px-2">
          <h2 className="display text-4xl font-semibold md:text-5xl">Mandala Drawing Classes</h2>
          <p className="mt-1 text-2xl tracking-[0.1em]">曼陀羅繪畫課程</p>
          <p className="mt-7 text-[15px] leading-7 text-cocoa/75">No experience needed. All materials are provided. Come as you are. Leave lighter.</p>
          <p className="mt-3 text-[15px] leading-7 tracking-[0.08em] text-cocoa/70">無需經驗，提供所有材料，靜心創作，讓自己更輕盈地生活。</p>
          <Link href="/classes" className="focus-ring mt-8 inline-flex min-h-12 items-center justify-center rounded-md border border-forest px-10 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white">
            View upcoming classes <span className="ml-3 tracking-[0.12em]">查看課程時間</span>
          </Link>
        </div>
        <aside className="relative rounded-lg bg-porcelain p-7 shadow-[0_18px_45px_rgba(75,48,34,0.1)]">
          <div className="flex gap-3 text-forest">
            <CalendarDays size={22} />
            <p className="text-sm font-semibold">
              Next class
              <span className="block tracking-[0.12em]">下一堂課</span>
            </p>
          </div>
          <p className="mt-6 font-serif text-xl">{nextClass.date}</p>
          <p className="mt-1 text-sm">{nextClass.time}</p>
          <div className="mt-4 flex gap-3 text-sm text-cocoa/70">
            <MapPin size={17} className="text-caramel" />
            <span>{nextClass.venue}</span>
          </div>
          <div className="mt-4 flex gap-3 text-sm text-cocoa/70">
            <Users size={17} className="text-caramel" />
            <span>{nextClass.remaining} / {nextClass.capacity} seats left</span>
          </div>
          <p className="mt-5 font-serif text-xl">From ${nextClass.price} 起</p>
          <Link href="/classes" className="focus-ring mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-forest text-sm font-semibold text-white hover:bg-cocoa">
            Book now <span className="ml-2 tracking-[0.12em]">立即預約</span>
          </Link>
        </aside>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="bg-porcelain py-9">
      <div className="container-shell grid gap-6 md:grid-cols-4">
        {values.map((value, index) => {
          const Icon = value.icon;
          return (
            <article key={value.title} className={`text-center ${index > 0 ? "md:border-l md:border-dashed md:border-caramel/35" : ""}`}>
              <Icon className="mx-auto text-caramel" size={42} strokeWidth={1.2} />
              <h3 className="mt-3 font-serif text-lg font-semibold">{value.title}</h3>
              <p className="tracking-[0.12em]">{value.zh}</p>
              <p className="mx-auto mt-3 max-w-[160px] text-xs leading-5 text-cocoa/70">{value.body}</p>
              <p className="mx-auto mt-1 max-w-[160px] text-xs leading-5 tracking-[0.08em] text-cocoa/60">{value.bodyZh}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BottomInfoSection() {
  return (
    <section className="border-t border-cocoa/10 bg-[#fbf2ea]">
      <div className="container-shell grid lg:grid-cols-3">
        <div className="p-10">
          <h2 className="font-serif text-2xl font-semibold">FAQ</h2>
          <p className="tracking-[0.12em]">常見問題</p>
          <div className="mt-6 overflow-hidden rounded-lg border border-blush bg-porcelain">
            {faqs.map((faq) => (
              <Link key={faq} href="/faq" className="focus-ring flex items-center justify-between border-b border-blush px-4 py-3 text-sm last:border-b-0 hover:bg-white">
                <span>{faq}</span>
                <ChevronRight size={16} className="text-caramel" />
              </Link>
            ))}
          </div>
          <Link href="/faq" className="focus-ring mt-6 inline-flex items-center text-sm font-semibold text-forest">
            View all FAQs <ChevronRight size={16} />
            <span className="ml-4 tracking-[0.12em]">查看全部常見問題</span>
          </Link>
        </div>
        <div className="bg-blush/55 p-10 text-center">
          <h2 className="font-serif text-2xl font-semibold">About Debbie</h2>
          <p className="tracking-[0.12em]">關於 Debbie</p>
          <Image src="/assets/logo.jpg" alt="Debbie Dessert logo" width={170} height={170} className="mx-auto mt-6 rounded-sm object-cover mix-blend-multiply" />
          <div className="mt-6 flex justify-center gap-4 text-cocoa">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cocoa/35"><Camera size={17} /></span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cocoa/35"><Heart size={17} /></span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cocoa/35"><Mail size={17} /></span>
          </div>
        </div>
        <div className="p-10">
          <h2 className="font-serif text-2xl font-semibold">Contact</h2>
          <p className="tracking-[0.12em]">聯絡我們</p>
          <div className="mt-6 space-y-4 text-sm leading-6">
            <p className="flex gap-3"><Clock className="mt-1 text-forest" size={17} />0423 456 789</p>
            <p className="flex gap-3"><Mail className="mt-1 text-forest" size={17} />hello@debbiedessert.com.au</p>
            <p className="flex gap-3"><MapPin className="mt-1 text-forest" size={17} />Brisbane, QLD 布里斯本，昆士蘭</p>
            <p className="pt-2 text-cocoa/70">Response time 回覆時間<br />Usually within 1-2 business days 通常 1-2 個工作天內回覆</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeFooter() {
  return (
    <footer className="bg-forest text-porcelain">
      <div className="container-shell flex flex-col gap-4 py-5 text-xs md:flex-row md:items-center md:justify-between">
        <p>© 2026 Debbie Dessert 甜品療癒師. All rights reserved.</p>
        <div className="flex flex-wrap gap-8">
          <Link href="/faq" className="focus-ring hover:text-blush">Privacy Policy 隱私政策</Link>
          <Link href="/faq" className="focus-ring hover:text-blush">Terms 條款</Link>
          <Link href="/faq" className="focus-ring hover:text-blush">Refunds 退款政策</Link>
        </div>
      </div>
    </footer>
  );
}

function SectionTitle({ title, zh }: { title: string; zh: string }) {
  return (
    <div className="text-center">
      <h2 className="display text-4xl font-semibold leading-tight md:text-5xl">{title}</h2>
      <p className="mt-1 text-2xl tracking-[0.12em]">{zh}</p>
      <Ornament className="mx-auto mt-3 w-40" />
    </div>
  );
}

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-caramel ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-caramel/45" />
      <Heart size={18} strokeWidth={1.2} />
      <span className="h-px flex-1 bg-caramel/45" />
    </div>
  );
}
