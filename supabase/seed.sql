insert into public.products (slug, name_en, name_zh, description_en, description_zh, ingredients_en, ingredients_zh, allergens_en, allergens_zh, image_path)
values
('original', 'Original', '經典原味', 'Silky classic Basque cheesecake.', '濃郁乳酪香氣，口感綿密細緻。', 'Cream cheese, cream, eggs, sugar', '乳酪、鮮奶油、雞蛋、糖', 'Contains milk and egg', '含奶類及蛋', '/assets/original-card-crop.png'),
('chocolate', 'Chocolate', '法芙娜可可', 'Rich cocoa with a bittersweet finish.', '可可香醇濃郁，微苦不甜膩。', 'Cream cheese, cocoa, cream, eggs, sugar', '乳酪、可可、鮮奶油、雞蛋、糖', 'Contains milk and egg', '含奶類及蛋', '/assets/chocolate-card-crop.png'),
('taro', 'Taro', '厚芋泥', 'Real taro layered beneath cheesecake.', '綿密芋泥搭配乳酪蛋糕。', 'Taro, cream cheese, cream, eggs, sugar', '芋頭、乳酪、鮮奶油、雞蛋、糖', 'Contains milk and egg', '含奶類及蛋', '/assets/taro-card-crop.png')
on conflict (slug) do update set
  name_en = excluded.name_en,
  name_zh = excluded.name_zh,
  description_en = excluded.description_en,
  description_zh = excluded.description_zh,
  ingredients_en = excluded.ingredients_en,
  ingredients_zh = excluded.ingredients_zh,
  allergens_en = excluded.allergens_en,
  allergens_zh = excluded.allergens_zh,
  image_path = excluded.image_path;

insert into public.product_variants (product_id, label_en, label_zh, price_cents)
select id, '6 inch', '六吋', case slug when 'original' then 3200 when 'chocolate' then 3700 else 4000 end
from public.products
where slug in ('original', 'chocolate', 'taro')
on conflict (product_id, label_en) do update set
  label_zh = excluded.label_zh,
  price_cents = excluded.price_cents;

insert into public.cake_availability_dates(service_date, status, capacity_units, ordering_cutoff_at)
values
('2026-06-20', 'published', 20, '2026-06-18 18:00:00+10'),
('2026-06-27', 'published', 20, '2026-06-25 18:00:00+10')
on conflict (service_date) do update set
  status = excluded.status,
  capacity_units = excluded.capacity_units,
  ordering_cutoff_at = excluded.ordering_cutoff_at;

insert into public.pickup_slots(availability_date_id, location_name, address, starts_at, ends_at)
select id, 'Park Ridge', 'Address supplied with confirmation', service_date + time '10:00', service_date + time '11:00'
from public.cake_availability_dates d
where d.service_date in ('2026-06-20', '2026-06-27')
  and not exists (
    select 1 from public.pickup_slots ps
    where ps.availability_date_id = d.id and ps.location_name = 'Park Ridge'
  )
union all
select id, 'Sunnybank', 'Address supplied with confirmation', service_date + time '14:00', service_date + time '15:00'
from public.cake_availability_dates d
where d.service_date in ('2026-06-20', '2026-06-27')
  and not exists (
    select 1 from public.pickup_slots ps
    where ps.availability_date_id = d.id and ps.location_name = 'Sunnybank'
  );

insert into public.class_types(slug, name_en, name_zh, description_en, description_zh, duration_minutes)
values ('mandala-dot-painting', 'Mandala dot painting', '曼陀羅點繪', 'A guided mindful art class.', '引導式靜心藝術課程。', 150)
on conflict (slug) do update set
  name_en = excluded.name_en,
  name_zh = excluded.name_zh,
  description_en = excluded.description_en,
  description_zh = excluded.description_zh,
  duration_minutes = excluded.duration_minutes;

insert into public.class_sessions(class_type_id, status, starts_at, ends_at, venue_name, venue_address, capacity_seats, price_cents, booking_cutoff_at)
select id, 'published', '2026-06-21 13:30:00+10', '2026-06-21 16:00:00+10', 'Sunnybank Community Studio', 'Address supplied with confirmation', 8, 5500, '2026-06-20 18:00:00+10'
from public.class_types ct
where ct.slug = 'mandala-dot-painting'
  and not exists (
    select 1 from public.class_sessions cs
    where cs.class_type_id = ct.id
      and cs.starts_at = '2026-06-21 13:30:00+10'
  );
