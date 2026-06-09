"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays, Check, Clock, MapPin, Minus, Plus, Users } from "lucide-react";
import { classSessions } from "@/lib/site-data";
import { useLanguage } from "./language-provider";

type FormErrors = Record<string, string>;

export function ClassBookingForm() {
  const { language, t } = useLanguage();
  const [sessionId, setSessionId] = useState("");
  const [seatCount, setSeatCount] = useState(1);
  const [minorFlags, setMinorFlags] = useState<boolean[]>([false]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const selectedSession = classSessions.find((item) => item.id === sessionId);
  const session = selectedSession ?? classSessions[0];

  function clearFormError(key: string) {
    setFormErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function changeSeats(delta: number) {
    const next = Math.max(1, Math.min(session.remaining, seatCount + delta));
    setSeatCount(next);
    setMinorFlags((current) => Array.from({ length: next }, (_, index) => current[index] ?? false));
    setFormErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([key]) => !key.startsWith("attendee-") || Number(key.replace("attendee-", "")) < next),
    ));
  }

  function selectSession(id: string) {
    setSessionId(id);
    setSeatCount(1);
    setMinorFlags([false]);
    setFormErrors((current) => {
      const next = { ...current };
      delete next.session;
      delete next.guardianName;
      delete next.guardianAcknowledged;
      for (const key of Object.keys(next)) {
        if (key.startsWith("attendee-") && key !== "attendee-0") delete next[key];
      }
      return next;
    });
  }

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const errors: FormErrors = {};
    const required = (key: string, messageEn: string, messageZh: string) => {
      const value = String(formData.get(key) ?? "").trim();
      if (!value) errors[key] = language === "en" ? messageEn : messageZh;
      else if (value.length < 2) errors[key] = language === "en" ? "Please enter at least 2 characters." : "請至少輸入 2 個字元。";
      return value;
    };

    if (!selectedSession) errors.session = language === "en" ? "Choose a class session." : "請選擇課程時段。";
    for (let index = 0; index < seatCount; index += 1) {
      required(`attendee-${index}`, `Enter attendee ${index + 1}'s name.`, `請輸入第 ${index + 1} 位參加者姓名。`);
    }

    const hasMinor = minorFlags.some(Boolean);
    if (hasMinor) {
      required("guardianName", "Enter the guardian's name.", "請輸入監護人姓名。");
      if (formData.get("guardianAcknowledged") !== "on") {
        errors.guardianAcknowledged = language === "en"
          ? "Confirm the guardian arrangement for the minor."
          : "請確認未成年參加者的監護人安排。";
      }
    }

    required("contactName", "Enter the booking contact's name.", "請輸入預約聯絡人姓名。");
    const phone = required("contactPhone", "Enter a phone number.", "請輸入電話號碼。");
    if (phone && phone.length < 8) errors.contactPhone = language === "en" ? "Enter a valid phone number." : "請輸入有效的電話號碼。";
    const email = required("contactEmail", "Enter an email address.", "請輸入電郵地址。");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.contactEmail = language === "en" ? "Enter a valid email address." : "請輸入有效的電郵地址。";
    if (formData.get("terms") !== "on") {
      errors.terms = language === "en"
        ? "You must accept the attendance, cancellation, guardian and payment terms."
        : "您必須接受出席、取消、監護人及付款條款。";
    }

    setFormErrors(errors);
    const errorOrder = [
      "session",
      ...Array.from({ length: seatCount }, (_, index) => `attendee-${index}`),
      ...(hasMinor ? ["guardianName", "guardianAcknowledged"] : []),
      "contactName",
      "contactPhone",
      "contactEmail",
      "terms",
    ];
    const firstError = errorOrder.find((key) => errors[key]);
    if (firstError) {
      const selector = firstError === "session" ? "#session-fieldset" : `[name="${firstError}"]`;
      requestAnimationFrame(() => form.querySelector<HTMLElement>(selector)?.focus());
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-forest/20 bg-white p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-forest text-white"><Check /></div>
        <h2 className="display mt-5 text-4xl font-semibold">{language === "en" ? "Your seats are booked" : "課程預約成功"}</h2>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-cocoa/65">{language === "en" ? "A confirmation and class reminder will be sent by email. Payment is made in person after the class." : "我們會以電郵寄出確認與課前提醒。費用於課程結束後現場支付。"}</p>
        <p className="mt-5 font-semibold">Demo reference: MC-DEMO-304</p>
        <button onClick={() => setSubmitted(false)} className="focus-ring mt-7 min-h-11 rounded-full border border-cocoa/25 px-5">Book another class</button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submitBooking} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <fieldset id="session-fieldset" tabIndex={-1} aria-describedby={formErrors.session ? "session-error" : undefined} className="rounded-2xl border border-cocoa/12 bg-white p-6 outline-none md:p-8">
          <legend className="display px-2 text-3xl font-semibold">1. {language === "en" ? "Choose a session" : "選擇課程"} <span className="text-red-700" aria-hidden="true">*</span></legend>
          <div className="mt-5 grid gap-4">
            {classSessions.map((item) => (
              <label key={item.id} className={`focus-within:ring-caramel cursor-pointer rounded-xl border p-5 focus-within:ring-2 ${sessionId === item.id ? "border-forest bg-forest/5" : "border-cocoa/15"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="display text-2xl font-semibold">{t(item.title)}</p>
                    <p className="mt-3 flex items-center gap-2 text-sm"><CalendarDays size={16} /> {language === "en" ? item.date : item.dateZh}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm"><Clock size={16} /> {item.time}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm"><MapPin size={16} /> {item.venue}</p>
                  </div>
                  <input type="radio" name="session" value={item.id} required checked={sessionId === item.id} onChange={() => selectSession(item.id)} className="mt-1 size-5 accent-forest" />
                </div>
                <div className="mt-4 flex justify-between border-t border-cocoa/10 pt-4 text-sm"><span>${item.price} per person</span><span className="text-forest">{item.remaining} seats left</span></div>
              </label>
            ))}
          </div>
          {formErrors.session ? <p id="session-error" role="alert" className="mt-4 text-sm font-semibold text-red-700">{formErrors.session}</p> : null}
        </fieldset>

        <fieldset className="rounded-2xl border border-cocoa/12 bg-white p-6 md:p-8">
          <legend className="display px-2 text-3xl font-semibold">2. {language === "en" ? "Attendees" : "參加者"} <span className="text-red-700" aria-hidden="true">*</span></legend>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-cream p-4">
            <span className="font-semibold">{language === "en" ? "Number of seats" : "預約人數"} <span className="text-red-700" aria-hidden="true">*</span></span>
            <div className="flex items-center rounded-full border border-cocoa/20 bg-white">
              <button type="button" aria-label="Remove seat" className="focus-ring flex size-11 items-center justify-center rounded-full" onClick={() => changeSeats(-1)}><Minus size={16} /></button>
              <output className="w-8 text-center font-semibold">{seatCount}</output>
              <button type="button" aria-label="Add seat" className="focus-ring flex size-11 items-center justify-center rounded-full" onClick={() => changeSeats(1)}><Plus size={16} /></button>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {Array.from({ length: seatCount }, (_, index) => (
              <div key={index} className="grid gap-4 rounded-xl border border-cocoa/12 p-4 sm:grid-cols-[1fr_auto]">
                <label className="grid gap-2 text-sm font-semibold"><span>Attendee {index + 1} name · 參加者姓名 <span className="text-red-700" aria-hidden="true">*</span></span><input required name={`attendee-${index}`} aria-invalid={Boolean(formErrors[`attendee-${index}`])} aria-describedby={formErrors[`attendee-${index}`] ? `attendee-${index}-error` : undefined} onChange={() => clearFormError(`attendee-${index}`)} className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal outline-none focus:border-forest" />{formErrors[`attendee-${index}`] ? <span id={`attendee-${index}-error`} role="alert" className="text-sm text-red-700">{formErrors[`attendee-${index}`]}</span> : null}</label>
                <label className="flex min-h-12 items-center gap-2 self-end text-sm"><input type="checkbox" checked={minorFlags[index]} onChange={(event) => { setMinorFlags((current) => current.map((flag, flagIndex) => flagIndex === index ? event.target.checked : flag)); if (!event.target.checked && minorFlags.filter(Boolean).length === 1) { clearFormError("guardianName"); clearFormError("guardianAcknowledged"); } }} className="size-4 accent-forest" /> Under 18 · 未滿18歲</label>
              </div>
            ))}
          </div>
          {minorFlags.some(Boolean) ? (
            <div className="mt-5 rounded-xl border border-caramel/30 bg-amber-50 p-4">
              <label className="grid gap-2 text-sm font-semibold"><span>Guardian name · 監護人姓名 <span className="text-red-700" aria-hidden="true">*</span></span><input required name="guardianName" aria-invalid={Boolean(formErrors.guardianName)} aria-describedby={formErrors.guardianName ? "guardian-name-error" : undefined} onChange={() => clearFormError("guardianName")} className="min-h-12 rounded-xl border border-cocoa/20 bg-white px-4 font-normal" />{formErrors.guardianName ? <span id="guardian-name-error" role="alert" className="text-sm text-red-700">{formErrors.guardianName}</span> : null}</label>
              <label className="mt-4 flex gap-3 text-sm leading-6"><input required name="guardianAcknowledged" type="checkbox" aria-invalid={Boolean(formErrors.guardianAcknowledged)} aria-describedby={formErrors.guardianAcknowledged ? "guardian-acknowledged-error" : undefined} onChange={() => clearFormError("guardianAcknowledged")} className="mt-1 size-4 accent-forest" /><span>I confirm a responsible guardian will accompany or collect the minor according to Debbie’s class policy. <span className="text-red-700" aria-hidden="true">*</span></span></label>
              {formErrors.guardianAcknowledged ? <p id="guardian-acknowledged-error" role="alert" className="mt-3 text-sm font-semibold text-red-700">{formErrors.guardianAcknowledged}</p> : null}
            </div>
          ) : null}
        </fieldset>

        <fieldset className="rounded-2xl border border-cocoa/12 bg-white p-6 md:p-8">
          <legend className="display px-2 text-3xl font-semibold">3. {language === "en" ? "Booking contact" : "預約聯絡人"}</legend>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold"><span>Name · 姓名 <span className="text-red-700" aria-hidden="true">*</span></span><input required name="contactName" autoComplete="name" aria-invalid={Boolean(formErrors.contactName)} aria-describedby={formErrors.contactName ? "contact-name-error" : undefined} onChange={() => clearFormError("contactName")} className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal" />{formErrors.contactName ? <span id="contact-name-error" role="alert" className="text-sm text-red-700">{formErrors.contactName}</span> : null}</label>
            <label className="grid gap-2 text-sm font-semibold"><span>Phone · 電話 <span className="text-red-700" aria-hidden="true">*</span></span><input required name="contactPhone" autoComplete="tel" aria-invalid={Boolean(formErrors.contactPhone)} aria-describedby={formErrors.contactPhone ? "contact-phone-error" : undefined} onChange={() => clearFormError("contactPhone")} className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal" />{formErrors.contactPhone ? <span id="contact-phone-error" role="alert" className="text-sm text-red-700">{formErrors.contactPhone}</span> : null}</label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2"><span>Email · 電郵 <span className="text-red-700" aria-hidden="true">*</span></span><input required type="email" name="contactEmail" autoComplete="email" aria-invalid={Boolean(formErrors.contactEmail)} aria-describedby={formErrors.contactEmail ? "contact-email-error" : undefined} onChange={() => clearFormError("contactEmail")} className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal" />{formErrors.contactEmail ? <span id="contact-email-error" role="alert" className="text-sm text-red-700">{formErrors.contactEmail}</span> : null}</label>
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-2xl bg-forest p-6 text-porcelain lg:sticky lg:top-28">
        <p className="display text-3xl font-semibold">{selectedSession ? t(selectedSession.title) : (language === "en" ? "Choose a session" : "選擇課程")}</p>
        <div className="mt-5 space-y-3 border-y border-porcelain/15 py-5 text-sm text-porcelain/75">
          {selectedSession ? (
            <>
              <p className="flex gap-2"><CalendarDays size={17} /> {language === "en" ? selectedSession.date : selectedSession.dateZh}</p>
              <p className="flex gap-2"><Clock size={17} /> {selectedSession.time}</p>
              <p className="flex gap-2"><MapPin size={17} /> {selectedSession.venue}</p>
            </>
          ) : <p>{language === "en" ? "Select a class session to see its details." : "選擇課程後可查看詳細資料。"}</p>}
          <p className="flex gap-2"><Users size={17} /> {seatCount} {seatCount === 1 ? "seat" : "seats"}</p>
        </div>
        <div className="flex justify-between py-5 text-lg font-semibold"><span>Pay after class</span><span>{selectedSession ? `$${selectedSession.price * seatCount}` : "-"}</span></div>
        {selectedSession ? <p className="text-sm leading-6 text-porcelain/70">{t(selectedSession.inclusions)}. Suitable for beginners. Minimum participant age is {selectedSession.minimumAge}; minors require guardian acknowledgement.</p> : null}
        <label className="mt-5 flex gap-3 text-xs leading-5 text-porcelain/75"><input required name="terms" type="checkbox" aria-invalid={Boolean(formErrors.terms)} aria-describedby={formErrors.terms ? "terms-error" : undefined} onChange={() => clearFormError("terms")} className="mt-1 size-4 accent-blush" /><span>I accept the attendance, cancellation, guardian and in-person payment terms. <span className="text-blush" aria-hidden="true">*</span></span></label>
        {formErrors.terms ? <p id="terms-error" role="alert" className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-900">{formErrors.terms}</p> : null}
        <button className="focus-ring mt-6 min-h-12 w-full rounded-full bg-blush px-5 font-semibold text-cocoa">Confirm booking</button>
      </aside>
    </form>
  );
}
