create table if not exists public.site_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 10 and 20),
  source text not null default 'site-chat',
  status text not null default 'new' check (status in ('new','contacted','converted','discarded'))
);

alter table public.site_leads enable row level security;
create policy "allow anonymous lead creation" on public.site_leads for insert to anon
with check (char_length(name) between 2 and 120 and char_length(phone) between 10 and 20 and source='site-chat' and status='new');
create index if not exists site_leads_created_at_idx on public.site_leads(created_at desc);
