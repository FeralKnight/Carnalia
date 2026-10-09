create table public.carnalia_rooms (
 code text primary key check (code ~ '^[A-F0-9]{6}$'),
 payload jsonb not null,
 version bigint not null default 1 check (version > 0),
 expires_at timestamptz not null
);
create index carnalia_rooms_expiry on public.carnalia_rooms(expires_at);
alter table public.carnalia_rooms enable row level security;
revoke all on public.carnalia_rooms from anon, authenticated;
grant select, insert, update, delete on public.carnalia_rooms to service_role;
