export type Bilingual = { en: string; zh: string };

export const products = [
  {
    id: "original",
    name: { en: "Original", zh: "經典原味" },
    description: {
      en: "Deep dairy fragrance with a silky, custardy centre.",
      zh: "濃郁乳酪香氣，口感綿密細緻。",
    },
    price: 32,
    image: "/assets/menu.jpg",
    imagePosition: "50% 16%",
    ingredients: "Cream cheese, cream, eggs, sugar",
    allergens: "Contains milk and egg",
  },
  {
    id: "chocolate",
    name: { en: "Chocolate", zh: "法芙娜可可" },
    description: {
      en: "Rich Valrhona cocoa with a gently bittersweet finish.",
      zh: "法芙娜可可香醇濃郁，微苦不甜膩。",
    },
    price: 37,
    image: "/assets/694685329_27727454103509648_3353211077646939741_n.jpg",
    imagePosition: "50% 68%",
    ingredients: "Cream cheese, cocoa, cream, eggs, sugar",
    allergens: "Contains milk and egg",
  },
  {
    id: "taro",
    name: { en: "Taro", zh: "厚芋泥" },
    description: {
      en: "A comforting layer of real taro beneath classic cheesecake.",
      zh: "綿密芋泥搭配乳酪蛋糕，層次豐富。",
    },
    price: 40,
    image: "/assets/694872287_27727453810176344_1993055135370493075_n.jpg",
    imagePosition: "66% 54%",
    ingredients: "Taro, cream cheese, cream, eggs, sugar",
    allergens: "Contains milk and egg",
  },
] as const;

export const cakeDates = [
  {
    id: "2026-06-20",
    date: "Saturday, 20 June",
    dateZh: "6月20日 星期六",
    remaining: 8,
    slots: [
      { id: "park-ridge", label: "Park Ridge · 10:00–11:00 am" },
      { id: "calamvale", label: "Calamvale · 1:30–2:30 pm" },
      { id: "sunnybank", label: "Sunnybank · 3:00–4:00 pm" },
    ],
  },
  {
    id: "2026-06-27",
    date: "Saturday, 27 June",
    dateZh: "6月27日 星期六",
    remaining: 12,
    slots: [
      { id: "park-ridge", label: "Park Ridge · 10:00–11:00 am" },
      { id: "sunnybank", label: "Sunnybank · 2:00–3:00 pm" },
    ],
  },
] as const;

export const classSessions = [
  {
    id: "winter-calm",
    title: { en: "Winter Calm Mandala", zh: "冬日靜心曼陀羅" },
    date: "Sunday, 21 June 2026",
    dateZh: "2026年6月21日 星期日",
    time: "1:30–4:00 pm",
    venue: "Sunnybank Community Studio",
    price: 55,
    remaining: 5,
    capacity: 8,
    minimumAge: 10,
    inclusions: {
      en: "All materials, guided practice and tea",
      zh: "包含所有材料、引導練習與茶點",
    },
  },
  {
    id: "forest-bloom",
    title: { en: "Forest Bloom Mandala", zh: "森林花語曼陀羅" },
    date: "Sunday, 12 July 2026",
    dateZh: "2026年7月12日 星期日",
    time: "1:30–4:00 pm",
    venue: "Calamvale Community Place",
    price: 55,
    remaining: 8,
    capacity: 8,
    minimumAge: 10,
    inclusions: {
      en: "All materials, guided practice and tea",
      zh: "包含所有材料、引導練習與茶點",
    },
  },
] as const;

export const adminOrders = [
  { id: "DD-1048", customer: "Sophie Chen", date: "20 Jun", items: "2 Original · 1 Taro", slot: "Sunnybank 3 pm", status: "Confirmed" },
  { id: "DD-1047", customer: "Amy Liu", date: "20 Jun", items: "1 Chocolate", slot: "Calamvale 1:30 pm", status: "In production" },
  { id: "DD-1046", customer: "Mia Wong", date: "27 Jun", items: "2 Taro", slot: "Park Ridge 10 am", status: "Awaiting payment" },
] as const;
