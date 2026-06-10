"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Check, ChevronRight, Minus, Plus, ShieldCheck } from "lucide-react";
import type { CakeOrderingData } from "@/lib/cake-availability";
import { getDemoCakeOrderingData } from "@/lib/cake-availability";
import { useLanguage } from "./language-provider";

type Quantities = Record<string, number>;
type FormErrorKey = "flavours" | "date" | "slot" | "name" | "phone" | "email" | "terms";
type FormErrors = Partial<Record<FormErrorKey, string>>;
type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; reference: string; mode: "live" | "demo"; message?: string }
  | { status: "error"; message: string };

function createInitialQuantities(data: CakeOrderingData): Quantities {
  return data.products.reduce<Quantities>((values, product) => {
    values[product.slug] = 0;
    return values;
  }, {});
}

function getInitialDate(data: CakeOrderingData) {
  if (typeof window !== "undefined") {
    const selectedServiceDate = new URLSearchParams(window.location.search).get("date");
    const selected = data.dates.find((date) => date.serviceDate === selectedServiceDate || date.id === selectedServiceDate);
    if (selected) return selected;
  }
}

export function CakeOrderForm() {
  const { language, t } = useLanguage();
  const [orderingData, setOrderingData] = useState<CakeOrderingData>(() => getDemoCakeOrderingData());
  const [quantities, setQuantities] = useState<Quantities>(() => createInitialQuantities(getDemoCakeOrderingData()));
  const [dateId, setDateId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      try {
        const response = await fetch("/api/cake-availability", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as CakeOrderingData;
        if (cancelled || data.products.length === 0) return;

        const initialDate = getInitialDate(data);
        setOrderingData(data);
        setQuantities(createInitialQuantities(data));
        setDateId(initialDate?.id ?? "");
        setSlotId(initialDate?.slots[0]?.id ?? "");
      } catch {
        // Keep the demo fallback when availability cannot be fetched.
      }
    }

    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDate = orderingData.dates.find((date) => date.id === dateId);
  const selectedSlot = selectedDate?.slots.find((slot) => slot.id === slotId);
  const totalQuantity = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  const total = useMemo(
    () => orderingData.products.reduce((sum, product) => sum + product.priceCents * (quantities[product.slug] ?? 0), 0) / 100,
    [orderingData.products, quantities],
  );
  const remainingUnits = selectedDate?.remainingUnits;
  const slotRemainingUnits = selectedSlot?.remainingUnits;
  const isOverDateCapacity = typeof remainingUnits === "number" && totalQuantity > remainingUnits;
  const isOverSlotCapacity = typeof slotRemainingUnits === "number" && totalQuantity > slotRemainingUnits;
  const canAttemptSubmit = !isOverDateCapacity && !isOverSlotCapacity && submitState.status !== "submitting";

  function clearFormError(key: FormErrorKey) {
    setFormErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function updateQuantity(slug: string, delta: number) {
    setQuantities((current) => ({
      ...current,
      [slug]: Math.max(0, Math.min(6, (current[slug] ?? 0) + delta)),
    }));
    clearFormError("flavours");
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const termsAccepted = formData.get("terms") === "on";
    const errors: FormErrors = {};

    if (totalQuantity === 0) errors.flavours = language === "en" ? "Choose at least one cake flavour." : "請至少選擇一款蛋糕口味。";
    if (!selectedDate) errors.date = language === "en" ? "Choose a pickup date." : "請選擇取貨日期。";
    if (!selectedSlot) errors.slot = language === "en" ? "Choose a pickup location." : "請選擇取貨地點。";
    if (!name) errors.name = language === "en" ? "Enter your name." : "請輸入姓名。";
    else if (name.length < 2) errors.name = language === "en" ? "Name must be at least 2 characters." : "姓名必須至少有 2 個字元。";
    if (!phone) errors.phone = language === "en" ? "Enter your phone number." : "請輸入電話號碼。";
    else if (phone.length < 8) errors.phone = language === "en" ? "Enter a valid phone number." : "請輸入有效的電話號碼。";
    if (!email) errors.email = language === "en" ? "Enter your email address." : "請輸入電郵地址。";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = language === "en" ? "Enter a valid email address." : "請輸入有效的電郵地址。";
    if (!termsAccepted) errors.terms = language === "en" ? "You must accept the pickup, allergen, change and cancellation terms." : "您必須接受取貨、過敏原、更改及取消條款。";

    setFormErrors(errors);
    const firstError = (["flavours", "date", "slot", "name", "phone", "email", "terms"] as const).find((key) => errors[key]);
    if (firstError) {
      const selector = firstError === "flavours"
        ? "#flavours-fieldset"
        : firstError === "date"
          ? "#date-fieldset"
          : firstError === "slot"
            ? "#slot-fieldset"
            : `[name="${firstError}"]`;
      requestAnimationFrame(() => form.querySelector<HTMLElement>(selector)?.focus());
      return;
    }
    if (!selectedDate || !selectedSlot || !canAttemptSubmit) return;

    const items = orderingData.products
      .filter((product) => (quantities[product.slug] ?? 0) > 0)
      .map((product) => ({ variantId: product.variantId, quantity: quantities[product.slug] }));

    setSubmitState({ status: "submitting" });
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          availabilityDateId: selectedDate.id,
          pickupSlotId: selectedSlot.id,
          customer: {
            name,
            phone,
            email,
            notes: String(formData.get("notes") ?? ""),
          },
          termsAccepted,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not reserve this order.");

      setSubmitState({
        status: "success",
        reference: payload.orderNumber ?? payload.reference ?? "DD-DEMO-1051",
        mode: payload.mode === "demo" ? "demo" : "live",
        message: payload.message,
      });
    } catch (error) {
      setSubmitState({ status: "error", message: error instanceof Error ? error.message : "Could not reserve this order." });
    }
  }

  if (submitState.status === "success") {
    return (
      <div className="rounded-2xl border border-forest/20 bg-white p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-forest text-white"><Check /></div>
        <h2 className="display mt-5 text-4xl font-semibold">{language === "en" ? "Your order is waiting for confirmation" : "訂單正在等待確認"}</h2>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-cocoa/65">
          {submitState.mode === "demo"
            ? submitState.message
            : language === "en"
              ? "Debbie will review your cake order and contact you to confirm pickup details and payment."
              : "Debbie 會查看您的蛋糕訂單，並聯絡您確認取貨資料與付款方式。"}
        </p>
        <p className="mt-5 font-semibold">Reference: {submitState.reference}</p>
        <button onClick={() => setSubmitState({ status: "idle" })} className="focus-ring mt-7 min-h-11 rounded-full border border-cocoa/25 px-5">Start another order</button>
      </div>
    );
  }

  if (orderingData.dates.length === 0) {
    return (
      <div className="rounded-2xl border border-cocoa/12 bg-white p-8 text-center">
        <h2 className="display text-4xl font-semibold">{language === "en" ? "No cake dates are open" : "暫未開放蛋糕日期"}</h2>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-cocoa/65">{language === "en" ? "Please check back soon for Debbie’s next available pickup dates." : "請稍後再查看 Debbie 下一批可取貨日期。"}</p>
      </div>
    );
  }

  return (
    <form className="grid gap-8 lg:grid-cols-[1fr_380px]" noValidate onSubmit={submitOrder}>
      <div className="space-y-8">
        <fieldset id="flavours-fieldset" tabIndex={-1} aria-describedby={formErrors.flavours ? "flavours-error" : undefined} className="rounded-2xl border border-cocoa/12 bg-white p-6 outline-none md:p-8">
          <legend className="display px-2 text-3xl font-semibold">1. {language === "en" ? "Choose flavours" : "選擇口味"} <span className="text-red-700" aria-hidden="true">*</span></legend>
          <div className="mt-5 divide-y divide-cocoa/10">
            {orderingData.products.map((product) => (
              <div key={product.slug} className="flex items-center justify-between gap-4 py-5">
                <div>
                  <p className="font-semibold">{t(product.name)} <span className="font-normal text-cocoa/45">· ${product.priceCents / 100}</span></p>
                  <p className="mt-1 text-sm text-cocoa/55">{language === "en" ? product.name.zh : product.name.en}</p>
                </div>
                <div className="flex items-center rounded-full border border-cocoa/20">
                  <button type="button" aria-label={`Remove ${product.name.en}`} className="focus-ring flex size-11 items-center justify-center rounded-full" onClick={() => updateQuantity(product.slug, -1)}><Minus size={16} /></button>
                  <output className="w-8 text-center font-semibold">{quantities[product.slug] ?? 0}</output>
                  <button type="button" aria-label={`Add ${product.name.en}`} className="focus-ring flex size-11 items-center justify-center rounded-full" onClick={() => updateQuantity(product.slug, 1)}><Plus size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          {formErrors.flavours ? <p id="flavours-error" role="alert" className="mt-4 text-sm font-semibold text-red-700">{formErrors.flavours}</p> : null}
        </fieldset>

        <fieldset id="date-fieldset" tabIndex={-1} aria-describedby={formErrors.date ? "date-error" : undefined} className="rounded-2xl border border-cocoa/12 bg-white p-6 outline-none md:p-8">
          <legend className="display px-2 text-3xl font-semibold">2. {language === "en" ? "Pickup date" : "取貨日期"} <span className="text-red-700" aria-hidden="true">*</span></legend>
          <div className="mt-5 grid gap-3">
            {orderingData.dates.map((date) => (
              <label key={date.id} className={`focus-within:ring-caramel flex cursor-pointer items-center justify-between rounded-xl border p-5 focus-within:ring-2 ${dateId === date.id ? "border-forest bg-forest/5" : "border-cocoa/15"} ${date.soldOut ? "opacity-60" : ""}`}>
                <span><span className="font-semibold">{language === "en" ? date.date : date.dateZh}</span><span className="mt-1 block text-sm text-cocoa/55">{date.soldOut ? "Sold out" : `${date.remainingUnits} ${language === "en" ? "cakes remaining" : "個名額"}`}</span></span>
                <input type="radio" name="date" value={date.id} required disabled={date.soldOut} checked={dateId === date.id} onChange={() => { setDateId(date.id); setSlotId(""); clearFormError("date"); clearFormError("slot"); }} className="size-5 accent-forest" />
              </label>
            ))}
          </div>
          {formErrors.date ? <p id="date-error" role="alert" className="mt-4 text-sm font-semibold text-red-700">{formErrors.date}</p> : null}
        </fieldset>

        <fieldset id="slot-fieldset" tabIndex={-1} aria-describedby={formErrors.slot ? "slot-error" : undefined} className="rounded-2xl border border-cocoa/12 bg-white p-6 outline-none md:p-8">
          <legend className="display px-2 text-3xl font-semibold">3. {language === "en" ? "Pickup location" : "取貨地點"} <span className="text-red-700" aria-hidden="true">*</span></legend>
          <div className="mt-5 grid gap-3">
            {!selectedDate ? <p className="text-sm text-cocoa/55">{language === "en" ? "Choose a pickup date first." : "請先選擇取貨日期。"}</p> : selectedDate.slots.map((slot) => {
              const slotFull = typeof slot.remainingUnits === "number" && slot.remainingUnits <= 0;
              return (
                <label key={slot.id} className={`focus-within:ring-caramel flex cursor-pointer items-center justify-between rounded-xl border p-5 focus-within:ring-2 ${slotId === slot.id ? "border-forest bg-forest/5" : "border-cocoa/15"} ${slotFull ? "opacity-60" : ""}`}>
                  <span><span className="font-medium">{slot.label}</span>{typeof slot.remainingUnits === "number" ? <span className="mt-1 block text-sm text-cocoa/55">{slotFull ? "Full" : `${slot.remainingUnits} cakes left in this slot`}</span> : null}</span>
                  <input type="radio" name="slot" value={slot.id} required disabled={slotFull} checked={slotId === slot.id} onChange={() => { setSlotId(slot.id); clearFormError("slot"); }} className="size-5 accent-forest" />
                </label>
              );
            })}
          </div>
          {formErrors.slot ? <p id="slot-error" role="alert" className="mt-4 text-sm font-semibold text-red-700">{formErrors.slot}</p> : null}
        </fieldset>

        <fieldset className="rounded-2xl border border-cocoa/12 bg-white p-6 md:p-8">
          <legend className="display px-2 text-3xl font-semibold">4. {language === "en" ? "Your details" : "聯絡資料"}</legend>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold"><span>Name · 姓名 <span className="text-red-700" aria-hidden="true">*</span></span><input required name="name" autoComplete="name" aria-invalid={Boolean(formErrors.name)} aria-describedby={formErrors.name ? "name-error" : undefined} onChange={() => clearFormError("name")} className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal outline-none focus:border-forest" />{formErrors.name ? <span id="name-error" role="alert" className="text-sm text-red-700">{formErrors.name}</span> : null}</label>
            <label className="grid gap-2 text-sm font-semibold"><span>Phone · 電話 <span className="text-red-700" aria-hidden="true">*</span></span><input required name="phone" autoComplete="tel" aria-invalid={Boolean(formErrors.phone)} aria-describedby={formErrors.phone ? "phone-error" : undefined} onChange={() => clearFormError("phone")} className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal outline-none focus:border-forest" />{formErrors.phone ? <span id="phone-error" role="alert" className="text-sm text-red-700">{formErrors.phone}</span> : null}</label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2"><span>Email · 電郵 <span className="text-red-700" aria-hidden="true">*</span></span><input required type="email" name="email" autoComplete="email" aria-invalid={Boolean(formErrors.email)} aria-describedby={formErrors.email ? "email-error" : undefined} onChange={() => clearFormError("email")} className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal outline-none focus:border-forest" />{formErrors.email ? <span id="email-error" role="alert" className="text-sm text-red-700">{formErrors.email}</span> : null}</label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Notes · 備註<textarea name="notes" rows={3} className="rounded-xl border border-cocoa/20 bg-porcelain px-4 py-3 font-normal outline-none focus:border-forest" placeholder="Allergies, pickup notes, or anything Debbie should know" /></label>
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-2xl bg-cocoa p-6 text-porcelain lg:sticky lg:top-28">
        <p className="display text-3xl font-semibold">{language === "en" ? "Order summary" : "訂單摘要"}</p>
        <div className="mt-6 space-y-3 border-y border-porcelain/15 py-5 text-sm">
          {orderingData.products.filter((product) => (quantities[product.slug] ?? 0) > 0).map((product) => (
            <div key={product.slug} className="flex justify-between gap-3"><span>{quantities[product.slug]} × {t(product.name)}</span><span>${(product.priceCents * (quantities[product.slug] ?? 0)) / 100}</span></div>
          ))}
          <div className="flex justify-between gap-3 text-porcelain/65"><span>{selectedDate ? (language === "en" ? selectedDate.date : selectedDate.dateZh) : (language === "en" ? "Pickup date not selected" : "尚未選擇取貨日期")}</span></div>
          <div className="text-porcelain/65">{selectedSlot?.label}</div>
          {orderingData.mode === "demo" ? <div className="rounded-lg bg-porcelain/10 p-3 text-xs text-porcelain/70">Demo availability. A submitted demo order will not reserve real capacity.</div> : null}
        </div>
        <div className="flex justify-between py-5 text-lg font-semibold"><span>Total</span><span>${total} AUD</span></div>
        {isOverDateCapacity ? <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-900">Only {remainingUnits} cakes remain for this date.</p> : null}
        {isOverSlotCapacity ? <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-900">Only {slotRemainingUnits} cakes remain for this pickup slot.</p> : null}
        {submitState.status === "error" ? <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-900">{submitState.message}</p> : null}
        <label className="flex gap-3 text-xs leading-5 text-porcelain/70"><input required name="terms" type="checkbox" aria-invalid={Boolean(formErrors.terms)} aria-describedby={formErrors.terms ? "terms-error" : undefined} onChange={() => clearFormError("terms")} className="mt-1 size-4 accent-blush" /><span>I accept the pickup, allergen, change and cancellation terms. <span className="text-blush" aria-hidden="true">*</span></span></label>
        {formErrors.terms ? <p id="terms-error" role="alert" className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-900">{formErrors.terms}</p> : null}
        <button disabled={!canAttemptSubmit} className="focus-ring mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-blush px-5 font-semibold text-cocoa disabled:cursor-not-allowed disabled:opacity-50">
          {submitState.status === "submitting" ? "Reserving..." : "Request confirmation"} <ChevronRight size={18} />
        </button>
        <p className="mt-4 flex items-center gap-2 text-xs text-porcelain/60"><ShieldCheck size={15} /> Debbie confirms availability and payment details manually.</p>
      </aside>
    </form>
  );
}
