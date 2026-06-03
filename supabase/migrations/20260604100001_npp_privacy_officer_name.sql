-- Name the Privacy Officer on the active NPP v1 row (required for truthful HIPAA notice).

UPDATE public.consent_versions
SET
  body_markdown = REPLACE(
    REPLACE(
      body_markdown,
      E'Privacy Officer\nElevated Health Augusta',
      E'Privacy Officer: Troy Akers, DO\nElevated Health Augusta'
    ),
    E'**Privacy Officer**\nElevated Health Augusta',
    E'**Privacy Officer:** Troy Akers, DO\nElevated Health Augusta'
  ),
  updated_at = now()
WHERE consent_type = 'notice_of_privacy_practices'
  AND version_label = '2026-05-15-v1'
  AND is_active = true;

UPDATE public.consent_versions
SET body_hash = encode(extensions.digest(body_markdown, 'sha256'), 'hex')
WHERE consent_type = 'notice_of_privacy_practices'
  AND version_label = '2026-05-15-v1';
