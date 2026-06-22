-- meson_ai.ai_agents: per-client AI agent registry (persona, prompt, KB, voice).
-- Channel-agnostic: voice fields nullable. Knowledge base is free-form text for now.
-- RLS scoped to the calling user's client_id via public.users.

create schema if not exists meson_ai;

create table meson_ai.ai_agents (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  client_id               uuid not null,
  created_by              uuid,

  name                    text not null,
  description             text,
  status                  text not null default 'draft',
  role                    text,
  avatar_color            text,

  company_context         text,
  objective               text,
  persona                 text,
  greeting                text,
  system_prompt           text,
  knowledge_base          text,
  guardrails              text,
  escalation_instructions text,

  voice_provider          text,
  voice_id                text,
  language                text default 'en-US',
  voicemail_message       text,
  transfer_phone          text,
  max_call_seconds        integer,

  model                   text default 'gpt-4o',
  temperature             numeric(3,2) default 0.50,

  metadata                jsonb not null default '{}'::jsonb
);

create index ai_agents_client_id_idx     on meson_ai.ai_agents (client_id);
create index ai_agents_status_idx        on meson_ai.ai_agents (client_id, status);
create index ai_agents_created_at_idx    on meson_ai.ai_agents (client_id, created_at desc);

create or replace function meson_ai.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger ai_agents_set_updated_at
before update on meson_ai.ai_agents
for each row execute function meson_ai.set_updated_at();

alter table meson_ai.ai_agents enable row level security;
alter table meson_ai.ai_agents force  row level security;

create policy ai_agents_select on meson_ai.ai_agents
  for select using (
    client_id = (
      select u.client_id from public.users u
      where u.supabase_uid = auth.uid()
    )
  );

create policy ai_agents_insert on meson_ai.ai_agents
  for insert with check (
    client_id = (
      select u.client_id from public.users u
      where u.supabase_uid = auth.uid()
    )
  );

create policy ai_agents_update on meson_ai.ai_agents
  for update using (
    client_id = (
      select u.client_id from public.users u
      where u.supabase_uid = auth.uid()
    )
  );

create policy ai_agents_delete on meson_ai.ai_agents
  for delete using (
    client_id = (
      select u.client_id from public.users u
      where u.supabase_uid = auth.uid()
    )
  );

grant usage on schema meson_ai to authenticated;
grant select, insert, update, delete on meson_ai.ai_agents to authenticated;
