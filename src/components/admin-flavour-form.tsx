import Image from "next/image";
import type { AdminProduct } from "@/lib/admin-data";
import { saveCakeFlavour } from "@/app/admin/actions";

export function AdminFlavourForm({ product }: { product?: AdminProduct }) {
  return (
    <form action={saveCakeFlavour} className="rounded-2xl border border-black/8 bg-white p-6">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="variantId" value={product?.variantId ?? ""} />
      <input type="hidden" name="existingImagePath" value={product?.imagePath ?? ""} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{product ? product.nameEn : "Add a flavour"}</h2>
          <p className="mt-1 text-sm text-black/50">{product ? product.nameZh : "Create a new storefront cake option."}</p>
        </div>
        {product?.imagePath ? <Image src={product.imagePath} alt="" width={96} height={72} unoptimized className="h-20 w-28 rounded-lg object-cover" /> : null}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <label className="grid gap-1 text-xs font-semibold">Slug<input required name="slug" defaultValue={product?.slug ?? ""} placeholder="matcha" className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold">English name<input required name="nameEn" defaultValue={product?.nameEn ?? ""} className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold">Chinese name<input required name="nameZh" defaultValue={product?.nameZh ?? ""} className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold">Price (AUD)<input required type="number" min="0" step="0.01" name="priceDollars" defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""} className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold md:col-span-2">English description<textarea required rows={2} name="descriptionEn" defaultValue={product?.descriptionEn ?? ""} className="rounded-lg border border-black/15 px-3 py-2 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold md:col-span-2">Chinese description<textarea required rows={2} name="descriptionZh" defaultValue={product?.descriptionZh ?? ""} className="rounded-lg border border-black/15 px-3 py-2 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold md:col-span-2">English ingredients<input required name="ingredientsEn" defaultValue={product?.ingredientsEn ?? ""} className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold md:col-span-2">Chinese ingredients<input required name="ingredientsZh" defaultValue={product?.ingredientsZh ?? ""} className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold md:col-span-2">English allergens<input required name="allergensEn" defaultValue={product?.allergensEn ?? ""} className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold md:col-span-2">Chinese allergens<input required name="allergensZh" defaultValue={product?.allergensZh ?? ""} className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold md:col-span-2">Homepage notes (English, separated by |)<input name="notesEn" defaultValue={product?.homepageNotesEn.join(" | ") ?? ""} placeholder="Earthy | Smooth | Calming" className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold md:col-span-2">Homepage notes (Chinese, separated by |)<input name="notesZh" defaultValue={product?.homepageNotesZh.join(" | ") ?? ""} className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold">Display order<input required type="number" min="0" name="displayOrder" defaultValue={product?.displayOrder ?? 40} className="min-h-10 rounded-lg border border-black/15 px-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold md:col-span-2">Flavour image<input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="min-h-10 rounded-lg border border-black/15 px-3 py-2 text-sm font-normal" /><span className="font-normal text-black/45">JPEG, PNG or WebP, maximum 5 MB.</span></label>
        <label className="flex items-center gap-2 self-center text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Active on storefront</label>
      </div>
      <button className="mt-5 min-h-11 rounded-full bg-forest px-6 text-sm font-semibold text-white">{product ? "Save flavour" : "Add flavour"}</button>
    </form>
  );
}
