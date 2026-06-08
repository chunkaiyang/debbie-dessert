"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, Minus, Plus, ShieldCheck } from "lucide-react";
import { cakeDates, products } from "@/lib/site-data";
import { useLanguage } from "./language-provider";

type Quantities = Record<(typeof products)[number]["id"], number>;

export function CakeOrderForm() {
  const { language, t } = useLanguage();
  const [quantities, setQuantities] = useState<Quantities>({ original: 1, chocolate: 0, taro: 0 });
  const [dateId, setDateId] = useState<string>(cakeDates[0].id);
  const [slotId, setSlotId] = useState<string>(cakeDates[0].slots[0].id);
  const [submitted, setSubmitted] = useState(false);
  const selectedDate = cakeDates.find((date) => date.id === dateId) ?? cakeDates[0];
  const totalQuantity = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  const total = useMemo(
    () => products.reduce((sum, product) => sum + product.price * quantities[product.id], 0),
    [quantities],
  );

  function updateQuantity(id: keyof Quantities, delta: number) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, Math.min(6, current[id] + delta)),
    }));
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-forest/20 bg-white p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-forest text-white"><Check /></div>
        <h2 className="display mt-5 text-4xl font-semibold">{language === "en" ? "Your order is held" : "已為您保留訂單"}</h2>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-cocoa/65">{language === "en" ? "In production, you will now continue to the secure payment provider. The cake capacity is held briefly and confirmed only after the payment webhook succeeds." : "正式上線後，您將前往安全付款頁面。蛋糕數量會短暫保留，並在付款系統確認成功後才正式成立。"}</p>
        <p className="mt-5 font-semibold">Demo reference: DD-DEMO-1051</p>
        <button onClick={() => setSubmitted(false)} className="focus-ring mt-7 min-h-11 rounded-full border border-cocoa/25 px-5">Start another order</button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-8 lg:grid-cols-[1fr_380px]"
      onSubmit={(event) => {
        event.preventDefault();
        if (totalQuantity > 0 && totalQuantity <= selectedDate.remaining) setSubmitted(true);
      }}
    >
      <div className="space-y-8">
        <fieldset className="rounded-2xl border border-cocoa/12 bg-white p-6 md:p-8">
          <legend className="display px-2 text-3xl font-semibold">1. {language === "en" ? "Choose flavours" : "選擇口味"}</legend>
          <div className="mt-5 divide-y divide-cocoa/10">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 py-5">
                <div>
                  <p className="font-semibold">{t(product.name)} <span className="font-normal text-cocoa/45">· ${product.price}</span></p>
                  <p className="mt-1 text-sm text-cocoa/55">{language === "en" ? product.name.zh : product.name.en}</p>
                </div>
                <div className="flex items-center rounded-full border border-cocoa/20">
                  <button type="button" aria-label={`Remove ${product.name.en}`} className="focus-ring flex size-11 items-center justify-center rounded-full" onClick={() => updateQuantity(product.id, -1)}><Minus size={16} /></button>
                  <output className="w-8 text-center font-semibold">{quantities[product.id]}</output>
                  <button type="button" aria-label={`Add ${product.name.en}`} className="focus-ring flex size-11 items-center justify-center rounded-full" onClick={() => updateQuantity(product.id, 1)}><Plus size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-cocoa/12 bg-white p-6 md:p-8">
          <legend className="display px-2 text-3xl font-semibold">2. {language === "en" ? "Pickup date" : "取貨日期"}</legend>
          <div className="mt-5 grid gap-3">
            {cakeDates.map((date) => (
              <label key={date.id} className={`focus-within:ring-caramel flex cursor-pointer items-center justify-between rounded-xl border p-5 focus-within:ring-2 ${dateId === date.id ? "border-forest bg-forest/5" : "border-cocoa/15"}`}>
                <span><span className="font-semibold">{language === "en" ? date.date : date.dateZh}</span><span className="mt-1 block text-sm text-cocoa/55">{date.remaining} {language === "en" ? "cakes remaining" : "個名額"}</span></span>
                <input type="radio" name="date" value={date.id} checked={dateId === date.id} onChange={() => { setDateId(date.id); setSlotId(date.slots[0].id); }} className="size-5 accent-forest" />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-cocoa/12 bg-white p-6 md:p-8">
          <legend className="display px-2 text-3xl font-semibold">3. {language === "en" ? "Pickup location" : "取貨地點"}</legend>
          <div className="mt-5 grid gap-3">
            {selectedDate.slots.map((slot) => (
              <label key={slot.id} className={`focus-within:ring-caramel flex cursor-pointer items-center justify-between rounded-xl border p-5 focus-within:ring-2 ${slotId === slot.id ? "border-forest bg-forest/5" : "border-cocoa/15"}`}>
                <span className="font-medium">{slot.label}</span>
                <input type="radio" name="slot" value={slot.id} checked={slotId === slot.id} onChange={() => setSlotId(slot.id)} className="size-5 accent-forest" />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-cocoa/12 bg-white p-6 md:p-8">
          <legend className="display px-2 text-3xl font-semibold">4. {language === "en" ? "Your details" : "聯絡資料"}</legend>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">Name · 姓名<input required name="name" autoComplete="name" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal outline-none focus:border-forest" /></label>
            <label className="grid gap-2 text-sm font-semibold">Phone · 電話<input required name="phone" autoComplete="tel" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal outline-none focus:border-forest" /></label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Email · 電郵<input required type="email" name="email" autoComplete="email" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal outline-none focus:border-forest" /></label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Notes · 備註<textarea name="notes" rows={3} className="rounded-xl border border-cocoa/20 bg-porcelain px-4 py-3 font-normal outline-none focus:border-forest" placeholder="Allergies, pickup notes, or anything Debbie should know" /></label>
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-2xl bg-cocoa p-6 text-porcelain lg:sticky lg:top-28">
        <p className="display text-3xl font-semibold">{language === "en" ? "Order summary" : "訂單摘要"}</p>
        <div className="mt-6 space-y-3 border-y border-porcelain/15 py-5 text-sm">
          {products.filter((product) => quantities[product.id] > 0).map((product) => (
            <div key={product.id} className="flex justify-between gap-3"><span>{quantities[product.id]} × {t(product.name)}</span><span>${product.price * quantities[product.id]}</span></div>
          ))}
          <div className="flex justify-between gap-3 text-porcelain/65"><span>{language === "en" ? selectedDate.date : selectedDate.dateZh}</span></div>
          <div className="text-porcelain/65">{selectedDate.slots.find((slot) => slot.id === slotId)?.label}</div>
        </div>
        <div className="flex justify-between py-5 text-lg font-semibold"><span>Total</span><span>${total} AUD</span></div>
        {totalQuantity > selectedDate.remaining ? <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-900">Only {selectedDate.remaining} cakes remain for this date.</p> : null}
        <label className="flex gap-3 text-xs leading-5 text-porcelain/70"><input required type="checkbox" className="mt-1 size-4 accent-blush" /><span>I accept the pickup, allergen, change and cancellation terms.</span></label>
        <button disabled={totalQuantity === 0 || totalQuantity > selectedDate.remaining} className="focus-ring mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-blush px-5 font-semibold text-cocoa disabled:cursor-not-allowed disabled:opacity-50">Continue to payment <ChevronRight size={18} /></button>
        <p className="mt-4 flex items-center gap-2 text-xs text-porcelain/60"><ShieldCheck size={15} /> Secure hosted payment; provider configured at deployment.</p>
      </aside>
    </form>
  );
}
