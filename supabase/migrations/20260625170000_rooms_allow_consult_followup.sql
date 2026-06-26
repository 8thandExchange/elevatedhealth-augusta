-- Consult and follow-up visits need a bookable room. Treatment rooms 1-3 only
-- accepted iv/hormone/injection/weight_loss/peptide, so:
--   * get-available-slots room check for the "consult" lane matched only Room 4
--     + Lobby (often producing "no availability" for the entire $79 consult lane), and
--   * "follow_up" appointments matched NO room at all -> find_available_room
--     returned NULL and the insert was rejected.
--
-- Add 'consult' and 'follow_up' to every clinical treatment room and 'follow_up'
-- to the Lobby flex space so slot generation and the find_available_room trigger
-- agree. Idempotent: only touches rows missing the lines.

UPDATE public.rooms
SET allowed_service_lines = ARRAY(
  SELECT DISTINCT unnest(allowed_service_lines || ARRAY['consult', 'follow_up']::text[])
)
WHERE type = 'treatment_room'
  AND NOT (allowed_service_lines @> ARRAY['consult', 'follow_up']::text[]);

UPDATE public.rooms
SET allowed_service_lines = ARRAY(
  SELECT DISTINCT unnest(allowed_service_lines || ARRAY['follow_up']::text[])
)
WHERE type = 'lobby'
  AND NOT (allowed_service_lines @> ARRAY['follow_up']::text[]);
