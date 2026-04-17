-- Plugin auto-review pipeline.
--
-- Adds review state to `plugins` and a scan-history table used by the cron-driven
-- Cursor agent reviewer. Safe to run once; all additions are idempotent.

-- 1. Extend plugins with review state.
alter table public.plugins
  add column if not exists review_status text not null default 'pending'
    check (review_status in (
      'pending',
      'scanning',
      'auto_approved',
      'approved',
      'flagged',
      'auto_declined',
      'declined'
    )),
  add column if not exists last_scanned_at timestamptz,
  add column if not exists security_score int check (security_score between 0 and 100),
  add column if not exists quality_score int check (quality_score between 0 and 100),
  add column if not exists review_summary text,
  add column if not exists flagged_reasons jsonb not null default '[]'::jsonb;

create index if not exists plugins_review_status_idx
  on public.plugins (review_status, last_scanned_at nulls first);

-- Backfill: anything currently active should be considered approved so it
-- doesn't suddenly go dark. Pending/inactive keep the default.
update public.plugins
  set review_status = 'approved'
  where active = true
    and review_status = 'pending';

-- 2. Scan history.
create table if not exists public.plugin_scans (
  id uuid primary key default gen_random_uuid(),
  plugin_id uuid not null references public.plugins(id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'finished', 'error', 'cancelled')),
  agent_id text,
  run_id text,
  verdict jsonb,
  security_score int check (security_score between 0 and 100),
  quality_score int check (quality_score between 0 and 100),
  recommendation text check (recommendation in ('approve', 'flag', 'decline')),
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists plugin_scans_queue_idx
  on public.plugin_scans (status, created_at);

create index if not exists plugin_scans_plugin_idx
  on public.plugin_scans (plugin_id, created_at desc);

-- RLS: scans are admin-only read, writes happen via service role from cron routes.
alter table public.plugin_scans enable row level security;

drop policy if exists "plugin_scans service role only" on public.plugin_scans;
create policy "plugin_scans service role only" on public.plugin_scans
  for all
  using (false)
  with check (false);
