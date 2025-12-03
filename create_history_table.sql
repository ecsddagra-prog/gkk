
create table if not exists booking_status_history (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) on delete cascade not null,
  status text not null,
  changed_by uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for faster lookups
create index if not exists idx_booking_status_history_booking_id on booking_status_history(booking_id);

-- Enable RLS
alter table booking_status_history enable row level security;

-- Policies
create policy "Users can view history of their bookings"
  on booking_status_history for select
  using (
    exists (
      select 1 from bookings
      where bookings.id = booking_status_history.booking_id
      and bookings.user_id = auth.uid()
    )
  );

create policy "Providers can view history of their assigned bookings"
  on booking_status_history for select
  using (
    exists (
      select 1 from bookings
      where bookings.id = booking_status_history.booking_id
      and bookings.provider_id in (
        select id from providers where user_id = auth.uid()
      )
    )
  );

create policy "Admins can view all history"
  on booking_status_history for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Allow system/functions to insert (usually handled by service role, but good to have policy if needed for specific flows)
create policy "Service role can insert history"
  on booking_status_history for insert
  with check (true);
