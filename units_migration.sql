-- Create service_units table
create table if not exists service_units (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table service_units enable row level security;

-- Create policies (modify as needed for your auth setup)
-- Allow read access to everyone (publicly visible units)
create policy "Units are viewable by everyone" 
  on service_units for select 
  using (true);

-- Allow insert/update only by admins (using service role or relying on app logic if RLS is bypassed by service role)
-- Note: Service Role bypasses RLS automatically, so we just need to ensure public cannot write.
-- We can add a policy for authenticated users if needed, but usually strictly admin is better.
-- For now, we'll rely on the API to check admin status, and RLS will prevent direct public writes.

-- Seed initial data
insert into service_units (name) values 
  ('Per Job'),
  ('Per Hour'),
  ('Per Day'),
  ('Per Week'),
  ('Per Month'),
  ('Per Km'),
  ('Per Visit'),
  ('Per Sq.Ft'),
  ('Per Ltr')
on conflict (name) do nothing;
