/*
# Create reservations table

1. New Tables
- `reservations`
  - `id` (uuid, primary key)
  - `name` (text, not null) — guest's full name
  - `phone` (text, not null) — guest's contact phone number
  - `party_size` (integer, not null) — number of people in the party
  - `reservation_date` (date, not null) — date of the reservation
  - `reservation_time` (time, not null) — time of the reservation
  - `notes` (text, nullable) — optional special requests from the guest
  - `status` (text, not null default 'pending') — pending / confirmed / cancelled / completed
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `reservations`.
- Allow anon + authenticated to SELECT and INSERT (public booking form).
- Allow anon + authenticated to UPDATE and DELETE (admin dashboard manages status).
  The data is intentionally shared/public for this single-tenant reservation app.
3. Indexes
- Index on `reservation_date` for date-based filtering in the admin dashboard.
- Index on `status` for filtering by status.
- Index on `created_at` for newest-first ordering.
*/

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  party_size integer NOT NULL CHECK (party_size > 0 AND party_size <= 50),
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reservations" ON reservations;
CREATE POLICY "anon_select_reservations" ON reservations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reservations" ON reservations;
CREATE POLICY "anon_insert_reservations" ON reservations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reservations" ON reservations;
CREATE POLICY "anon_update_reservations" ON reservations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reservations" ON reservations;
CREATE POLICY "anon_delete_reservations" ON reservations FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations (reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations (created_at DESC);
