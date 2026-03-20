create extension if not exists pgcrypto;

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  follower_count integer not null default 0,
  item_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  entity_type text not null check (entity_type in ('plugin', 'mcp_server', 'rule', 'skill')),
  entity_id uuid not null,
  plugin_id uuid not null references public.plugins(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  plugin_name text not null,
  plugin_slug text not null,
  plugin_logo text,
  position integer not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, entity_type, entity_id)
);

create table if not exists public.collection_follows (
  collection_id uuid not null references public.collections(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, user_id)
);

create index if not exists collections_owner_idx on public.collections(owner_id);
create index if not exists collections_updated_idx on public.collections(updated_at desc);
create index if not exists collection_items_collection_idx on public.collection_items(collection_id, position);
create index if not exists collection_follows_user_idx on public.collection_follows(user_id);

create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.refresh_collection_item_count()
returns trigger
language plpgsql
as $$
declare
  target_collection_id uuid;
begin
  target_collection_id = coalesce(new.collection_id, old.collection_id);

  update public.collections
  set item_count = (
    select count(*)
    from public.collection_items
    where collection_id = target_collection_id
  ),
  updated_at = now()
  where id = target_collection_id;

  return null;
end;
$$;

create or replace function public.refresh_collection_follower_count()
returns trigger
language plpgsql
as $$
declare
  target_collection_id uuid;
begin
  target_collection_id = coalesce(new.collection_id, old.collection_id);

  update public.collections
  set follower_count = (
    select count(*)
    from public.collection_follows
    where collection_id = target_collection_id
  ),
  updated_at = now()
  where id = target_collection_id;

  return null;
end;
$$;

drop trigger if exists collections_set_timestamp on public.collections;
create trigger collections_set_timestamp
before update on public.collections
for each row execute function public.set_timestamp();

drop trigger if exists collection_items_set_timestamp on public.collection_items;
create trigger collection_items_set_timestamp
before update on public.collection_items
for each row execute function public.set_timestamp();

drop trigger if exists collection_items_refresh_count on public.collection_items;
create trigger collection_items_refresh_count
after insert or update or delete on public.collection_items
for each row execute function public.refresh_collection_item_count();

drop trigger if exists collection_follows_refresh_count on public.collection_follows;
create trigger collection_follows_refresh_count
after insert or delete on public.collection_follows
for each row execute function public.refresh_collection_follower_count();

alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.collection_follows enable row level security;

create policy "public collections are viewable"
on public.collections
for select
using (visibility = 'public' or owner_id = auth.uid());

create policy "owners can create collections"
on public.collections
for insert
with check (owner_id = auth.uid());

create policy "owners can update collections"
on public.collections
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "owners can delete collections"
on public.collections
for delete
using (owner_id = auth.uid());

create policy "collection items are viewable with collection"
on public.collection_items
for select
using (
  exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and (c.visibility = 'public' or c.owner_id = auth.uid())
  )
);

create policy "owners can insert collection items"
on public.collection_items
for insert
with check (
  exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.owner_id = auth.uid()
  )
);

create policy "owners can update collection items"
on public.collection_items
for update
using (
  exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.owner_id = auth.uid()
  )
);

create policy "owners can delete collection items"
on public.collection_items
for delete
using (
  exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.owner_id = auth.uid()
  )
);

create policy "users can read their collection follows"
on public.collection_follows
for select
using (user_id = auth.uid());

create policy "users can follow collections"
on public.collection_follows
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.visibility = 'public'
  )
);

create policy "users can unfollow collections"
on public.collection_follows
for delete
using (user_id = auth.uid());
