---
name: add-cursor-ambassador
description: Adds Cursor Directory ambassador badges by name or email via Supabase. Resolves the person and sets users.is_ambassador. Use when the user asks to add, grant, or promote an ambassador, ambassador badge, or Cursor Ambassador.
disable-model-invocation: true
---

# Add Cursor Ambassador

Grant the **Cursor Ambassador** badge (`users.is_ambassador`) for [cursor.directory](https://cursor.directory). The user provides a **name** or **email** (one person per invocation unless they list several).

The person must already have a cursor.directory account.

## Prerequisites

- **Supabase MCP** connected (`user-supabase` server).
- **Project ID**: `knhgkaawjfqqwmsgmxns` (Cursor Directory).

## Workflow

Copy and track progress:

```
- [ ] Step 1: Resolve identifier → user row(s)
- [ ] Step 2: Confirm if multiple matches
- [ ] Step 3: Set is_ambassador = true
- [ ] Step 4: Verify and report profile URL
```

### Step 1: Resolve identifier

**If input looks like an email** (contains `@`), normalize: `trim().toLowerCase()`.

**Lookup by email:**

```sql
SELECT id, name, slug, email, is_ambassador
FROM public.users
WHERE lower(email) = lower('<email>')
LIMIT 5;
```

**If input is a name** (or ambiguous), search:

```sql
SELECT id, name, slug, email, is_ambassador
FROM public.users
WHERE name ILIKE '%<name>%'
ORDER BY name
LIMIT 20;
```

**If input is a UUID**, treat as user id:

```sql
SELECT id, name, slug, email, is_ambassador
FROM public.users
WHERE id = '<uuid>'::uuid;
```

Use MCP `execute_sql` with `project_id: knhgkaawjfqqwmsgmxns`.

### Step 2: Disambiguate

| Matches | Action |
| ------- | ------ |
| 0 | Stop. Tell the user no matching account was found. They must sign up first; then run this skill again. |
| 1 | Use that row |
| 2+ | Show a short table (name, slug, email) and ask which person to promote. Do not guess. |

### Step 3: Promote

If `is_ambassador` is already `true`, report they are already an ambassador and link their profile.

Otherwise:

```sql
UPDATE public.users
SET is_ambassador = true
WHERE id = '<user_id>'
RETURNING id, name, slug, email, is_ambassador;
```

Report: **promoted** with profile URL `https://cursor.directory/u/<slug>`.

### Step 4: Verify

```sql
SELECT id, name, slug, email, is_ambassador
FROM public.users
WHERE id = '<user_id>'::uuid;
```

## Response template

```markdown
## Ambassador: <name or email>

**Status:** promoted | already ambassador | not found

**Profile:** https://cursor.directory/u/<slug>

**Email:** <email>
```

## Removing ambassadors

Only when the user explicitly asks to remove or revoke:

```sql
UPDATE public.users
SET is_ambassador = false
WHERE id = '<user_id>'
RETURNING id, name, slug, email;
```

## Notes

- Badge UI: `AmbassadorBadge` when `is_ambassador` is true; listed under `/members` → Ambassadors tab.
- If the legacy `/api/cron/sync-ambassadors` job is still scheduled in Vercel, disable it so it does not fight manual grants.

## Batch adds

For multiple people, run Steps 1–3 once per person. Summarize results in a table at the end.
