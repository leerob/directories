-- Normalize existing names so surrounding whitespace can't create near-duplicates
UPDATE public.companies SET name = btrim(name) WHERE name <> btrim(name);

-- Normalized key used to enforce case-insensitive uniqueness of company names
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS name_key text
  GENERATED ALWAYS AS (lower(btrim(name))) STORED;

-- One company per normalized name (prevents the duplicate explosion at the DB level)
CREATE UNIQUE INDEX IF NOT EXISTS companies_name_key_unique
  ON public.companies (name_key);
