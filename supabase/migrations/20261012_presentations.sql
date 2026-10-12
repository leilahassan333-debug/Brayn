-- Run once in your Supabase project's SQL Editor. No service-role key is needed.
create table if not exists public.presentations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 150),
  template text not null default 'Editorial' check (template in ('Editorial','Minimal','Expressive')),
  notes text not null default '' check (char_length(notes) <= 20000),
  assets jsonb not null default '[]' check (jsonb_typeof(assets) = 'array' and jsonb_array_length(assets) <= 12),
  slides jsonb not null default '[]' check (jsonb_typeof(slides) = 'array' and jsonb_array_length(slides) <= 12),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists presentations_owner_updated_idx on public.presentations(owner_id, updated_at desc);
alter table public.presentations enable row level security;
create policy "Owners manage presentations" on public.presentations for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
grant select, insert, update, delete on public.presentations to authenticated;
revoke all on public.presentations from anon;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('presentation-assets','presentation-assets',false,10485760,array['image/png','image/jpeg','image/webp','text/plain','application/pdf']) on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
create policy "Presentation owners access their uploads" on storage.objects for all to authenticated using (
  bucket_id = 'presentation-assets' and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.presentations p where p.id::text = (storage.foldername(name))[2] and p.owner_id = (select auth.uid()))
) with check (
  bucket_id = 'presentation-assets' and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.presentations p where p.id::text = (storage.foldername(name))[2] and p.owner_id = (select auth.uid()))
);
create table public.presentation_generation_requests (owner_id uuid not null references auth.users(id) on delete cascade, requested_at timestamptz not null default now());
alter table public.presentation_generation_requests enable row level security;
revoke all on public.presentation_generation_requests from anon, authenticated;
create or replace function public.claim_presentation_generation() returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  if exists (select 1 from public.presentation_generation_requests where owner_id = auth.uid() and requested_at > now() - interval '30 seconds') then raise exception 'Wait 30 seconds before generating again.'; end if;
  if (select count(*) from public.presentation_generation_requests where owner_id = auth.uid() and requested_at > now() - interval '1 day') >= 20 then raise exception 'Daily generation limit reached.'; end if;
  insert into public.presentation_generation_requests(owner_id) values (auth.uid());
end; $$;
revoke all on function public.claim_presentation_generation() from public, anon;
grant execute on function public.claim_presentation_generation() to authenticated;
