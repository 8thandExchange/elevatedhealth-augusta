-- Add rich content columns to iv_addons for educational pop-outs
ALTER TABLE public.iv_addons 
ADD COLUMN detailed_description TEXT,
ADD COLUMN benefits TEXT[] DEFAULT '{}',
ADD COLUMN best_for TEXT[] DEFAULT '{}',
ADD COLUMN icon_name TEXT DEFAULT 'sparkles';

-- Populate existing boosters with rich educational content
UPDATE public.iv_addons SET
  detailed_description = 'Your body''s most powerful detoxifier. Glutathione neutralizes free radicals, supports liver function, and promotes a brighter, more youthful complexion. Often depleted by stress, alcohol, and poor sleep.',
  benefits = ARRAY['Detox & liver support', 'Skin brightening', 'Immune system boost'],
  best_for = ARRAY['Glow Seekers', 'Detox Days', 'Anti-Aging'],
  icon_name = 'sparkles'
WHERE LOWER(name) LIKE '%glutathione%';

UPDATE public.iv_addons SET
  detailed_description = 'Essential for red blood cell production and nerve function. B12 converts food into cellular energy, fights fatigue, and supports mental clarity. Critical if you''re plant-based or feeling run down.',
  benefits = ARRAY['Sustained energy boost', 'Mental clarity', 'Nervous system support'],
  best_for = ARRAY['Low Energy', 'Brain Fog', 'Athletes'],
  icon_name = 'zap'
WHERE LOWER(name) LIKE '%b12%';

UPDATE public.iv_addons SET
  detailed_description = '25x stronger than oral supplements. This high-dose infusion floods your cells with immune-boosting power, promotes collagen synthesis, and accelerates wound healing.',
  benefits = ARRAY['Immune system overdrive', 'Collagen production', 'Faster recovery'],
  best_for = ARRAY['Sick Days', 'Immune Boost', 'Skin Health'],
  icon_name = 'shield'
WHERE LOWER(name) LIKE '%vitamin c%';

UPDATE public.iv_addons SET
  detailed_description = 'A powerful anti-inflammatory that works fast. Toradol reduces inflammation at the source—ideal for headaches, muscle pain, or post-workout soreness without the drowsiness of narcotics.',
  benefits = ARRAY['Rapid pain relief', 'Reduces inflammation', 'Non-drowsy formula'],
  best_for = ARRAY['Hangover', 'Headache', 'Muscle Pain'],
  icon_name = 'heart-pulse'
WHERE LOWER(name) LIKE '%toradol%';

UPDATE public.iv_addons SET
  detailed_description = 'Fast-acting anti-nausea medication that calms your stomach within minutes. Perfect when you can''t keep anything down or need immediate relief from motion sickness or stomach upset.',
  benefits = ARRAY['Stops nausea fast', 'Settles stomach', 'Quick absorption'],
  best_for = ARRAY['Hangover', 'Motion Sickness', 'Stomach Bug'],
  icon_name = 'pill'
WHERE LOWER(name) LIKE '%zofran%';