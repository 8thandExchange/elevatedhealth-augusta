-- Pharmacies table
CREATE TABLE public.pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  display_name text NOT NULL,
  fulfillment_method text NOT NULL CHECK (fulfillment_method IN ('online_portal', 'fax')),
  fax_number text,
  phone_number text,
  portal_url text,
  address text,
  city text,
  state text,
  zip text,
  contact_email text,
  contact_name text,
  default_for_categories text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fax_required_for_fax_method CHECK (
    fulfillment_method != 'fax' OR fax_number IS NOT NULL
  ),
  CONSTRAINT portal_required_for_online CHECK (
    fulfillment_method != 'online_portal' OR portal_url IS NOT NULL
  )
);

-- Add pharmacy_id and portal submission tracking to orders
ALTER TABLE public.orders ADD COLUMN pharmacy_id uuid REFERENCES public.pharmacies(id);
CREATE INDEX idx_orders_pharmacy_id ON public.orders(pharmacy_id);

ALTER TABLE public.orders ADD COLUMN portal_opened_at timestamptz;
ALTER TABLE public.orders ADD COLUMN portal_submitted_at timestamptz;
ALTER TABLE public.orders ADD COLUMN submission_method text
  CHECK (submission_method IN ('fax', 'portal'));

-- RLS
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;

CREATE POLICY pharmacies_read_active ON public.pharmacies
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY pharmacies_admin_write ON public.pharmacies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Updated-at trigger
CREATE TRIGGER set_pharmacies_updated_at
  BEFORE UPDATE ON public.pharmacies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed: FCC (online portal)
INSERT INTO public.pharmacies (
  slug, name, display_name, fulfillment_method,
  portal_url, phone_number, contact_email,
  address, city, state, zip,
  default_for_categories, sort_order, notes
) VALUES (
  'fcc',
  'Formulation Compounding Center',
  'FCC',
  'online_portal',
  'https://portal.formuconnect.com/login',
  '844-946-6690',
  'info@formulationrx.com',
  '1511 Justin Rd #106A',
  'Lewisville',
  'TX',
  '75077',
  ARRAY['peptide', 'weight_loss', 'sleep_support', 'sexual_wellness', 'hair_restoration', 'anti_aging', 'dermatology', 'lipotropic_vitamin', 'wellness'],
  10,
  '503A compounding pharmacy. Orders placed through FormuConnect portal.'
);

-- Seed: Custom Pharmacy of Evans (fax)
INSERT INTO public.pharmacies (
  slug, name, display_name, fulfillment_method,
  fax_number, phone_number, contact_name,
  address, city, state, zip,
  default_for_categories, sort_order, notes
) VALUES (
  'custom-pharmacy-evans',
  'Custom Pharmacy of Evans',
  'Custom Pharmacy',
  'fax',
  '+17069933772',
  '(706) 760-7956',
  'Eric Holgate, RPh',
  '1202 Town Park Lane, Suite 200',
  'Evans',
  'GA',
  '30809',
  ARRAY['male_hormone', 'female_hormone'],
  20,
  'Local 503A compounding pharmacy. Owner: Eric Holgate, RPh. BHRT specialty. Backup for FCC.'
);