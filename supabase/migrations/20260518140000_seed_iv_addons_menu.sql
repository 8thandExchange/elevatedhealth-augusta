-- Seed IV add-ons when table is empty (walk-in $25 boosters).
INSERT INTO public.iv_addons (name, description, price, is_active)
SELECT v.name, v.description, v.price, true
FROM (
  VALUES
    ('Glutathione Push', 'Detox, liver support, and skin brightening.', 35),
    ('B12 Shot', 'Energy, mental clarity, and metabolism.', 25),
    ('Vitamin C Push', 'High-dose immune and collagen support.', 25),
    ('Toradol Push', 'Fast anti-inflammatory pain relief.', 25),
    ('Zofran Push', 'Anti-nausea — works within minutes.', 25),
    ('NAD+ Booster', 'Cellular energy and longevity support.', 50)
) AS v(name, description, price)
WHERE NOT EXISTS (SELECT 1 FROM public.iv_addons LIMIT 1);
