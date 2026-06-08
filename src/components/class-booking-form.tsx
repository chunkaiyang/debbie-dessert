"use client";

import { useState } from "react";
import { CalendarDays, Check, Clock, MapPin, Minus, Plus, Users } from "lucide-react";
import { classSessions } from "@/lib/site-data";
import { useLanguage } from "./language-provider";

export function ClassBookingForm() {
  const { language, t } = useLanguage();
  const [sessionId, setSessionId] = useState<string>(classSessions[0].id);
  const [seatCount, setSeatCount] = useState(1);
  const [minorFlags, setMinorFlags] = useState<boolean[]>([false]);
  const [submitted, setSubmitted] = useState(false);
  const session = classSessions.find((item) => item.id === sessionId) ?? classSessions[0];

  function changeSeats(delta: number) {
    const next = Math.max(1, Math.min(session.remaining, seatCount + delta));
    setSeatCount(next);
    setMinorFlags((current) => Array.from({ length: next }, (_, index) => current[index] ?? false));
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
    <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <fieldset className="rounded-2xl border border-cocoa/12 bg-white p-6 md:p-8">
          <legend className="display px-2 text-3xl font-semibold">1. {language === "en" ? "Choose a session" : "選擇課程"}</legend>
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
                  <input type="radio" name="session" checked={sessionId === item.id} onChange={() => { setSessionId(item.id); setSeatCount(1); setMinorFlags([false]); }} className="mt-1 size-5 accent-forest" />
                </div>
                <div className="mt-4 flex justify-between border-t border-cocoa/10 pt-4 text-sm"><span>${item.price} per person</span><span className="text-forest">{item.remaining} seats left</span></div>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-cocoa/12 bg-white p-6 md:p-8">
          <legend className="display px-2 text-3xl font-semibold">2. {language === "en" ? "Attendees" : "參加者"}</legend>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-cream p-4">
            <span className="font-semibold">{language === "en" ? "Number of seats" : "預約人數"}</span>
            <div className="flex items-center rounded-full border border-cocoa/20 bg-white">
              <button type="button" aria-label="Remove seat" className="focus-ring flex size-11 items-center justify-center rounded-full" onClick={() => changeSeats(-1)}><Minus size={16} /></button>
              <output className="w-8 text-center font-semibold">{seatCount}</output>
              <button type="button" aria-label="Add seat" className="focus-ring flex size-11 items-center justify-center rounded-full" onClick={() => changeSeats(1)}><Plus size={16} /></button>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {Array.from({ length: seatCount }, (_, index) => (
              <div key={index} className="grid gap-4 rounded-xl border border-cocoa/12 p-4 sm:grid-cols-[1fr_auto]">
                <label className="grid gap-2 text-sm font-semibold">Attendee {index + 1} name · 參加者姓名<input required name={`attendee-${index}`} className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal outline-none focus:border-forest" /></label>
                <label className="flex min-h-12 items-center gap-2 self-end text-sm"><input type="checkbox" checked={minorFlags[index]} onChange={(event) => setMinorFlags((current) => current.map((flag, flagIndex) => flagIndex === index ? event.target.checked : flag))} className="size-4 accent-forest" /> Under 18 · 未滿18歲</label>
              </div>
            ))}
          </div>
          {minorFlags.some(Boolean) ? (
            <div className="mt-5 rounded-xl border border-caramel/30 bg-amber-50 p-4">
              <label className="grid gap-2 text-sm font-semibold">Guardian name · 監護人姓名<input required className="min-h-12 rounded-xl border border-cocoa/20 bg-white px-4 font-normal" /></label>
              <label className="mt-4 flex gap-3 text-sm leading-6"><input required type="checkbox" className="mt-1 size-4 accent-forest" /><span>I confirm a responsible guardian will accompany or collect the minor according to Debbie’s class policy.</span></label>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="rounded-2xl border border-cocoa/12 bg-white p-6 md:p-8">
          <legend className="display px-2 text-3xl font-semibold">3. {language === "en" ? "Booking contact" : "預約聯絡人"}</legend>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">Name · 姓名<input required autoComplete="name" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold">Phone · 電話<input required autoComplete="tel" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal" /></label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Email · 電郵<input required type="email" autoComplete="email" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal" /></label>
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-2xl bg-forest p-6 text-porcelain lg:sticky lg:top-28">
        <p className="display text-3xl font-semibold">{t(session.title)}</p>
        <div className="mt-5 space-y-3 border-y border-porcelain/15 py-5 text-sm text-porcelain/75">
          <p className="flex gap-2"><CalendarDays size={17} /> {language === "en" ? session.date : session.dateZh}</p>
          <p className="flex gap-2"><Clock size={17} /> {session.time}</p>
          <p className="flex gap-2"><MapPin size={17} /> {session.venue}</p>
          <p className="flex gap-2"><Users size={17} /> {seatCount} {seatCount === 1 ? "seat" : "seats"}</p>
        </div>
        <div className="flex justify-between py-5 text-lg font-semibold"><span>Pay after class</span><span>${session.price * seatCount}</span></div>
        <p className="text-sm leading-6 text-porcelain/70">{t(session.inclusions)}. Suitable for beginners. Minimum participant age is {session.minimumAge}; minors require guardian acknowledgement.</p>
        <label className="mt-5 flex gap-3 text-xs leading-5 text-porcelain/75"><input required type="checkbox" className="mt-1 size-4 accent-blush" /><span>I accept the attendance, cancellation, guardian and in-person payment terms.</span></label>
        <button className="focus-ring mt-6 min-h-12 w-full rounded-full bg-blush px-5 font-semibold text-cocoa">Confirm booking</button>
      </aside>
    </form>
  );
}
