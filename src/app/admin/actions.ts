"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getOwnerForAction, orderStatuses, paymentStatuses } from "@/lib/admin-data";

const orderUpdateSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(orderStatuses),
  paymentStatus: z.enum(paymentStatuses),
  paymentMethod: z.enum(["", "cash", "card", "bank_transfer", "other"]),
  paidDollars: z.coerce.number().min(0),
  refundedDollars: z.coerce.number().min(0),
  reason: z.string().trim().max(500),
});

export async function updateCakeOrder(formData: FormData) {
  const parsed = orderUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/orders?error=invalid-order-update");
  const { supabase } = await getOwnerForAction();
  const { error } = await supabase.rpc("owner_update_cake_order", {
    payload: {
      orderId: parsed.data.orderId,
      status: parsed.data.status,
      paymentStatus: parsed.data.paymentStatus,
      paymentMethod: parsed.data.paymentMethod,
      paidCents: Math.round(parsed.data.paidDollars * 100),
      refundedCents: Math.round(parsed.data.refundedDollars * 100),
      reason: parsed.data.reason,
    },
  });
  if (error) redirect(`/admin/orders/${parsed.data.orderId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  redirect(`/admin/orders/${parsed.data.orderId}?updated=1`);
}

const slotSchema = z.object({
  id: z.string().optional(),
  locationName: z.string().trim().min(2),
  address: z.string().trim().min(2),
  startsAt: z.iso.datetime({ local: true }),
  endsAt: z.iso.datetime({ local: true }),
  capacityUnits: z.string(),
  active: z.boolean(),
});

const availabilitySchema = z.object({
  id: z.string().optional(),
  serviceDate: z.iso.date(),
  status: z.enum(["draft", "published", "closed", "cancelled"]),
  capacityUnits: z.coerce.number().int().min(0),
  orderingCutoffAt: z.iso.datetime({ local: true }),
  customerNoteEn: z.string().trim().max(500),
  customerNoteZh: z.string().trim().max(500),
  slots: z.array(slotSchema).min(1),
});

export async function saveCakeAvailability(formData: FormData) {
  const rawSlots = [0, 1, 2, 3].flatMap((index) => {
    const locationName = String(formData.get(`slot-${index}-location`) ?? "").trim();
    if (!locationName) return [];
    return [{
      id: String(formData.get(`slot-${index}-id`) ?? ""),
      locationName,
      address: String(formData.get(`slot-${index}-address`) ?? ""),
      startsAt: String(formData.get(`slot-${index}-starts`) ?? ""),
      endsAt: String(formData.get(`slot-${index}-ends`) ?? ""),
      capacityUnits: String(formData.get(`slot-${index}-capacity`) ?? ""),
      active: formData.get(`slot-${index}-active`) === "on",
    }];
  });
  const parsed = availabilitySchema.safeParse({
    id: String(formData.get("id") ?? ""),
    serviceDate: formData.get("serviceDate"),
    status: formData.get("status"),
    capacityUnits: formData.get("capacityUnits"),
    orderingCutoffAt: formData.get("orderingCutoffAt"),
    customerNoteEn: formData.get("customerNoteEn"),
    customerNoteZh: formData.get("customerNoteZh"),
    slots: rawSlots,
  });
  if (!parsed.success) redirect("/admin/availability?error=invalid-availability");
  const { supabase } = await getOwnerForAction();
  const { error } = await supabase.rpc("owner_save_cake_availability", {
    payload: {
      ...parsed.data,
      id: parsed.data.id || null,
      orderingCutoffAt: `${parsed.data.orderingCutoffAt}:00+10:00`,
      slots: parsed.data.slots.map((slot) => ({
        ...slot,
        id: slot.id || null,
        startsAt: `${slot.startsAt}:00+10:00`,
        endsAt: `${slot.endsAt}:00+10:00`,
        capacityUnits: slot.capacityUnits || null,
      })),
    },
  });
  if (error) redirect(`/admin/availability?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath("/admin/availability");
  revalidatePath("/");
  revalidatePath("/cakes");
  redirect("/admin/availability?saved=1");
}

const productSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
  nameEn: z.string().trim().min(2),
  nameZh: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(2),
  descriptionZh: z.string().trim().min(1),
  ingredientsEn: z.string().trim().min(2),
  ingredientsZh: z.string().trim().min(1),
  allergensEn: z.string().trim().min(2),
  allergensZh: z.string().trim().min(1),
  priceDollars: z.coerce.number().min(0),
  displayOrder: z.coerce.number().int().min(0),
  notesEn: z.string(),
  notesZh: z.string(),
  active: z.boolean(),
});

export async function saveCakeFlavour(formData: FormData) {
  const parsed = productSchema.safeParse({
    ...Object.fromEntries(formData),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) redirect("/admin/flavours?error=invalid-flavour");
  const { supabase } = await getOwnerForAction();
  const image = formData.get("image");
  let imagePath = String(formData.get("existingImagePath") ?? "") || null;

  if (image instanceof File && image.size > 0) {
    if (image.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      redirect("/admin/flavours?error=invalid-image");
    }
    const extension = image.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const storagePath = `${parsed.data.slug}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("cake-flavours").upload(storagePath, image, {
      contentType: image.type,
      upsert: false,
    });
    if (uploadError) redirect(`/admin/flavours?error=${encodeURIComponent(uploadError.message)}`);
    imagePath = supabase.storage.from("cake-flavours").getPublicUrl(storagePath).data.publicUrl;
  }

  const productValues = {
    slug: parsed.data.slug,
    name_en: parsed.data.nameEn,
    name_zh: parsed.data.nameZh,
    description_en: parsed.data.descriptionEn,
    description_zh: parsed.data.descriptionZh,
    ingredients_en: parsed.data.ingredientsEn,
    ingredients_zh: parsed.data.ingredientsZh,
    allergens_en: parsed.data.allergensEn,
    allergens_zh: parsed.data.allergensZh,
    image_path: imagePath,
    active: parsed.data.active,
    display_order: parsed.data.displayOrder,
    homepage_notes_en: parsed.data.notesEn.split("|").map((value) => value.trim()).filter(Boolean).slice(0, 3),
    homepage_notes_zh: parsed.data.notesZh.split("|").map((value) => value.trim()).filter(Boolean).slice(0, 3),
    updated_at: new Date().toISOString(),
  };

  let productId = parsed.data.id;
  if (productId) {
    const { error } = await supabase.from("products").update(productValues).eq("id", productId);
    if (error) redirect(`/admin/flavours?error=${encodeURIComponent(error.message)}`);
  } else {
    const { data, error } = await supabase.from("products").insert(productValues).select("id").single();
    if (error) redirect(`/admin/flavours?error=${encodeURIComponent(error.message)}`);
    productId = data.id;
  }

  const variantValues = {
    product_id: productId,
    label_en: "6 inch",
    label_zh: "六吋",
    price_cents: Math.round(parsed.data.priceDollars * 100),
    capacity_units: 1,
    active: parsed.data.active,
  };
  const variantQuery = parsed.data.variantId
    ? supabase.from("product_variants").update(variantValues).eq("id", parsed.data.variantId)
    : supabase.from("product_variants").insert(variantValues);
  const { error: variantError } = await variantQuery;
  if (variantError) redirect(`/admin/flavours?error=${encodeURIComponent(variantError.message)}`);

  revalidatePath("/admin");
  revalidatePath("/admin/flavours");
  revalidatePath("/");
  revalidatePath("/cakes");
  redirect("/admin/flavours?saved=1");
}
