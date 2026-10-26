create table if not exists chat_image_jobs (
  id uuid primary key,
  owner_hash text not null,
  fingerprint text not null,
  conversation_id text not null,
  source_message_id text not null,
  state text not null check (state in ('preparing', 'generating', 'succeeded', 'failed', 'unknown')),
  brief jsonb,
  receipt jsonb,
  storage_path text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists chat_image_jobs_active_idx
  on chat_image_jobs (state)
  where state in ('preparing', 'generating');
create index if not exists chat_image_jobs_created_idx
  on chat_image_jobs (created_at);
create index if not exists chat_image_jobs_owner_created_idx
  on chat_image_jobs (owner_hash, created_at);

alter table chat_image_jobs enable row level security;
revoke all on table chat_image_jobs from public, anon, authenticated;
grant select, insert, update on table chat_image_jobs to service_role;

create or replace function claim_chat_image_job(
  p_id uuid,
  p_owner_hash text,
  p_fingerprint text,
  p_conversation_id text,
  p_source_message_id text,
  p_expires_at timestamptz
) returns jsonb
language plpgsql
as $$
declare
  job chat_image_jobs%rowtype;
  concurrent int;
  global_hour int;
  session_hour int;
begin
  perform pg_advisory_xact_lock(hashtext('chat_image_jobs'));
  select * into job from chat_image_jobs where id = p_id;
  if found then
    if job.fingerprint <> p_fingerprint then
      return jsonb_build_object('kind', 'conflict');
    end if;
    if job.owner_hash <> p_owner_hash then
      return jsonb_build_object('kind', 'forbidden');
    end if;
    return jsonb_build_object('kind', 'existing', 'job', to_jsonb(job));
  end if;
  select count(*) into concurrent from chat_image_jobs
    where state in ('preparing', 'generating');
  if concurrent >= 2 then
    return jsonb_build_object('kind', 'busy');
  end if;
  select count(*) into global_hour from chat_image_jobs
    where created_at > now() - interval '1 hour';
  if global_hour >= 30 then
    return jsonb_build_object('kind', 'rate-limited', 'scope', 'global');
  end if;
  select count(*) into session_hour from chat_image_jobs
    where owner_hash = p_owner_hash and created_at > now() - interval '1 hour';
  if session_hour >= 5 then
    return jsonb_build_object('kind', 'rate-limited', 'scope', 'session');
  end if;
  insert into chat_image_jobs (
    id, owner_hash, fingerprint, conversation_id, source_message_id, state, expires_at
  ) values (
    p_id, p_owner_hash, p_fingerprint, p_conversation_id, p_source_message_id, 'preparing', p_expires_at
  ) returning * into job;
  return jsonb_build_object('kind', 'claimed', 'job', to_jsonb(job));
end;
$$;

revoke all on function claim_chat_image_job(uuid, text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function claim_chat_image_job(uuid, text, text, text, text, timestamptz) to service_role;

insert into storage.buckets (id, name, public)
values ('chat-illustrations', 'chat-illustrations', false)
on conflict (id) do nothing;
