"use client";

import { useLanguage } from "@/components/language-provider";

const faqs = [
  ["Are all cakes vegetarian?", "Yes. The launch range is vegetarian and contains dairy and egg. It is not vegan.", "所有蛋糕都是素食嗎？", "是的，首發系列皆為蛋奶素，含乳製品與蛋，並非純素。"],
  ["How should I store the cake?", "Keep refrigerated at or below 4°C and enjoy within four days.", "蛋糕如何保存？", "請於攝氏4度或以下冷藏，並建議四天內享用。"],
  ["Can you guarantee an allergen-free cake?", "No. Ingredients and known allergens are shown, but all cakes are prepared in a shared home-kitchen environment.", "可以保證無過敏原嗎？", "不可以。我們會標示食材與已知過敏原，但所有蛋糕皆在共用廚房環境製作。"],
  ["Can I change a paid order?", "Contact Debbie as early as possible. Changes and refunds depend on the production cutoff and ingredients already prepared.", "付款後可以更改訂單嗎？", "請盡早聯絡 Debbie。能否更改或退款，會依製作截止時間與已準備的材料而定。"],
  ["Do I pay for a mandala class online?", "No. Your place is reserved when you submit the booking, and payment is made in person after class.", "曼陀羅課程需要網上付款嗎？", "不需要。送出預約後即保留名額，費用於課程結束後現場支付。"],
  ["Can children attend?", "Yes, when the session age requirement is met. Minors require guardian acknowledgement and the stated supervision arrangements.", "小朋友可以參加嗎？", "可以，但需符合該課程的年齡要求。未成年人須由監護人確認並遵守課程所列的陪同安排。"],
];

export default function FaqPage() {
  const { language } = useLanguage();
  return (
    <section className="section-pad">
      <div className="container-shell max-w-4xl">
        <h1 className="display text-center text-6xl font-semibold md:text-8xl">{language === "en" ? "Questions, answered" : "常見問題"}</h1>
        <p className="mt-4 text-center font-serif text-xl text-caramel">Before your order or class · 預約前須知</p>
        <div className="mt-14 divide-y divide-cocoa/12 border-y border-cocoa/12">
          {faqs.map(([questionEn, answerEn, questionZh, answerZh]) => (
            <details key={questionEn} className="group py-6">
              <summary className="focus-ring cursor-pointer list-none pr-8 text-lg font-semibold marker:hidden">{language === "en" ? questionEn : questionZh}<span className="float-right text-caramel group-open:rotate-45">＋</span></summary>
              <p className="mt-4 max-w-3xl leading-8 text-cocoa/65">{language === "en" ? answerEn : answerZh}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
