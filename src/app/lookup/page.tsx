"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function LookupPage() {
  const { language } = useLanguage();
  const [searched, setSearched] = useState(false);
  return (
    <section className="section-pad">
      <div className="container-shell max-w-2xl text-center">
        <h1 className="display text-6xl font-semibold">{language === "en" ? "Find your booking" : "查詢訂單或預約"}</h1>
        <p className="mt-5 leading-7 text-cocoa/65">{language === "en" ? "Use the secure link in your confirmation email. For this demo, enter any reference to preview the lookup experience." : "請使用確認電郵中的安全連結。示範版本可輸入任何編號預覽查詢流程。"}</p>
        <form onSubmit={(event) => { event.preventDefault(); setSearched(true); }} className="mt-9 rounded-2xl border border-cocoa/12 bg-white p-6 text-left">
          <label className="grid gap-2 text-sm font-semibold">Reference number · 訂單編號<input required placeholder="DD-1048 or MC-304" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal" /></label>
          <label className="mt-5 grid gap-2 text-sm font-semibold">Email · 電郵<input required type="email" className="min-h-12 rounded-xl border border-cocoa/20 bg-porcelain px-4 font-normal" /></label>
          <button className="focus-ring mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-5 font-semibold text-white"><Search size={18} /> Look up</button>
        </form>
        {searched ? <div className="mt-6 rounded-xl bg-blush/45 p-5 text-left"><p className="font-semibold">Demo record located</p><p className="mt-2 text-sm text-cocoa/65">A production deployment returns records only through an expiring signed link or verified email flow.</p></div> : null}
      </div>
    </section>
  );
}
