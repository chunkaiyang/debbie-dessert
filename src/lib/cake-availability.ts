import { cakeDates, products } from "@/lib/site-data";

export type CakeProductOption = {
  id: string;
  slug: string;
  variantId: string;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  priceCents: number;
  image: string;
  imagePosition: string;
  ingredients: string;
  allergens: string;
  displayOrder: number;
  homepageNotesEn: string[];
  homepageNotesZh: string[];
};

export type CakePickupSlotOption = {
  id: string;
  label: string;
  locationName: string;
  startsAt: string;
  endsAt: string;
  capacityUnits: number | null;
  remainingUnits: number | null;
};

export type CakeAvailabilityDateOption = {
  id: string;
  serviceDate: string;
  date: string;
  dateZh: string;
  day: string;
  month: string;
  capacityUnits: number;
  remainingUnits: number;
  soldOut: boolean;
  orderingCutoffAt: string;
  slots: CakePickupSlotOption[];
};

export type CakeOrderingData = {
  mode: "live" | "demo";
  products: CakeProductOption[];
  dates: CakeAvailabilityDateOption[];
};

const formatter = new Intl.DateTimeFormat("en-AU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Australia/Brisbane",
});

const shortFormatter = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "Australia/Brisbane",
});

const zhFormatter = new Intl.DateTimeFormat("zh-Hant-AU", {
  month: "numeric",
  day: "numeric",
  weekday: "long",
  timeZone: "Australia/Brisbane",
});

function formatDateParts(serviceDate: string) {
  const date = new Date(`${serviceDate}T00:00:00+10:00`);
  const parts = shortFormatter.formatToParts(date);
  return {
    date: formatter.format(date),
    dateZh: zhFormatter.format(date),
    day: parts.find((part) => part.type === "weekday")?.value ?? "",
    month: parts.find((part) => part.type === "month")?.value ?? "",
  };
}

function formatSlotLabel(locationName: string, startsAt: string, endsAt: string) {
  const timeFormatter = new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Brisbane",
  });
  return `${locationName} · ${timeFormatter.format(new Date(startsAt))}-${timeFormatter.format(new Date(endsAt))}`;
}

export function getDemoCakeOrderingData(): CakeOrderingData {
  return {
    mode: "demo",
    products: products.map((product, index) => ({
      id: product.id,
      slug: product.id,
      variantId: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.price * 100,
      image: product.image,
      imagePosition: product.imagePosition,
      ingredients: product.ingredients,
      allergens: product.allergens,
      displayOrder: index * 10,
      homepageNotesEn: [],
      homepageNotesZh: [],
    })),
    dates: cakeDates.map((date) => {
      const parts = formatDateParts(date.id);
      return {
        id: date.id,
        serviceDate: date.id,
        date: date.date,
        dateZh: date.dateZh,
        day: parts.day,
        month: parts.month,
        capacityUnits: 20,
        remainingUnits: date.remaining,
        soldOut: date.remaining <= 0,
        orderingCutoffAt: "",
        slots: date.slots.map((slot) => ({
          id: slot.id,
          label: slot.label,
          locationName: slot.label.split(" · ")[0] ?? slot.label,
          startsAt: "",
          endsAt: "",
          capacityUnits: null,
          remainingUnits: null,
        })),
      };
    }),
  };
}

type LiveOrderingData = {
  products?: Array<{
    id: string;
    slug: string;
    variantId: string;
    nameEn: string;
    nameZh: string;
    descriptionEn: string;
    descriptionZh: string;
    priceCents: number;
    imagePath: string | null;
    ingredientsEn: string;
    allergensEn: string;
    displayOrder?: number;
    homepageNotesEn?: string[];
    homepageNotesZh?: string[];
  }>;
  dates?: Array<{
    id: string;
    serviceDate: string;
    capacityUnits: number;
    remainingUnits: number;
    orderingCutoffAt: string;
    slots?: Array<{
      id: string;
      locationName: string;
      startsAt: string;
      endsAt: string;
      capacityUnits: number | null;
      remainingUnits: number | null;
    }>;
  }>;
};

export function normalizeLiveOrderingData(data: LiveOrderingData): CakeOrderingData {
  return {
    mode: "live",
    products: (data.products ?? []).map((product) => {
      const fallback = products.find((item) => item.id === product.slug);
      return {
        id: product.id,
        slug: product.slug,
        variantId: product.variantId,
        name: { en: product.nameEn, zh: product.nameZh },
        description: { en: product.descriptionEn, zh: product.descriptionZh },
        priceCents: product.priceCents,
        image: product.imagePath ?? fallback?.image ?? "/assets/menu.jpg",
        imagePosition: fallback?.imagePosition ?? "50% 50%",
        ingredients: product.ingredientsEn,
        allergens: product.allergensEn,
        displayOrder: product.displayOrder ?? 0,
        homepageNotesEn: product.homepageNotesEn ?? [],
        homepageNotesZh: product.homepageNotesZh ?? [],
      };
    }).sort((a, b) => a.displayOrder - b.displayOrder),
    dates: (data.dates ?? []).map((date) => {
      const parts = formatDateParts(date.serviceDate);
      return {
        id: date.id,
        serviceDate: date.serviceDate,
        date: parts.date,
        dateZh: parts.dateZh,
        day: parts.day,
        month: parts.month,
        capacityUnits: date.capacityUnits,
        remainingUnits: date.remainingUnits,
        soldOut: date.remainingUnits <= 0,
        orderingCutoffAt: date.orderingCutoffAt,
        slots: (date.slots ?? []).map((slot) => ({
          id: slot.id,
          label: formatSlotLabel(slot.locationName, slot.startsAt, slot.endsAt),
          locationName: slot.locationName,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          capacityUnits: slot.capacityUnits,
          remainingUnits: slot.remainingUnits,
        })),
      };
    }),
  };
}
