-- Structured prescriptions and reported workouts. Numeric bounds are storage
-- bounds, not safe-dose guidance. Apply after 001–003. Server service-role only.
begin;
create table training_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  revision integer not null check (revision > 0),
  status text not null default 'draft' check (status in ('draft','active','archived')),
  program jsonb not null check (jsonb_typeof(program) = 'object'),
  source_context jsonb check (source_context is null or (
    jsonb_typeof(source_context) = 'object'
    and source_context->>'kind' = 'curated-model-context'
    and source_context->'reviewedBy' = 'null'::jsonb
  )),
  created_at timestamptz not null default now(),
  unique (client_id, revision),
  unique (id, client_id)
);
create unique index training_plans_one_active_per_client
  on training_plans(client_id) where status = 'active';
create index training_plans_client_revision on training_plans(client_id, revision desc);

create table training_workouts (
  id uuid primary key,
  client_id uuid not null references clients(id) on delete cascade,
  plan_id uuid not null,
  session_id text not null,
  "performedAt" date not null,
  status text not null check (status in ('in_progress','completed')),
  sets jsonb not null check (jsonb_typeof(sets) = 'array' and jsonb_array_length(sets) <= 1200),
  rpe double precision check (rpe is null or rpe between 0 and 10),
  notes text not null default '' check (length(notes) <= 4000),
  prescription jsonb not null check (jsonb_typeof(prescription) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (plan_id, client_id) references training_plans(id, client_id) on delete cascade
);
create index training_workouts_client_date on training_workouts(client_id, "performedAt" desc, updated_at desc);

-- Enforce immutable saved contents even when a server accidentally issues UPDATE.
create function protect_training_plan_revision() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if (new.id,new.client_id,new.revision,new.program,new.source_context,new.created_at)
     is distinct from (old.id,old.client_id,old.revision,old.program,old.source_context,old.created_at) then
    raise exception 'Saved plan contents are immutable; save a new revision' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger training_plan_immutable before update on training_plans
  for each row execute function protect_training_plan_revision();

create function save_training_plan(p_client_id uuid, p_program jsonb,
  p_source_context jsonb default null, p_base_plan_id uuid default null)
returns jsonb language plpgsql security invoker set search_path = public, pg_temp as $$
declare result training_plans;
begin
  -- Serializes saves/status changes for this client. No lost revision numbers.
  perform id from clients where id = p_client_id for update;
  if not found then raise exception 'Client not found' using errcode = 'P0002'; end if;
  if p_base_plan_id is not null and not exists (
    select 1 from training_plans where id = p_base_plan_id and client_id = p_client_id
  ) then raise exception 'Base revision not owned by client' using errcode = 'P0002'; end if;
  insert into training_plans(client_id,revision,program,source_context)
  values (p_client_id,(select coalesce(max(revision),0)+1 from training_plans where client_id=p_client_id),p_program,p_source_context)
  returning * into result;
  return to_jsonb(result);
end;
$$;

create function set_training_plan_status(p_client_id uuid, p_plan_id uuid, p_status text)
returns jsonb language plpgsql security invoker set search_path = public, pg_temp as $$
declare result training_plans;
begin
  if p_status not in ('active','archived') then raise exception 'Invalid status' using errcode = '23514'; end if;
  perform id from clients where id = p_client_id for update;
  if not found then raise exception 'Client not found' using errcode = 'P0002'; end if;
  if not exists(select 1 from training_plans where id=p_plan_id and client_id=p_client_id)
    then raise exception 'Plan not owned by client' using errcode = 'P0002'; end if;
  if p_status='active' then
    update training_plans set status='archived' where client_id=p_client_id and status='active' and id<>p_plan_id;
  end if;
  update training_plans set status=p_status where id=p_plan_id and client_id=p_client_id returning * into result;
  return to_jsonb(result);
end;
$$;

-- All caller input is validated by the server domain before this RPC. This
-- transaction additionally verifies ownership, snapshot/reference immutability,
-- set references/duplicates and full accounting for completed sessions.
create function save_training_workout(p_workout jsonb)
returns jsonb language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  c uuid := (p_workout->>'client_id')::uuid;
  p uuid := (p_workout->>'plan_id')::uuid;
  w uuid := (p_workout->>'id')::uuid;
  sid text := p_workout->>'session_id';
  snapshot jsonb;
  existing training_workouts;
  result training_workouts;
  prescribed_sets integer;
  actual_sets jsonb := p_workout->'sets';
begin
  perform id from clients where id=c for update;
  if not found then raise exception 'Client not found' using errcode='P0002'; end if;
  select s into snapshot from training_plans t,
    lateral jsonb_array_elements(t.program->'sessions') s
    where t.id=p and t.client_id=c and s->>'id'=sid;
  if snapshot is null then raise exception 'Plan/session not owned by client' using errcode='P0002'; end if;
  select * into existing from training_workouts where id=w for update;
  if found and (existing.client_id<>c or existing.plan_id<>p or existing.session_id<>sid or existing.prescription<>snapshot)
    then raise exception 'Workout owner/reference/snapshot mismatch' using errcode='23514'; end if;
  if jsonb_typeof(actual_sets) is distinct from 'array' then raise exception 'Sets must be an array' using errcode='23514'; end if;
  if exists (
    select 1 from jsonb_array_elements(actual_sets) a
    left join jsonb_array_elements(snapshot->'exercises') e on e->>'id'=a->>'exerciseId'
    where e is null or (a->>'setNumber')::integer not between 1 and (e->>'sets')::integer
      or jsonb_typeof(a->'completed') is distinct from 'boolean'
  ) then raise exception 'Invalid set reference' using errcode='23514'; end if;
  if exists (
    select 1 from jsonb_array_elements(actual_sets) a group by a->>'exerciseId',a->>'setNumber' having count(*)>1
  ) then raise exception 'Duplicate set' using errcode='23514'; end if;
  select sum((e->>'sets')::integer) into prescribed_sets from jsonb_array_elements(snapshot->'exercises') e;
  if p_workout->>'status'='completed' and (
    jsonb_array_length(actual_sets)<>prescribed_sets or exists (
      select 1 from jsonb_array_elements(actual_sets) a where a->>'completed' is distinct from 'true'
        or jsonb_typeof(a->'reps') is distinct from 'number'
        or (a->>'loadUnit'<>'bodyweight' and jsonb_typeof(a->'load') is distinct from 'number')
    )
  ) then raise exception 'Completed workout must account for all prescribed sets' using errcode='23514'; end if;
  insert into training_workouts(id,client_id,plan_id,session_id,"performedAt",status,sets,rpe,notes,prescription)
  values(w,c,p,sid,(p_workout->>'performedAt')::date,p_workout->>'status',actual_sets,
    (p_workout->>'rpe')::double precision,p_workout->>'notes',snapshot)
  on conflict(id) do update set
    "performedAt"=excluded."performedAt",status=excluded.status,sets=excluded.sets,
    rpe=excluded.rpe,notes=excluded.notes,updated_at=now()
  where training_workouts.client_id=c and training_workouts.plan_id=p
    and training_workouts.session_id=sid and training_workouts.prescription=snapshot
  returning * into result;
  if result.id is null then raise exception 'Workout reference conflict' using errcode='23514'; end if;
  return to_jsonb(result);
end;
$$;

alter table training_plans enable row level security;
alter table training_workouts enable row level security;
-- No anonymous/authenticated access, including RPC execution. The existing app
-- has server-only service role access; these functions never elevate privileges.
revoke all on training_plans,training_workouts from public,anon,authenticated;
grant all on training_plans,training_workouts to service_role;
revoke all on function protect_training_plan_revision() from public,anon,authenticated;
revoke all on function save_training_plan(uuid,jsonb,jsonb,uuid) from public,anon,authenticated;
revoke all on function set_training_plan_status(uuid,uuid,text) from public,anon,authenticated;
revoke all on function save_training_workout(jsonb) from public,anon,authenticated;
grant execute on function save_training_plan(uuid,jsonb,jsonb,uuid) to service_role;
grant execute on function set_training_plan_status(uuid,uuid,text) to service_role;
grant execute on function save_training_workout(jsonb) to service_role;
commit;
