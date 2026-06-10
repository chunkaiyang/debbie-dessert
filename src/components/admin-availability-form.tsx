"use client";

import { useState } from "react";
import type { AdminAvailability, AdminPickupLocation } from "@/lib/admin-data";
import { saveCakeAvailability } from "@/app/admin/actions";

function localDateTime(value?: string) {
  if (!value) return "";
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    hour12: false, timeZone: "Australia/Brisbane",
  });
  return formatter.format(new Date(value)).replace(" ", "T");
}

function PickupSlotFields({
  index,
  slot,
  savedLocations,
}: {
  index: number;
  slot?: AdminAvailability["slots"][number];
  savedLocations: AdminPickupLocation[];
}) {
  const initialKey = savedLocations.find(
    (location) => location.locationName === slot?.locationName && location.address === slot.address,
  )?.key ?? (slot ? "new" : "");
  const [selectedLocation, setSelectedLocation] = useState(initialKey);
  const [locationName, setLocationName] = useState(slot?.locationName ?? "");
  const [address, setAddress] = useState(slot?.address ?? "");

  function chooseLocation(key: string) {
    setSelectedLocation(key);
    if (key === "new") {
      setLocationName("");
      setAddress("");
      return;
    }
    const saved = savedLocations.find((location) => location.key === key);
    if (saved) {
      setLocationName(saved.locationName);
      setAddress(saved.address);
    }
  }

  return (
    <fieldset className="grid min-w-0 gap-4 rounded-xl border border-black/10 p-4 md:grid-cols-2 xl:grid-cols-12">
      <legend className="px-2 text-sm font-semibold">Slot {index + 1}</legend>
      <input type="hidden" name={`slot-${index}-id`} value={slot?.id ?? ""} />
      <label className="grid min-w-0 gap-1 text-xs font-semibold md:col-span-2 xl:col-span-4">
        Saved pickup location
        <select
          value={selectedLocation}
          onChange={(event) => chooseLocation(event.target.value)}
          className="min-h-10 w-full min-w-0 rounded-lg border border-black/15 px-3 text-sm font-normal"
        >
          <option value="">Choose a saved location</option>
          {savedLocations.map((location) => (
            <option key={location.key} value={location.key}>{location.locationName} · {location.address}</option>
          ))}
          <option value="new">Add new location</option>
        </select>
      </label>
      <label className="grid min-w-0 gap-1 text-xs font-semibold xl:col-span-3">
        Location
        <input
          required={index === 0}
          name={`slot-${index}-location`}
          value={locationName}
          onChange={(event) => {
            setLocationName(event.target.value);
            setSelectedLocation("new");
          }}
          className="min-h-10 w-full min-w-0 rounded-lg border border-black/15 px-3 text-sm font-normal"
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs font-semibold xl:col-span-5">
        Address
        <input
          required={index === 0}
          name={`slot-${index}-address`}
          value={address}
          onChange={(event) => {
            setAddress(event.target.value);
            setSelectedLocation("new");
          }}
          className="min-h-10 w-full min-w-0 rounded-lg border border-black/15 px-3 text-sm font-normal"
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs font-semibold xl:col-span-4">Starts<input required={index === 0} type="datetime-local" name={`slot-${index}-starts`} defaultValue={localDateTime(slot?.startsAt)} className="min-h-10 w-full min-w-0 rounded-lg border border-black/15 px-2 text-sm font-normal" /></label>
      <label className="grid min-w-0 gap-1 text-xs font-semibold xl:col-span-4">Ends<input required={index === 0} type="datetime-local" name={`slot-${index}-ends`} defaultValue={localDateTime(slot?.endsAt)} className="min-h-10 w-full min-w-0 rounded-lg border border-black/15 px-2 text-sm font-normal" /></label>
      <label className="flex min-w-0 items-center gap-2 text-sm font-semibold xl:col-span-4"><input type="checkbox" name={`slot-${index}-active`} defaultChecked={slot?.active ?? true} /> Active</label>
    </fieldset>
  );
}

export function AdminAvailabilityForm({
  availability,
  savedLocations,
}: {
  availability?: AdminAvailability;
  savedLocations: AdminPickupLocation[];
}) {
  const slots = Array.from({ length: 4 }, (_, index) => availability?.slots[index]);
  return (
    <form action={saveCakeAvailability} className="mt-7 space-y-6">
      <input type="hidden" name="id" value={availability?.id ?? ""} />
      <section className="grid gap-5 rounded-2xl border border-black/8 bg-white p-6 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold">Service date<input required type="date" name="serviceDate" defaultValue={availability?.serviceDate} className="min-h-11 rounded-lg border border-black/15 px-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-semibold">Status<select name="status" defaultValue={availability?.status ?? "draft"} className="min-h-11 rounded-lg border border-black/15 px-3 font-normal"><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option><option value="cancelled">Cancelled</option></select></label>
        <label className="grid gap-2 text-sm font-semibold">Total cake capacity<input required type="number" min="0" name="capacityUnits" defaultValue={availability?.capacityUnits ?? 20} className="min-h-11 rounded-lg border border-black/15 px-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-semibold">Ordering cutoff<input required type="datetime-local" name="orderingCutoffAt" defaultValue={localDateTime(availability?.orderingCutoffAt)} className="min-h-11 rounded-lg border border-black/15 px-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-semibold">Customer note (English)<input name="customerNoteEn" defaultValue={availability?.customerNoteEn ?? ""} className="min-h-11 rounded-lg border border-black/15 px-3 font-normal" /></label>
        <label className="grid gap-2 text-sm font-semibold">Customer note (Chinese)<input name="customerNoteZh" defaultValue={availability?.customerNoteZh ?? ""} className="min-h-11 rounded-lg border border-black/15 px-3 font-normal" /></label>
      </section>

      <section className="rounded-2xl border border-black/8 bg-white p-6">
        <div><h2 className="text-lg font-semibold">Pickup slots</h2><p className="mt-1 text-sm text-black/50">Choose a previously used location to fill its details, or add a new one. The first slot is required.</p></div>
        <div className="mt-5 space-y-5">
          {slots.map((slot, index) => (
            <PickupSlotFields key={slot?.id ?? index} index={index} slot={slot} savedLocations={savedLocations} />
          ))}
        </div>
      </section>
      <button className="min-h-12 rounded-full bg-forest px-7 font-semibold text-white">Save availability</button>
    </form>
  );
}
