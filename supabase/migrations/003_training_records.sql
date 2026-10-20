-- Observed exercise entries only; ranges are storage limits, not safe-load guidance.
create table if not exists training_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  recorded_at date not null,
  exercise_id text not null check (length(exercise_id) between 1 and 128),
  sets integer not null check (sets between 1 and 100),
  reps integer not null check (reps between 1 and 1000),
  load_unit text not null check (load_unit in ('kg', 'bodyweight', 'assisted')),
  load double precision,
  rpe double precision check (rpe is null or (rpe >= 0 and rpe <= 10)),
  feedback text not null default '' check (length(feedback) <= 2000),
  created_at timestamptz not null default now(),
  constraint training_records_load_check check (
    (load_unit = 'bodyweight' and load is null)
    or (load_unit in ('kg', 'assisted') and load is not null and load >= 0 and load <= 2000)
  )
);

create index if not exists training_records_client_date_idx
  on training_records (client_id, recorded_at desc, created_at desc);

-- Existing API uses a server-only service-role key; no public write policies.
alter table training_records enable row level security;
