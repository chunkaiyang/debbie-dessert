insert into public.products (slug, name_en, name_zh, description_en, description_zh, ingredients_en, ingredients_zh, allergens_en, allergens_zh, image_path)
values
('original', 'Original', '經典原味', 'Silky classic Basque cheesecake.', '濃郁乳酪香氣，口感綿密細緻。', 'Cream cheese, cream, eggs, sugar', '乳酪、鮮奶油、雞蛋、糖', 'Contains milk and egg', '含奶類及蛋'),
('chocolate', 'Chocolate', '法芙娜可可', 'Rich cocoa with a bittersweet finish.', '可可香醇濃郁，微苦不甜膩。', 'Cream cheese, cocoa, cream, eggs, sugar', '乳酪、可可、鮮奶油、雞蛋、糖', 'Contains milk and egg', '含奶類及蛋'),
('taro', 'Taro', '厚芋泥', 'Real taro layered beneath cheesecake.', '綿密芋泥搭配乳酪蛋糕。', 'Taro, cream cheese, cream, eggs, sugar', '芋頭、乳酪、鮮奶油、雞蛋、糖', 'Contains milk and egg', '含奶類及蛋');

insert into public.product_variants (product_id, label_en, label_zh, price_cents)
select id, '6 inch', '六吋', case slug when 'original' then 3200 when 'chocolate' then 3700 else 4000 end
from public.products;

insert into public.cake_availability_dates(service_date, status, capacity_units, ordering_cutoff_at)
values
('2026-06-20', 'published', 20, '2026-06-18 18:00:00+10'),
('2026-06-27', 'published', 20, '2026-06-25 18:00:00+10');

insert into public.pickup_slots(availability_date_id, location_name, address, starts_at, ends_at, capacity_units)
select id, 'Park Ridge', 'Address supplied with confirmation', service_date + time '10:00', service_date + time '11:00', 8 from public.cake_availability_dates
union all
select id, 'Sunnybank', 'Address supplied with confirmation', service_date + time '14:00', service_date + time '15:00', 8 from public.cake_availability_dates;

insert into public.class_types(slug, name_en, name_zh, description_en, description_zh, duration_minutes)
values ('mandala-dot-painting', 'Mandala dot painting', '曼陀羅點繪', 'A guided mindful art class.', '引導式靜心藝術課程。', 150);

insert into public.class_sessions(class_type_id, status, starts_at, ends_at, venue_name, venue_address, capacity_seats, price_cents, booking_cutoff_at)
select id, 'published', '2026-06-21 13:30:00+10', '2026-06-21 16:00:00+10', 'Sunnybank Community Studio', 'Address supplied with confirmation', 8, 5500, '2026-06-20 18:00:00+10'
from public.class_types;
