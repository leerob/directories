-- Seed Cursor's Founder GTM plugin into cursor.directory.
--
-- The source lives in the `cursor/plugins` monorepo under `founder-gtm/`.
-- `github_repo_id` is intentionally null because multiple directory plugins can
-- come from that same monorepo, while the repo id column is unique when present.

do $$
declare
  v_plugin_id uuid;
begin
  insert into public.plugins (
    name,
    description,
    logo,
    repository,
    homepage,
    license,
    keywords,
    author_name,
    author_url,
    owner_id,
    active,
    plan,
    scan_status,
    discovery_source,
    github_repo_id,
    verified,
    verified_at
  ) values (
    'Founder GTM',
    'Go-to-market toolkit for early-stage founders: sales pack, prospecting, outbound on X, LinkedIn, email, warm intros, and a weekly learning loop.',
    'https://raw.githubusercontent.com/cursor/plugins/HEAD/founder-gtm/assets/logo.svg',
    'https://github.com/cursor/plugins',
    'https://github.com/cursor/plugins/tree/main/founder-gtm',
    'MIT',
    array['gtm','go-to-market','outbound','sales','founders','cold-email','linkedin','x','twitter','lemlist','gmail','prospecting','warm-intros'],
    'Cursor',
    'https://cursor.com/marketplace/cursor/founder-gtm',
    null,
    true,
    'standard',
    'unscanned',
    'seed:cursor-marketplace',
    null,
    true,
    now()
  )
  on conflict (name) do update set
    description = excluded.description,
    logo = excluded.logo,
    repository = excluded.repository,
    homepage = excluded.homepage,
    license = excluded.license,
    keywords = excluded.keywords,
    author_name = excluded.author_name,
    author_url = excluded.author_url,
    active = excluded.active,
    plan = excluded.plan,
    scan_status = excluded.scan_status,
    discovery_source = excluded.discovery_source,
    verified = excluded.verified,
    verified_at = coalesce(public.plugins.verified_at, excluded.verified_at)
  returning id into v_plugin_id;

  delete from public.plugin_components
  where plugin_id = v_plugin_id;

  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$skill$q$,
    $q$gtm-cold-email$q$,
    $q$gtm-cold-email$q$,
    $q$Run personalized cold email outreach for an early-stage founder via Gmail (Google Workspace). Reads a prospects CSV from gtm-find-prospects, drafts a 3 to 4 step email sequence per prospect grounded in sales-pack.md, and either saves them as Gmail Drafts for manual review or sends them programmatically with a hard daily cap (default 25/day, configurable) and inter-send spacing. Includes domain-warming guidance, recommends Instantly/Smartlead/Mailwarm for cold domains, and never blasts an unwarmed domain. Use when the founder wants to run cold email outreach, has a list of prospect emails, runs /gtm-cold-email, or asks how to send emails at scale safely.$q$,
    $q$# Cold Email, sending without nuking your domain

You are running a cold email campaign for an early-stage founder. Cold email is the highest-leverage outbound channel when done right and the fastest way to permanently damage your sending domain when done wrong. The skill prioritizes **deliverability and quality over volume**.

## Prerequisites

```bash
test -f sales-pack.md || echo "MISSING sales-pack.md"

# Gmail API ready
gcloud auth list --filter=status:ACTIVE --format="value(account)" || echo "GCLOUD NOT AUTHED"
gcloud services list --enabled --filter="config.name:gmail.googleapis.com" --format="value(config.name)" || echo "GMAIL API NOT ENABLED"

# Founder-gtm Gmail token exists
test -f ${CURSOR_PLUGIN_ROOT}/.gtm-state/gmail-token.json || echo "MISSING gmail-token.json"
```

If any of these fail, run the [Gmail setup](#gmail-setup-one-time) section below before proceeding.

## Gmail setup (one-time)

The skill uses the official Google Workspace path: gcloud CLI + Gmail API + an OAuth client whose token is stored locally and gitignored.

### Why Google Workspace, not free gmail.com

- Workspace domains have far better deliverability for cold outbound.
- Workspace provides the admin controls needed to safely manage cold email (DKIM, SPF, DMARC).
- Cold email from a free `@gmail.com` address dies in spam folders within ~10 sends.

If the founder doesn't have Workspace yet: tell them to get one at workspace.google.com ($6-$18/user/month) on a dedicated outbound subdomain (e.g. `outreach.{{theirdomain}}.com`) so any sender-reputation damage stays off their primary domain.

### Setup steps

1. **Install gcloud CLI** (if missing):
   ```bash
   brew install --cask google-cloud-sdk
   gcloud init
   ```

2. **Auth as the Workspace user** who will send the emails:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

3. **Pick or create a GCP project** for this plugin (recommend a dedicated one to scope the OAuth credential):
   ```bash
   gcloud projects create founder-gtm-{{founder-handle}} --name="founder-gtm"
   gcloud config set project founder-gtm-{{founder-handle}}
   ```

4. **Enable the Gmail API:**
   ```bash
   gcloud services enable gmail.googleapis.com
   ```

5. **Create an OAuth client** (Desktop app type, Gmail API doesn't support service accounts for individual Gmail boxes):
   - Console: https://console.cloud.google.com/apis/credentials
   - Create Credentials → OAuth client ID → Desktop app
   - Download the client JSON to `${CURSOR_PLUGIN_ROOT}/.gtm-state/oauth-client.json`
   - Also: add the founder's email as a test user under OAuth consent screen (so they don't need verification for personal use).

6. **Grant scopes** (`gmail.send`, `gmail.compose`, `gmail.modify`):
   The skill provides a one-time helper script at `scripts/gmail-auth.py` (see [Scripts](#scripts) below). Running it opens a browser, the founder approves, and a refresh token is saved to `${CURSOR_PLUGIN_ROOT}/.gtm-state/gmail-token.json`.

7. **Verify DKIM/SPF/DMARC** on the sending domain. Workspace docs: https://support.google.com/a/answer/33786. Without these, deliverability is near zero.

8. **DNS warmup check:**
   - Domain registered <60 days ago → DO NOT cold-email yet. Warm for 4+ weeks first.
   - Domain established but never used for cold outbound → warm for 2 weeks first.
   - Domain has prior healthy sending volume → safe to start at 25/day.

## Domain warming guidance

Ask the founder:

```
Question: "Has this Workspace domain ever sent cold email before? Honest answer."
Options:
- Yes, regularly (safe to start at default cap)
- It's an established domain, but I haven't done cold outbound from it (warm 2 weeks first)
- It's a new dedicated outbound subdomain (warm 4 weeks first)
- It's the same domain as my product (think hard — sender reputation damage will affect ALL email from this domain)
```

If warming is needed:

| Tool | Cost | Notes |
|---|---|---|
| **Smartlead** | Free warmup tier | Recommended free option |
| **Instantly** | ~$37/mo | Best UX, includes warmup + inbox rotation |
| **Mailwarm** | ~$69/mo | Pure warmup focus |
| **Lemlist** | ~$59/mo | Has built-in warmup if using Lemlist for LinkedIn too |

For warming periods, cap real cold sends at 5/day max. Increase by 5/day each week until reaching the target 25/day.

## Workflow (after setup is done)

### Step 1: Load prospect list

```
Question: "Which prospect list?"
Options:
- Auto-detect (most recent prospects/*.csv)
- {{list CSVs}}
- Paste a list inline
```

Filter rows where `email` is non-empty AND (`recommended_channel` is `email` OR `multi`).

Show the founder the filtered count + breakdown by `email_confidence`:

```
Found 42 prospects with emails:
  • 18 confirmed
  • 14 pattern-guess
  • 10 unverified

Recommend: send to "confirmed" only on first run. Save "pattern-guess" as drafts you review. Skip "unverified".
```

### Step 2: Pick send mode

```
Question: "How do you want to send?"
Options:
- Drafts only — save to Gmail Drafts folder; you click send manually
- Send with my approval — show each draft; I approve, the skill sends
- Auto-send with cap — sends up to {{daily-cap}} today, spaced 2–5 minutes apart
```

Daily cap default: 25. Configurable via `${CURSOR_PLUGIN_ROOT}/.env`:
```
COLD_EMAIL_DAILY_CAP=25
COLD_EMAIL_MIN_INTERVAL_SECONDS=120
COLD_EMAIL_MAX_INTERVAL_SECONDS=300
```

Track today's sent count in `${CURSOR_PLUGIN_ROOT}/.gtm-state/send-counter-{{YYYY-MM-DD}}.json`. Refuse to exceed the cap.

### Step 3: For each prospect, draft the sequence

A campaign generates a **4-step sequence** per prospect, sent as Drafts now and scheduled (or as a single Touch 1 if the founder prefers manual cadence control).

Apply `gtm-voice-guide` + these cold-email specifics:

**Subject line rules:**
- 3 to 6 words. Mobile inbox; no room for hype.
- Specific, not aspirational.
- Include the prospect's company name or a specific signal where natural.
- Test the founder's instinct: would the founder open this email cold?

**Subject framework, what works, what fails, and why:**

| Pattern | Works because | Example |
|---|---|---|
| Pain or scaling question | Validates a struggle they're actually having; implies you've seen it before | "Scaling outbound to 100/day?" |
| "{{Company}}'s {{topic}}" | Feels 1:1; passes the "is this for me?" test in the inbox | "Acme's developer velocity" |
| Practical value, not pitch | Promises utility before claiming anything | "How we cut review time at Brex" |
| `Re:` thread on follow-ups | Familiar continuity; lower friction on touch 2+ | "Re: Acme's developer velocity" |
| Their name when you've talked before | High recognition for warm follow-ups | "Jane, quick follow-up" |

| Pattern | Fails because | Example |
|---|---|---|
| Aspirational claims | Inbox BS detectors trigger immediately | "10x your engineers", "Unlock the full power of X" |
| Product / version launches | Reads as a marketing blast, not a peer email | "Acme 2.0 is here" |
| Generic thought leadership | No "why you, why now" connection to the prospect | "Ramping on unfamiliar codebases" |
| Vague social proof | Which teams? What does "accelerating" mean? | "Top teams are accelerating with Acme" |

**Naming rule of thumb:** if the prospect already knows your product, your product name in the subject helps (recognition). If you're cold, lead with **their** company name or a specific pain, not your product name they don't know yet.

**Auto-flag in gtm-get-better:** any subject containing the words "unlock", "10x", "accelerating", or a version number ("2.0:") is high-risk regardless of N. Retire before they hit the dataset.

## Sender identity

The same email body can land 1.5 to 2x more positive replies when sent from a recognized company domain versus a personal Gmail. Internal A/B data from a more mature outbound team showed ~12% positive vs ~7% positive on the same play.

Apply this to founder-scale outbound:

- **Send from your company domain** (you@yourcompany.com), not a personal Gmail alias, once the domain is warmed.
- **For early founders without warm reputation:** use a dedicated outbound subdomain (e.g. `hello.yourcompany.com`) so any reputation damage stays off your product email.
- **Display name:** "Firstname Lastname" or "Firstname @ Company". Never "Sales Team", never "Outbound", never an alias the prospect can't connect back to you.
- **Reply-to:** always your actual email. Don't use a no-reply or a CRM-managed alias.
- **Plain text only.** No HTML. No tracking pixels. No images. These all hurt deliverability at founder volume and read as spammy.
- **No unsubscribe footer needed for low-volume B2B outreach to professional emails.** CAN-SPAM requires it for higher volume; add a one-line "no problem if not relevant, happy to drop it" if you're sending >50/day or to consumer addresses.

**Body rules:**
- 2 to 4 sentences. Hard cap 4. Long emails get archived.
- First sentence references the signal (the `hook` from gtm-find-prospects).
- One CTA, phrased as a question, on its own newline at the end.
- Plain text. No HTML, no images, no tracking pixels (kills deliverability and feels gross).
- No unsubscribe footer needed for low-volume B2B outreach to professional emails (legally, CAN-SPAM requires it only at higher volumes; check your jurisdiction). Add one if sending >100/day.

**4-step sequence template:**

**Step 1 (Day 0), The opener**
```
Subject: {{Company}}'s {{specific signal area}}

{{Hook line — references the prospect-specific signal from gtm-find-prospects}}

{{One line connecting their context to what you do, in their language.}}

{{Single CTA — a question, on its own line. CTA tier depends on signal_strength; see below.}}

{{Founder signature}}
```

**CTA tier matched to signal_strength (read this column from the prospect CSV):**

| signal_strength | Touch 1 CTA tier | Examples |
|---|---|---|
| `high` | direct ask | "Would a 15-min chat make sense?" / "Want me to set up an enterprise trial?" |
| `medium` | soft ask | "Would a quick Loom showing this be useful?" / "Open to swapping notes?" |
| `low` | content / peer ask | "Want me to send the playbook we wrote on this?" / "Happy to share what we've seen, interested?" |

Asking for a meeting on touch 1 of a low-signal play gets ignored. Asking for "the playbook" on touch 1 of a high-signal play leaves leverage on the table. Match the ask to the heat.

**Step 2 (Day 3 to 4), Value add**
```
Subject: Re: {{Step 1 subject}}

{{Different angle from Step 1 — share a relevant resource, customer outcome, or one-line insight.}}

{{Softer CTA — "happy to send the Loom" or "want me to share the playbook?"}}
```

**Step 3 (Day 8 to 10), Alternative offer**
```
Subject: Re: {{Step 1 subject}}

{{A lower-commitment alternative to the original CTA. "If a call's too much, would a 5-min Loom be useful?" or "Happy to send a one-pager you can forward to the team."}}
```

**Step 4 (Day 14 to 18), Breakup**
```
Subject: Re: {{Step 1 subject}}

{{Clean acknowledgment they're busy. One final offer or a referral ask. No guilt.}}

{{Example: "All good if not a fit right now. Anyone else at {{Company}} I should reach out to?"}}
```

### Step 4: Show drafts + approval

Display Step 1 for each prospect (Steps 2 to 4 are pre-generated but only sent if no reply).

Per prospect: name + company + signal + the 4-step preview. Founder choices: Send Step 1 now / Save all 4 as Drafts / Skip / Edit.

### Step 5: Send via Gmail API

Each send uses the Gmail API's `users.messages.send`. The skill's helper script (or inline tool calls) handles:

- Encoding the message as RFC 2822 + base64url.
- Threading: Steps 2 to 4 use the same Message-ID `In-Reply-To` so they thread under Step 1 in the recipient's inbox.
- Spacing: enforce `COLD_EMAIL_MIN_INTERVAL_SECONDS` between sends in auto-send mode.
- Cap enforcement: increment `${CURSOR_PLUGIN_ROOT}/.gtm-state/send-counter-{{date}}.json`; refuse to exceed cap.

Drafts mode: use `users.drafts.create` instead. Drafts appear in the founder's Gmail Drafts folder; threading still works on send.

### Step 6: Schedule Steps 2 to 4

For each prospect with Step 1 sent:
- Steps 2 to 4 are saved as Gmail Drafts immediately so the founder can review them anytime.
- A pending-followup log entry is created in `outreach-log/email-followups-pending.jsonl` with send-after dates.
- A reply-check needs to gate sends: before sending Step N, check via Gmail API if the thread has a reply from the recipient. If yes, abort the sequence for that prospect.

Re-run `/gtm-cold-email --followups` (or set a daily Cursor Automation) to process the pending queue.

### Step 7: Log every send

Append to `outreach-log/email.jsonl`:

```json
{
  "timestamp": "2026-05-27T17:30:00Z",
  "campaign": "{{campaign-name}}",
  "step": 1,
  "prospect": { "name": "...", "email": "...", "email_confidence": "confirmed", "company": "...", "score": 85 },
  "signal": "recent_funding",
  "hook_used": "Seed $4M led by Foo VC 2026-01-15",
  "subject": "Acme's developer velocity",
  "body": "the full message body",
  "send_mode": "auto" | "approval" | "drafts",
  "gmail_message_id": "186abc...",
  "thread_id": "186def...",
  "founder_action": "send" | "edit_send" | "draft_only"
}
```

## Reply handling, the state machine

Every cold-email sequence is a tiny state machine: the prospect either has not replied yet, has replied, or has timed out. The skill enforces this every time `/gtm-cold-email --followups` or `--check-replies` runs.

```
For each prospect with at least one touch sent:
  state = NOT_REPLIED (default)

  If any inbound message exists on the thread (from anyone other than us):
    classify the first inbound message per the rubric in /gtm-get-better
    state = REPLIED
    cancel all pending touches for this prospect
    write to outreach-log/email-replies.jsonl with the classification

  If state is NOT_REPLIED and the next scheduled touch time has passed:
    if today's send count < daily cap:
      send the next touch
      increment send count
      reschedule the touch after that

  If state is NOT_REPLIED and all 4 touches have been sent:
    state = COMPLETED_NO_REPLY
```

### `/gtm-cold-email --check-replies`

Run this at the start of every `--followups` cycle, or as its own automation:

1. Pull recent replies: `users.threads.list` with `q=in:inbox newer_than:14d`.
2. For each thread, check if it's a thread we initiated (cross-reference `thread_id` from `outreach-log/email.jsonl`).
3. For each thread with new inbound, take the **first** inbound message and classify it using the shared rubric (positive / objection / neutral / OOO / negative). See the `gtm-get-better` skill for the rubric definition.
4. Run OOO detection heuristics before LLM classification (cheap pre-filter):
   - `Auto-Submitted` header is set to anything other than `no`
   - Subject contains `out of office`, `OOO`, `auto-reply`, `[Auto Reply]`, `automatic reply`
   - Body matches `^(I'?m|I am) (out of office|on vacation|on leave|away)`
   - Body matches `I no longer work at`
5. Append one entry per thread to `outreach-log/email-replies.jsonl`:
   ```json
   {
     "timestamp": "...",
     "campaign": "...",
     "thread_id": "...",
     "prospect_email": "...",
     "classification": "positive|objection|neutral|ooo|negative",
     "is_first_reply": true,
     "reply_excerpt": "first 280 chars of the inbound message",
     "touch_at_reply": 2,
     "auto_classified": true
   }
   ```
6. For each `classification != null`, cancel any matching pending entries in `email-followups-pending.jsonl` (the state machine's "cancel all pending touches" step).
7. Surface positives to the founder in the next session summary so they can draft a personal reply.

### `/gtm-cold-email --followups`

Run this once a day (ideally via a Cursor Automation; see `automations/daily-followups.workflow.json`):

1. Run `--check-replies` first to ensure no stale pending touches.
2. Read `outreach-log/email-followups-pending.jsonl`.
3. For each entry where `send_after <= now` AND prospect state is `NOT_REPLIED`:
   - Verify daily cap hasn't been hit.
   - Send via Gmail API (the draft already exists from the initial campaign run).
   - Log the send to `outreach-log/email.jsonl`.
   - Remove the entry from pending.
4. Output a summary of what was sent + what was skipped (and why).

### Reply auto-handling, what we do NOT do

We never auto-reply to inbound. Two reasons:

1. Reputation: an autonomous bot replying as the founder is the fastest way to destroy trust if it gets something wrong.
2. Conversion: a real reply from the founder to a positive lead converts at orders of magnitude higher than a bot reply.

What we DO offer: when `--check-replies` finds a positive, surface it to the founder + offer to draft a personal reply in their voice (using `sales-pack.md` for tone). The founder reads and clicks send.

## Honest limitations

- **You're sending from your founder's primary email**. Reputation damage compounds. Use a dedicated outbound subdomain when scaling.
- **Gmail's per-day send limits**: Workspace allows 2,000 sends/day total. Cold email volume should sit far below that.
- **Sequencing requires the founder to leave Cursor open or run a Cursor Automation**. The skill doesn't have a background daemon. The simplest model: re-run `/gtm-cold-email --followups` daily.
- **Pattern-guessed emails bounce more often.** Bounces above ~5% hurt domain reputation. Always verify (NeverBounce free tier, mail-tester.com) before sending pattern-guessed addresses.

## Scripts

The skill ships with one helper script, `scripts/gmail-auth.py`, that the founder runs once during setup. It does the OAuth flow against the OAuth client they created at `console.cloud.google.com/apis/credentials` and saves a refresh token to `.gtm-state/gmail-token.json` (chmod 600). All subsequent sends use that saved token directly via `google-api-python-client`.

Run it once:

```bash
pip install google-auth-oauthlib google-api-python-client
python scripts/gmail-auth.py
```

## Output after the run

```
Cold email campaign: {{campaign-name}}
Step 1 sent: {{N}} | Step 1 saved as drafts: {{M}} | Skipped: {{X}}
Daily cap remaining today: {{remaining}} of {{cap}}
Steps 2–4 saved as drafts (will send on cadence unless reply received).

Top 3 hooks used:
1. Jane Doe — Acme's recent $4M seed round
2. ...

Run /gtm-cold-email --followups daily to advance the sequence.
Run /gtm-cold-email --check-replies to ingest responses.
Run /gtm-get-better in 7 days to learn from reply patterns.
```$q$,
    $q${}$q$::jsonb,
    0
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$skill$q$,
    $q$gtm-design-play$q$,
    $q$gtm-design-play$q$,
    $q$Codify a working outbound motion into a reusable play. Distilled from how Cursor's growth team designs automated outbound plays internally (person vs account signals, persona match, channel choice, four-touch cadence, offer ladder), generalized for early-stage founders. Use after at least one campaign has produced replies and you want to capture the pattern, when a founder asks how to scale what worked, when /gtm-get-better surfaces a winning signal/persona combo, or when the founder says they want to systematize outreach.$q$,
    $q$# Design Play, turn a working motion into a repeatable play

A "play" is the smallest unit of repeatable outbound: one signal, one persona, one channel, one cadence, one offer ladder. Naming and structuring it the same way every time is what turns ad-hoc outreach into a system.

This skill borrows the framework Cursor's internal growth team uses (`generate-outbound-play-ideas`), stripped of the proprietary signals and metrics. The framework is sound. The signals are yours to define.

## When to design a play vs run one-off outreach

Design a play when:
- A signal has produced replies twice in a row from different people.
- You can describe the signal in one sentence without using the word "interested".
- The same persona is the buyer across both replies.

Don't design a play when:
- You've sent fewer than 25 messages of any kind.
- The replies came from prospects you already knew.
- The signal is "I think they'd care".

The point is to name what's already working, not to invent it.

## The play structure

Every play has five fields. Write them in this order. Each one constrains the next.

### 1. Signal
What event in the world tells you this person might be open to a message right now? Two flavors:

**Person signals**, a specific person did a specific thing.
- Example: VP Eng posted on X about evaluating AI code review tools.
- Example: Founding engineer registered for a workshop on prompt engineering.
- Example: CTO emailed support asking about SSO at a competitor.

**Account signals**, a company-level metric or event crossed a threshold.
- Example: Company hit a Series A in the last 60 days.
- Example: Team grew by 3+ engineers in the last 90 days.
- Example: 5+ users from the same domain signed up for the product.

Person signals get messaged directly. Account signals require enriching the account to find the right buyer first.

### 2. Persona
The role at the company you actually message. Default: a director-or-above engineering leader if you sell to engineering teams. Otherwise: whatever the sales-pack `## Personas` section lists.

If the signal is a person signal, the persona is usually that person. If it's an account signal, the persona is whoever can sponsor a meeting at that company.

### 3. Channel
Pick one. Not multi-channel. Plays branch by channel for a reason: cadence, format, and acceptable length differ by an order of magnitude.

- **X DM**, when the persona is active on X and the hook is from a recent post.
- **LinkedIn**, when the persona is a leader at an established company; safest default for cold.
- **Cold email**, when you have a verified email and the message needs more than a sentence to land.

### 4. Cadence
Four touches. Day 0, 3 to 5, 7 to 10, 14 to 18. Each touch has a different angle. The cardinal rule: do not repeat Step 1's angle in Step 2.

- **Touch 1:** signal-anchored opener. One soft CTA.
- **Touch 2:** new angle. Share something useful. Different CTA.
- **Touch 3:** lower-commitment alternative. (Loom instead of call, one-pager instead of demo.)
- **Touch 4:** clean breakup. Acknowledge they're busy. Offer one final thing or a referral ask.

Do not write a fifth touch. Diminishing returns and damaged sender reputation start there.

### 5. Offer ladder
Match the ask to the signal strength.

| Signal strength | Default Touch 1 CTA |
|---|---|
| High (just funded, just complained about your problem, asked support a buying question) | Direct: "want me to set up a call?" or "want to start a trial?" |
| Medium (recent role change, recent product launch in your space, content engagement) | Soft: "happy to send a Loom" or "want our playbook on X?" |
| Low (matches persona, no specific behavior) | Content only: "thought you'd find this useful", no meeting ask |

Sending a Touch 1 demo request on a Low-signal play is the fastest way to a 0% reply rate. The internal data is consistent on this.

## The "do not re-offer" rule

If a prospect already consumed the asset you'd otherwise offer (downloaded the guide, attended the webinar, read the case study), the next touch must be what comes *after* that asset. Not the asset again.

Example: someone downloaded your "scaling X" guide on Tuesday. Wednesday's Touch 1 should reference the guide and offer the next step (a walkthrough, a templated implementation, a related deeper resource), not the guide.

This is the single most common play-design mistake.

## Segmentation: one signal, two or three plays

Same signal often warrants different copy for different segments. Examples:

- **Workshop registrant**, attended vs registered-but-no-show needs different Touch 1.
- **Recent fundraise**, Seed vs Series B founders care about different things; same play, different framing.
- **Existing customer expansion** vs **cold company** on the same product-usage signal, totally different message.

Before drafting copy, list two or three segments and write Touch 1 separately for each. If you can't think of meaningful segments, you have one play, not three.

## Workflow

### Step 1: Identify the candidate motion

Pull from one of these inputs:
- `outreach-log/*.jsonl`, find a signal+persona combo with replies.
- The founder's stated hypothesis: "I think X works because Y."
- A `/gtm-get-better` run flagging a high-positive-rate pattern.

Show the founder the candidate. Confirm it's worth codifying.

### Step 2: Draft the play

Walk through the five fields. Ask one at a time. Use the recommended answer when the founder hesitates.

For signal strength, ask explicitly: "Is this high, medium, or low?" Map to the offer ladder.

### Step 3: Write the segments

Ask: "Are there subgroups within this signal that need different framing?" If yes, list them. Write a Touch 1 opener for each segment separately. Reuse Touches 2 to 4 across segments unless the segments differ enough to need separate sequences.

### Step 4: Validate

Run this checklist before saving:

- [ ] **Detectable signal.** Could you write a script (or set up a Lemlist/Smartlead trigger) that fires when this signal occurs?
- [ ] **Reachable persona.** Can you find email or LinkedIn or X handle for the people who fit this persona?
- [ ] **Offer matches signal.** High signal gets a direct ask; low signal gets content. No mismatches.
- [ ] **Not redundant.** If you have other plays, this one targets a distinct combination.
- [ ] **Helpful to recipient.** If you got this message at the timing the play targets, would you appreciate it? If no, the play needs rework.

Any failure means revise before saving.

### Step 5: Save to `plays/`

Write to `plays/{slug}.md` using the template below. Tell the founder which prospect list this play applies to and suggest running the matching channel skill (`/gtm-x-outreach`, `/gtm-linkedin-outreach`, or `/gtm-cold-email`) against that list with the play's segment in mind.

## Template

```markdown
# Play: {{Name}}

> Designed YYYY-MM-DD via /gtm-design-play. Update by re-running.

## Signal
**Type:** person | account
**Signal:** {{one-sentence description of the event/threshold that triggers this play}}
**Strength:** high | medium | low
**Detection:** {{how you'll actually catch this — script, manual scan, tool alert}}
**Source data:** {{where the signal lives — X search, TechCrunch RSS, product analytics, etc.}}

## Persona
**Title pattern:** {{e.g. "Director+ in Engineering" or "Founding engineer at 5-25 person team"}}
**Buying power:** decision-maker | influencer
**Sharpest hook for this persona:** {{one sentence}}

## Channel
**Primary:** x | linkedin | email
**Reason:** {{why this channel, not the others}}

## Segments
Two or three. For each, write a Touch 1 opener separately.

### Segment A: {{name}}
**Touch 1 opener:** {{verbatim copy}}

### Segment B: {{name}}
**Touch 1 opener:** {{verbatim copy}}

## Cadence (shared across segments)

| Touch | Day | Angle | CTA |
|---|---|---|---|
| 1 | 0 | Signal-anchored | {{from offer ladder}} |
| 2 | 3-5 | {{different angle — proof, content, peer reference}} | {{softer CTA}} |
| 3 | 7-10 | {{alternative offer — Loom, one-pager, async}} | {{lower-commitment CTA}} |
| 4 | 14-18 | Clean breakup | {{referral ask or "no vs not now?"}} |

## Offer ladder applied
- **Touch 1 CTA:** {{specific ask matching signal strength}}
- **Asset offered:** {{if any — and confirm prospect hasn't already consumed it}}
- **Walk-away offer (Touch 4):** {{referral, trial link, or final binary question}}

## Success criteria
- **Positive reply rate target:** {{realistic — 2-5% for cold; 5-15% for warm/strong-signal}}
- **When to retire:** 0% positive at N≥15 sends → retire the *signal* before rewriting copy.
- **When to scale:** above target at N≥20 → run again with 3x volume.

## Notes
{{Anything that won't fit above — caveats, segment-specific tactics, tool-specific quirks.}}
```

## Starter plays to fork

Three fully filled-in example plays live in `plays/`. They are the fastest path from zero to a running campaign: fork one, swap in the founder's own product, customer names, and signal sources, run it.

| Play file | Signal | Persona | Channel |
|---|---|---|---|
| `plays/recent-seed-fundraisers-vp-eng.md` | Company raised seed in last 60 days, 5+ engineers on LinkedIn | VP / Head of Engineering | cold email |
| `plays/show-hn-launches-ai-infra.md` | Founder posted Show HN in last 14 days in AI infra category | The Show HN founder themselves | X DM (warmer), email fallback |
| `plays/linkedin-job-change-eng-leader.md` | Someone with VP+ Eng title started a new role in last 30 days | The new eng leader | LinkedIn connect + Touch 2 message |

When a founder is designing their first play, recommend they read these first, pick the one closest to their motion, and fork it (`cp plays/{starter}.md plays/{my-version}.md`) rather than starting from a blank template.

## What this skill explicitly does NOT do

- Does not draft individual messages. That's the channel skills' job. This codifies the pattern; channel skills execute it.
- Does not run the play. Hand off to `/gtm-x-outreach`, `/gtm-linkedin-outreach`, or `/gtm-cold-email` with a prospect list.
- Does not track results. That's `/gtm-get-better`'s job, and `gtm-get-better` reads `plays/*.md` to know which plays to evaluate.

## Hypothesis backlog

When designing plays, you'll generate ideas that don't have data yet. Write them down in `plays/_backlog.md` (one line each) so you can come back when you have enough volume to test:

```
- Product-usage signal: 5+ admin actions in a single session → owner persona, X channel
- Support-ticket signal: keywords "compliance" or "audit" → security leader persona, email channel
- Hiring signal: 3+ open eng roles posted in last 30 days → VP Eng persona, LinkedIn channel
- Consolidation signal: 10+ individual seats at one company → admin persona, email channel
```

These are seeds. The `/gtm-get-better` skill can prompt you to promote one to a real play after you've gathered evidence.$q$,
    $q${}$q$::jsonb,
    1
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$skill$q$,
    $q$gtm-find-prospects$q$,
    $q$gtm-find-prospects$q$,
    $q$Builds a ranked prospect list for an early-stage founder. Reads sales-pack.md for ICP and persona criteria, asks the founder what data sources they already pay for, then combines those with free sources (LinkedIn search, X via xmcp, GitHub orgs, Crunchbase free, TechCrunch funding RSS, Show HN, Product Hunt, public event attendee lists) to produce a ranked CSV at `prospects/{campaign}.csv`. Supports two modes: person-signal (one human did something interesting) and account-signal (a company hit a threshold; we find the right person inside). Includes a title classifier with exclusion list to filter out look-alike-but-wrong titles before any paid enrichment. Use when a founder needs a target list, says they want leads, asks who to message, runs /gtm-find-prospects, or before any outreach campaign.$q$,
    $q$# Find Prospects, scrappy targeting for founders

You are building a target list for an early-stage founder. The output is one CSV per campaign that the channel skills (`gtm-x-outreach`, `gtm-linkedin-outreach`, `gtm-cold-email`) read directly.

## Prerequisite check

```bash
test -f sales-pack.md || echo "MISSING"
```

If `sales-pack.md` is missing, refuse to proceed. Tell the founder you need their sales pack first, then invoke the `gtm-sales-pack` skill.

Parse `sales-pack.md` for the `## ICP`, `## Personas`, and `## Buying signals` sections. These become your targeting criteria.

## How this differs from Clay or Apollo

Both are great. They are also $800-$2000/mo before you have product-market fit. The framework this skill uses is the same one mature growth teams use, distilled into a free-first version:

**Signal → Persona → Source → Enrich → Rank → Hand off**

1. **Signal**: a real-world event indicating buying intent (just raised, just hired, just shipped, just complained on X).
2. **Persona**: which role at the company you would actually message, informed by `sales-pack.md`.
3. **Source**: where you find the signal-and-persona combination (free or paid).
4. **Enrich**: add contact info (LinkedIn URL, X handle, email pattern) once the prospect passes the bar.
5. **Rank**: order by signal strength, persona fit, reachability, and warm connections.
6. **Hand off**: write the CSV and tell the founder which channel skill to run next.

## Two modes

Founders almost always start in **person mode** and discover account mode later. Default to person unless the founder hands you a list of companies.

### Person mode (default)

You start from a signal that happened to a specific human. You already know who you want to message; you only need to enrich and rank.

> "Find me people who recently posted on X about AI evaluations and look like engineering leaders at small startups."

### Account mode

You start from a list of companies (funding round list, conference attendee company list, lookalike of an existing customer, hand-curated target accounts). For each, you need to **find the right human inside** before any outreach.

> "I have a list of 50 companies that raised seed rounds in the last 60 days. Find me the VP Eng or founder at each."

Account-mode rows in the CSV have `account_signal`, `suggested_personas[]`, and `find_persona_recipe` columns instead of named individuals. The skill then either suggests a follow-up "enrich these to named contacts" run, or the founder fills in names manually.

## Workflow

### Step 1: Tool inventory

Ask the founder what they have. AskQuestion, multi-select:

```
Question: "What targeting tools do you have access to? Pick everything you have. We'll prefer paid sources where you have them and fill gaps with free scraping/search."
Options:
- Apollo (paid)
- Clay (paid)
- Amplemarket (paid)
- ZoomInfo (paid)
- LinkedIn Sales Navigator (paid)
- A CSV/spreadsheet I already have
- Local xmcp MCP server (free X access with my OAuth)
- LinkedIn Premium or Recruiter
- Just whatever's free
```

Persist the answer to `${CURSOR_PLUGIN_ROOT}/.gtm-state/tools.json` so future runs don't re-ask. For paid tools, ask only for the variable name where the key lives in `.env`; never store the key yourself.

### Step 2: Define the campaign

```
Question: "What's this campaign about? Pick the signal."
Options:
- Recent funding rounds (seed / A / B in last 90 days, matching ICP)
- Recent role changes (people who just started a buyer-persona role)
- Recent shipping (Show HN, Product Hunt, company changelogs)
- Recent complaining (people on X/Reddit who recently complained about a problem you solve)
- Specific company list (account mode — I have a list)
- Conference / event attendees (I have a list)
- Lookalike of an existing customer
- Other (I'll describe)
```

Also ask:
- **Campaign name** (slug, e.g. `seed-fundraisers-2026-01`)
- **Target count** (default 50, max 200; large lists kill personalization)
- **Mode** (auto-detect from signal: `Specific company list` → account mode; everything else → person mode by default)

### Step 3: Run the source(s)

Use the matrix below. Always reach for the highest-signal source first.

| Signal | Best paid source | Free fallback | Helper script |
|---|---|---|---|
| Recent funding | Crunchbase Pro, Clay | TechCrunch venture RSS, Axios Pro Rata, Term Sheet | `scripts/techcrunch-funding-rss.py` |
| Recent role changes | Sales Navigator alerts, ZoomInfo | LinkedIn "started a new job" filter | manual LinkedIn search |
| Recent shipping |, | Show HN (Algolia API), Product Hunt | `scripts/hn-show-scraper.py` |
| Recent complaining |, | xmcp `searchPostsRecent`, Reddit search, HN search | `scripts/x-topic-search.py` |
| Specific company list | Apollo / Clay (instant enrich) | LinkedIn manual + Hunter.io + pattern guess | none, account mode handles this |
| Conference attendees |, | Conference attendee X lists, Luma event pages | bring your own CSV |
| Lookalike | Clay (similarity), Apollo | 3-attribute extraction + LinkedIn / Crunchbase / X bio cross-search; see Step 3.5 | manual + title classifier |

For the X path, the xmcp scripts let you do bio-keyword filtering and pull each candidate's best recent post as a pre-built hook for the `gtm-x-outreach` skill.

### Step 3.5: Lookalike enrichment (when the signal is "Lookalike of an existing customer")

The signal-source matrix in Step 3 lists "lookalike" as a row but the recipe is below because it spans multiple data sources. Run this step only when the founder picked "Lookalike of an existing customer" in Step 2.

**Why lookalikes work.** Your best existing customers share traits that predict fit. A 3-customer pattern is enough to start; a 5-customer pattern is reliable. The point is to mine those traits and turn them into search queries.

#### 3.5.1: Ask the founder for 3 to 5 best existing customers

```
Question: "Which existing customers should we look-alike from? Pick 3 to 5 of your best (highest contract value, fastest activation, most product engagement, or whatever 'best' means for you)."
Options:
- Read from existing-customers.txt at project root (if it exists)
- Paste a list of company names inline
- I will give them to you one at a time
```

If `existing-customers.txt` exists, prefer it. Show the founder the list and ask them to star (`*`) the 3 to 5 they would clone if they could. If they have not maintained this file, ask them to name the 3 to 5 now.

#### 3.5.2: For each customer, extract 3 attributes

For each of the 3 to 5 customers, populate these attributes. Pull from public sources only (no internal CRM, no logged-in scraping).

| Attribute | How to gather (free path) | How to gather (paid path) |
|---|---|---|
| Industry | Their LinkedIn company page "Industry" field; their About page on their site | Crunchbase free tier industry tags |
| Company size band | LinkedIn "Company size" range; About page if they publish it | Apollo, ZoomInfo size band |
| Tech stack indicators | Their public engineering blog tags, GitHub org public repos, StackShare if listed, job posts mentioning technologies | BuiltWith free tier for the marketing site |
| Recent funding round | TechCrunch search, Crunchbase free tier | Pitchbook, Crunchbase Pro |

Save the per-customer attribute set to `.gtm-state/lookalike-source-{campaign-name}.json` so re-runs do not re-fetch.

#### 3.5.3: Aggregate the dominant pattern

Across the 3 to 5 source customers, identify the dominant value for each attribute. A "dominant" value is one that shows up in at least 3 of 5 (or 2 of 3) source customers.

```json
{
  "industry_dominant": "B2B SaaS dev tools",
  "size_band_dominant": "50 to 200 employees",
  "tech_stack_dominant": ["TypeScript", "Postgres", "self-hosted observability"],
  "recency_filter": "raised Series A or B in last 18 months"
}
```

If no attribute is dominant (high spread across customers), tell the founder honestly: "Your best customers do not cluster cleanly. Lookalike mode will produce noisy results. Consider going back to a signal-based campaign instead, or add 2 to 3 more best-customer examples to find the pattern."

#### 3.5.4: Build the search queries

Translate the dominant pattern into actual queries. Three sources to run in parallel:

**LinkedIn company search filters:**
```
- Industry: {{industry_dominant}}
- Company size: {{size_band_dominant}}
- Headquarters location: {{founder ICP region, e.g. United States}}
- Optional growth signal: "follower count grew 25%+ in last 90 days" (Sales Nav only)
```

**Crunchbase tag search (free tier):**
```
- Industry group tag: {{closest Crunchbase tag to industry_dominant}}
- Operating status: Active
- Last funding round: {{recency_filter mapped to round type + date filter}}
```

**X bio keyword search via xmcp:**
For each tech_stack_dominant entry that maps to a community keyword (e.g. "Postgres", "TypeScript"), search X bios:
```python
# via xmcp's search-users-by-bio-keyword tool (or searchPostsRecent with bio filter)
queries = [
  "co-founder OR cto OR head of eng " + tech_keyword
  for tech_keyword in tech_stack_dominant
]
```

For each query, collect candidate company names + URLs.

#### 3.5.5: Dedupe and merge

- Drop any company already in `existing-customers.txt`.
- Drop any company already in `pipeline.txt`.
- Drop any company already in the source 3 to 5 (do not lookalike yourself).
- Dedupe by domain (canonicalize: strip `www.`, strip `http(s)://`, lowercase).
- Merge LinkedIn / Crunchbase / X candidates into one list. If a company appears in 2+ sources, that is a stronger signal (boost score in Step 8).

Cap the merged list at the founder's target count from Step 2.

#### 3.5.6: Output to standard prospects CSV

Write to `prospects/{campaign-name}.csv` using the schema in Step 9. Specifically for lookalike rows:

- `signal` = `lookalike`
- `signal_evidence` = `Matches {{N}} of 3 attributes from best customers {{customer_1, customer_2, ...}}: {{matched_attributes}}`
- `signal_strength` = `high` when all 3 attributes match, `medium` when 2 of 3 match, `low` when only 1 matches.
- `score boost`: add +10 to the Step 8 score for rows where all 3 attributes match (this is the "lookalike triangle hit", the strongest lookalike signal we have).

After Step 8 ranking, top of the list should be exact-attribute matches; the bottom should be partial matches the founder can review or drop.

#### 3.5.7: Persona enrichment

Lookalike mode is account-mode by default (you have companies, not people). After Step 3.5.6, the founder picks a persona from `sales-pack.md § Personas`, then either:

- Runs the persona enrichment subflow against the company list (LinkedIn search for `{{persona title pattern}} at {{company}}`), or
- Marks the list as "company-level only" and hands off to a follow-up enrichment pass.

The output CSV for lookalike mode should have both `company` and the `find_persona_recipe` filled in even if `full_name` is empty for some rows.

### Step 4: Enrich (multi-anchor cascade)

For each candidate row, attempt to populate these in order. Stop as soon as you have what you need for the chosen channel.

```
Identity anchors (from most reliable to least):
  1. LinkedIn URL
  2. Company domain
  3. Work email (verified)
  4. Personal email (gmail, etc. — see data/personal-email-domains.txt)
  5. X handle
  6. GitHub handle
```

**Personal-email bridge.** If the only contact you have is a personal email (gmail, icloud, etc.) and you don't know the company, search LinkedIn for that name and find their current employer separately. This is how you catch a founder who signed up to your product with their personal Gmail; their company is on LinkedIn, not in the email.

**Email finding cascade (when you need email and don't have it):**

1. Founder's paid tool (Apollo, Clay, Amplemarket) → enriched email.
2. Hunter.io free tier (25 lookups/mo) at `hunter.io/email-finder`.
3. Pattern guessing using a known email at the domain (`firstname.lastname@`, `flast@`, etc.). Verify with NeverBounce free tier before sending.
4. Skip the row if you can't find an email and email is the only channel.

**LinkedIn URL** is almost always findable via Google: `"FirstName LastName" "Company" site:linkedin.com/in`.

Mark contact-info confidence per row: `confirmed`, `pattern-guess`, `unverified`. The channel skills use this to decide whether to send or save as a draft for the founder to review.

### Step 5: Apply the title classifier

Once you have a `role` column populated, run the title classifier:

```bash
python ${CURSOR_PLUGIN_ROOT}/skills/gtm-find-prospects/scripts/title-classifier.py \
  --input prospects/raw.csv \
  --out prospects/classified.csv
```

This adds four columns based on keyword lists in `data/title-keywords.txt` and `data/title-exclusions.txt`:

- `persona_bucket`, the first matching persona bucket from `data/title-keywords.txt` (e.g. `cto`, `vp_engineering`, `staff_principal_engineer`)
- `persona_confidence`, `high` when 2+ keywords matched, `medium` when 1 keyword matched, blank when no persona matched
- `matched_keywords`, the pipe-separated keywords that matched
- `exclusion_reason`, populated when an exclusion matched (e.g. `sales engineer`, `chief of staff`)

Edit the data files to fit your ICP. The defaults are tuned for "VP+ engineering at startups" and exclude common look-alikes like Director of Sales Engineering, Chief of Staff, Customer Success leaders, and hardware engineers.

### Step 6: Apply account-fit filters

Before ranking, drop rows that fail any of these:

- [ ] **Not already a customer** (founder maintains an `existing-customers.txt` file in the project root; skill checks each domain against it)
- [ ] **Not already in active pipeline** (similar `pipeline.txt` if the founder tracks one)
- [ ] **Geography matches ICP** (default: don't drop, but flag)
- [ ] **Company size matches ICP** (founder sets `min_employees` and `max_employees` in `sales-pack.md`; skill parses them)
- [ ] **Not a child account** of an existing customer
- [ ] **Domain isn't a personal-email domain treated as a company** (gmail.com is not a company; check against `data/personal-email-domains.txt`)
- [ ] **Industry / segment matches ICP** when known

This is the cheap filter that prevents you from spending personalization effort on prospects who would be a hard "no" before you said hello.

### Step 7: Run domain histogram (when you have an email list)

If the source was an attendee list or anything with raw emails, run:

```bash
python scripts/domain-histogram.py --input prospects/raw.csv --email-column email
```

You will see:

```
total rows: 134
  with email: 128 (96%)
  empty: 6

  business: 51 (40%)
  personal: 77 (60%)

top 20 domains (business + personal mixed):
   34  gmail.com [personal]
   18  outlook.com [personal]
   12  acme.com
    8  example.io
   ...
```

If 60%+ of the list is personal-domain email, you have two choices:

- Run the personal-email bridge step (LinkedIn-lookup each personal email to find the actual company).
- Drop everything that isn't business email if the channel is cold email (deliverability matters more than coverage).

Either way: don't push a personal-email-heavy list straight to a paid enrichment tool. Costs add up and most enrichers fail on personal addresses.

### Step 8: Rank

Score each candidate 0 to 100:

| Factor | Weight | How to score |
|---|---|---|
| Signal strength | 35 | High (just funded, just complained about your problem) = 35. Medium (recently changed roles, recently shipped) = 22. Low (matches persona) = 8. |
| Persona fit | 30 | `persona_bucket` matches the target persona and `persona_confidence` is high or medium = 30. Adjacent engineering leadership bucket = 18. `staff_principal_engineer` or `founding_engineer` at the right company = 12. Rows with `exclusion_reason` populated should usually be dropped before ranking. |
| Reachability | 15 | Email confirmed + LinkedIn + X = 15. Two of three = 9. One = 4. |
| Warm path | 10 | Accelerator batchmate, shared connection, mutual follow, shared work history = 10. Otherwise 0. |
| Play priors | 10 | Bump up if the signal type has worked for this founder before (read from `outreach-log/learned-*.md`). Defaults to 0 for first campaign. |

Sort desc. Drop anything below 30. Cap at the founder's target count.

**Honest note on play priors:** for a founder's first campaign there's no history to weight. Skip this column the first time. After 2 to 3 campaigns and a `/gtm-get-better` run, the learning files exist and this column starts paying off.

### Step 9: Write the CSV

Output to `prospects/{campaign-name}.csv`. Schema (channel skills depend on it):

```csv
score,full_name,company,role,linkedin_url,x_handle,email,email_confidence,signal,signal_strength,signal_evidence,recommended_channel,hook,warm_path,notes
```

| Column | Description |
|---|---|
| `score` | 0 to 100 from Step 8 |
| `full_name` | First + last (empty in account mode) |
| `company` | Company name |
| `role` | Job title (empty in account mode) |
| `linkedin_url` | Full URL or empty |
| `x_handle` | `@handle` or empty |
| `email` | Email if found |
| `email_confidence` | `confirmed` / `pattern-guess` / `unverified` |
| `signal` | Category from Step 2 |
| `signal_strength` | `high` / `medium` / `low`, used by channel skills to pick CTA tier |
| `signal_evidence` | One line with the proof and a date |
| `recommended_channel` | `x` / `linkedin` / `email` / `multi` |
| `hook` | One-sentence personalization hook the channel skill will use |
| `warm_path` | Note about any mutual connection or shared context, if you found one |
| `notes` | Anything else useful |

**Account mode** writes a parallel schema with `account_signal`, `suggested_personas`, and `find_persona_recipe` (e.g. `"LinkedIn search: 'VP Engineering' OR 'Head of Engineering' at {company} who started in last 90 days"`) instead of named individuals.

### Step 10: Event-attendee subflow (when applicable)

If the source is an event attendee list (Luma export, conference badge scan, webinar registrants):

1. Run `domain-histogram.py` first to see the personal/business mix.
2. Tag each row with `signal=joined_event`, `signal_evidence=Joined {event_name} on {date}`, `signal_strength=medium` (event attendance is a real signal but not as strong as direct complaining or active shipping).
3. For business-email attendees, fast-path through enrichment (email is already verified).
4. For personal-email attendees, decide: bridge via LinkedIn (slow but worth it for the right event), or drop (cheap; OK for low-fit events).

### Step 11: Hand off

Tell the founder where the CSV lives, the top 5 prospects with their hooks, and which channel skill to run next. Suggest sending the first 5 by hand before batching the rest. Always.

## Quality bar before saving

- [ ] Every row has `signal` and `signal_evidence` (no "just a name" rows)
- [ ] Every person-mode row has `hook` written for that person specifically
- [ ] Every row has at least one of `linkedin_url`, `x_handle`, `email`
- [ ] No duplicate rows (dedupe by `full_name + company` for person mode, by `company` for account mode)
- [ ] Top 5 spot-check: ranking correlates with signal × persona fit
- [ ] If 50%+ of rows are `email_confidence=pattern-guess`, tell the founder honestly

If quality fails, re-run the relevant step. Quality beats volume every time at this stage.

## Honest disclosure to the founder

When you hand off, be specific about confidence:

> "This list has 47 prospects ranked by signal strength. Top 12 are high-confidence (strong signal, exact persona, multiple channels). Next 20 are solid (medium signal, good persona fit). Bottom 15 are pattern-guessed emails or weaker signals, send those to drafts mode and review before sending."

## What this skill does not do

- Send messages (channel skills do that).
- Store contact info outside the local CSV (no SaaS upload, no third-party sync).
- Scrape LinkedIn at scale or violate platform ToS. Search via your own logged-in session is fine; mass-scraping is not.
- Buy data. Every paid source the founder uses requires them to already pay for it.

## Scripts in this folder

See `scripts/README.md` for full details. The short version:

- `title-classifier.py`, deterministic role filter; reads from `data/`
- `techcrunch-funding-rss.py`, recent funding rounds
- `hn-show-scraper.py`, Show HN "just shipped" posts
- `x-topic-search.py`, bio + topic search via xmcp
- `domain-histogram.py`, personal vs business email mix before enrichment

These are intentionally small and standard-library-first so a founder can read and modify them. Anything more sophisticated lives in the channel skills, where it's needed for sending.$q$,
    $q${}$q$::jsonb,
    2
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$skill$q$,
    $q$gtm-get-better$q$,
    $q$gtm-get-better$q$,
    $q$Weekly compound learning loop for the founder-gtm plugin. Reads outreach logs across all channels (X DMs, LinkedIn, cold email), classifies replies using the standard rubric (positive / objection / neutral / OOO / negative) on the first inbound message per thread, tallies metrics per-person-enrolled (not per-email) and sliced by play / channel / touch number, identifies winning hooks/subjects/openers, and writes timestamped updates to sales-pack.md plus per-channel learned-*.md files so the next campaign produces sharper messages. Includes a retirement rule (N>=15 sends, 0 positive replies, 2+ cycles → retire). Use weekly, after any campaign has had 7+ days to collect replies, when the founder runs /gtm-get-better, asks to learn from past outreach, or asks what's working.$q$,
    $q$# Get Better, compound learning loop

The whole reason to run outbound from Cursor instead of a fixed SaaS tool is that the system can get sharper every cycle. This skill is what makes that real.

## Inputs

```
outreach-log/x-dms.jsonl              every X DM sent
outreach-log/linkedin.jsonl           every LinkedIn note sent
outreach-log/email.jsonl              every cold email step sent
outreach-log/email-replies.jsonl      replies ingested by /gtm-cold-email --check-replies
outreach-log/manual-replies.jsonl     replies the founder hand-logs (X, LinkedIn)
plays/*.md                            play definitions (slice metrics by these)
sales-pack.md                         current source of truth (we append to it)
```

If `outreach-log/` is empty or every file is missing, tell the founder you need a campaign + ~7 days for replies before there's anything to learn from.

## The rubric (single source of truth)

Every reply gets classified as exactly one of:

| Label | Definition | Examples |
|---|---|---|
| **positive** | Prospect expressed real interest, asked a follow-up question, agreed to a meeting, or asked you to send more info | "Sure, would love to chat" / "Yes, send the Loom" / "What does pricing look like?" / "Can we do Thursday?" |
| **objection** | Prospect engaged but pushed back; usually worth replying to | "We're already on X" / "Not the right time" / "Send a one-pager and I'll look" / "What about [concern]" |
| **neutral** | Prospect replied but no clear engagement or pushback | "Got it, thanks" / "Will pass to the team" / single-emoji replies |
| **OOO** | Auto-reply, out of office, vacation responder, role-change auto-reply | "I'm out until Monday" / "I no longer work at X" / Auto-Submitted header present |
| **negative** | Hard no, unsubscribe, angry reply, mark-as-spam | "Stop emailing me" / "Remove from list" / "Don't contact me" |

**First-reply-only.** Only the first inbound message per thread is classified for metrics. Follow-up "thanks!" or scheduling-back-and-forth doesn't get re-classified, that would let later messages overwrite the real intent signal.

**OOO detection heuristics** (auto-classify, then the founder confirms):
- `Auto-Submitted` header set to anything other than `no`
- Subject contains "out of office", "OOO", "auto-reply", "automatic reply", "[Auto Reply]"
- Body matches `^(I'?m|I am) (out of office|on vacation|on leave|away)`
- Body matches `I no longer work at`

OOO replies stop the sequence (don't keep messaging someone on vacation) but are excluded from the positive-rate denominator.

## Workflow

### Step 1: Pick the lookback window

```
Question: "How far back are we learning from?"
Options:
- Since last /gtm-get-better run (default)
- Last 7 days
- Last 30 days
- All time
```

Default: since last run. Read `.gtm-state/last-gtm-get-better.json` for the timestamp.

### Step 2: Ingest fresh replies

Two paths:

**Cold email**, call `/gtm-cold-email --check-replies` first. This polls Gmail threads and writes new entries to `outreach-log/email-replies.jsonl`. Then classify each new entry per the rubric.

**X DMs and LinkedIn**, no programmatic reply ingestion exists. Walk the founder through unreplied prospects:

```
Question: "Any X DM or LinkedIn replies to log since last run?"
Options:
- Yes — walk me through prospects with no logged reply
- Skip (only learn from email replies)
```

If yes, show each unreplied prospect one at a time and ask: positive / objection / neutral / OOO / negative / no_reply. For positives or objections, ask for a one-line note of what the prospect said. Append to `outreach-log/manual-replies.jsonl`.

### Step 3: Compute metrics

For the lookback window, compute per channel **and** per play (using the `campaign` field in each log row, which matches a play name):

**The denominator is unique people enrolled, not messages sent.** A 4-touch sequence inflates message counts and makes plays incomparable. Always divide by people who got at least one message.

```
For each (channel, play):
  enrolled              = count(unique prospects with at least one outbound sent)
  total_sent            = sum of all outbound messages
  any_reply             = count(unique prospects with at least one reply of any kind)
  positive_replies      = count(unique prospects whose first reply was positive)
  objection_replies     = count(unique prospects whose first reply was objection)
  neutral_replies       = count(unique prospects whose first reply was neutral)
  ooo_replies           = count(unique prospects whose first reply was OOO)
  negative_replies      = count(unique prospects whose first reply was negative)

  reply_rate            = any_reply / enrolled
  positive_rate         = positive_replies / enrolled
  pos_plus_obj_rate     = (positive + objection) / enrolled
  ooo_filtered_rate     = positive_replies / max(1, enrolled - ooo_replies)
```

Also compute **per touch** within the cold-email channel:
- `positives_attributable_to_touch_N` (which touch produced the first reply, by touch number)

This tells the founder which follow-up is actually working. The common finding: touch 3 often produces more positives than touch 1.

### Step 4: Classify what's working

For each (channel, play) combination:

- **Winners** (positive_rate ≥ 3% AND enrolled ≥ 15): note opener / subject / hook source / persona segment.
- **Losers** (positive_rate = 0% AND enrolled ≥ 15): candidates for retirement.
- **Surprises**: anything that contradicts the founder's stated belief from `sales-pack.md`.
- **Too early to call** (enrolled < 15): list, but flag as hypothesis-only.

The N≥15 threshold is intentionally lower than enterprise growth teams use (N≥20 or 50). At founder volume, 15 is enough to start seeing direction without waiting forever.

**Auto-flag high-risk subject patterns (even before N≥15).** Subjects containing any of "unlock", "10x", "accelerating", or a version number ("2.0:") are dead-on-arrival patterns the internal Cursor growth team has retired with 4,000+ sends of data behind the call. Flag these immediately in the report so the founder can rewrite before more of the sequence fires.

**The "do not re-offer" rule.** Scan `outreach-log/*.jsonl` for prospects whose follow-up offer references an asset they already consumed (downloaded the guide, attended the webinar, read the case study). Flag these as "wasted touch" in the surprises section. The next touch should be what comes *after* the asset, not the asset again.

### Step 5: Retirement decision for losers

For each play that meets the retirement bar (0 positive, N≥15, ≥2 cycles run):

```
Question: "Play '{name}' has {N} sends, 0 positive replies, {X} OOO. This is the second cycle with these numbers. Retire?"
Options:
- Retire it (mark status: retired in plays/{name}.md)
- Iterate the messaging (run /gtm-design-play in iteration mode on this play)
- Iterate the signal or persona (start the play over from scratch)
- Keep watching for one more cycle (rare — only if there's an unusual reason)
```

Default recommendation: retire. Most weak plays do not get better with copy tweaks; the signal or persona is wrong.

### Step 6: Update sales-pack.md

Append a timestamped block to the `## Update log` section at the bottom of `sales-pack.md`:

```markdown
### Update — 2026-05-27 (from /gtm-get-better)

**Window:** since 2026-05-13 (14 days)
**Total enrolled across plays:** 87
**First replies:** 14 (6 positive, 3 objections, 2 neutral, 3 OOO)
**Positive rate (people enrolled):** 6.9%
**OOO-filtered positive rate:** 7.1%

**By play:**
| Play | Channel | Enrolled | Reply | Positive | Pos+Obj | Status |
|---|---|---|---|---|---|---|
| seed-funded-vp-eng-2026-01 | email | 38 | 18% | 10.5% | 13.2% | winner — double down |
| x-shipped-evals-2026-01    | x-dms | 24 | 16% | 8.3%  | 8.3%  | winner — double down |
| linkedin-ai-pms-2026-01    | li    | 25 | 8%  | 0%    | 4%    | retire after this cycle |

**By touch (cold email):**
| Touch | Sent | Positive | % of positives |
|---|---|---|---|
| 1 | 38 | 2 | 33% |
| 2 | 32 | 3 | 50% |
| 3 | 24 | 1 | 17% |
| 4 | (not run yet) | — | — |

**What worked:**
- Opener pattern "Saw your post on {{X}}" — 4 of 6 positives came from this.
- Signal "recent_complaining" outperformed "recent_funding" (positive_rate 9% vs 4%).
- Persona "Founding engineer at 5–25-person teams" replied at 12%; "VP Eng at 100+" at 0%.

**What didn't:**
- Subject "{{Company}}'s developer velocity" — 0 positive on 18 sends; retiring.
- Touch 1 CTA "would love to demo" — 0 replies on plays using it.

**Open objections heard (worth answering):**
- "We already use {competitor}" — 2 prospects; sharpen the wedge in sales-pack § Value props.
- "Tried similar things, didn't stick" — 1 prospect; consider a "small commitment" CTA option.

**Recommended sales-pack edits:**
1. Add "Founding engineer at 5–25-person teams" to top-priority personas.
2. Strengthen the wedge vs {competitor} in § Value props.
3. Test "5-min Loom" CTA instead of "15-min call" for objection-resistant prospects.
```

Append-only. Don't rewrite earlier entries.

### Step 7: Update per-channel learned files

For any channel with new learnings, write or append `outreach-log/learned-{channel}.md`:

```markdown
# Learned — X DMs

Last updated: 2026-05-27

## Opener templates to prefer
- "Saw your post on {{X}}" — current best (positive rate 7.1%, N=24)

## Opener templates to retire
- "Congrats on the new role" — 0 positive on N=18; retired 2026-05-27

## Signal source ranking (last 30 days)
1. recent_complaining (positive_rate 9%, N=24)
2. recent_funding (positive_rate 4%, N=51)
3. recent_role_change (positive_rate 0%, N=18 — retired)

## CTAs that work
- "would a quick chat make sense?" — N=12, positive_rate 8%

## CTAs that don't
- "would love to demo for you" — N=12, positive_rate 0%, retired
```

The channel skills read these files at the top of their workflow and bias drafting toward what's been working for this founder.

### Step 8: Surface top 3 actions

Don't drown the founder in numbers. End with three concrete next moves, in priority order:

```
Top 3 actions from this cycle:

1. Double down on 'recent_complaining' as a signal source. 3x positive rate vs other signals. Re-run /gtm-find-prospects with it as the primary signal.

2. Sharpen the wedge vs {competitor}. Two prospects raised it; you don't have a tight one-liner. Run /gtm-sales-pack and focus on § Value props § Wedge.

3. Retire the 'linkedin-ai-pms-2026-01' play after this cycle. 0 positive on N=25, second cycle. The signal or persona is wrong; copy tweaks won't fix it.
```

### Step 8.5: Propose skill file edits

The other steps update `sales-pack.md` and per-channel learned files. This step does something stronger: when a pattern is clearly winning, propose baking it into the **skill files themselves** so future runs default to it.

**Eligibility (conservative on purpose):**

- `N >= 20` sends backing the pattern.
- Pattern is statistically distinctive: `pattern_positive_rate >= 2x` other patterns in the same channel and persona.
- Pattern has held across at least two cycles (use `.gtm-state/skill-edit-history.jsonl` to check).
- Default is "propose, do not apply". Every change requires founder approval per edit.

**Targets:**

| Skill file | What gets edited | Example pattern |
|---|---|---|
| `gtm-x-outreach/SKILL.md` | Default opener template in Step 4 | "Saw your post on {{X}}" won 8 of 10 positives across 30 sends |
| `gtm-linkedin-outreach/SKILL.md` | Step 3 example block | "Hey {{name}}, your post on {{X}}" outperforms "Hey {{name}}, saw you just joined" |
| `gtm-cold-email/SKILL.md` | Subject framework table | "Re: {{Company}}'s X" converts 3x better than alternatives |
| `gtm-design-play/SKILL.md` | Offer ladder defaults | Soft Touch 1 CTA "want the playbook" beats direct ask on medium-signal plays |

**Workflow:**

1. Scan the metrics computed in Step 3 and the patterns surfaced in Step 4. For each pattern that meets eligibility, identify the candidate skill file edit.
2. Read the target skill file. Locate the exact section to change. Generate a unified diff proposal:

   ```diff
   --- gtm-x-outreach/SKILL.md
   +++ gtm-x-outreach/SKILL.md
   @@
   -{{Hook line, reacts to the specific post or thread}}
   +{{Hook line, reacts to the specific post or thread. Default opener template:
   +"Saw your post on {{topic}}, {{one sentence of genuine reaction}}." Won 8 of 10 positives across 30 sends in this founder's history.}}
   ```

3. Show the diff to the founder one edit at a time. AskQuestion:

   ```
   Question: "Apply this edit to gtm-x-outreach/SKILL.md? Evidence: 8 of 10 positives on N=30 across 2 cycles."
   Options:
   - Apply (writes the edit + adds a provenance marker)
   - Skip this edit
   - Apply but let me hand-tweak first (opens the file at the edit location)
   - Abort all skill edits
   ```

4. On approval, apply the edit and add a provenance marker comment right above the edited block:

   ```html
   <!-- compound-update: 2026-05-27 from /gtm-get-better -->
   ```

5. Append to `.gtm-state/skill-edit-history.jsonl`:

   ```json
   {
     "timestamp": "2026-05-27T17:30:00Z",
     "skill_file": "skills/gtm-x-outreach/SKILL.md",
     "evidence": { "pattern": "opener: Saw your post on X", "positives": 8, "sends": 30, "cycles": 2 },
     "approved": true,
     "edit_summary": "Made 'Saw your post on X' the default opener template"
   }
   ```

6. If the founder skips or aborts, log the proposal anyway with `approved: false` so the next cycle does not re-propose the same edit immediately. Re-propose after one more cycle of fresh evidence.

**Guardrails:**

- Never edit `rules/gtm-voice-guide.mdc` from this step. The voice rule is hand-curated; copy-paste-good-patterns drift it.
- Never delete sections. Only additive edits, or replacing example text inside a section.
- Show a max of 3 edit proposals per run. More than that overwhelms the review.

### Step 9: Persist the run

Write `.gtm-state/last-gtm-get-better.json`:

```json
{
  "timestamp": "2026-05-27T17:30:00Z",
  "window_start": "2026-05-13T17:30:00Z",
  "window_end": "2026-05-27T17:30:00Z",
  "totals": { "enrolled": 87, "positive": 6, "objection": 3, "neutral": 2, "ooo": 3, "negative": 0 },
  "play_decisions": [
    { "play": "seed-funded-vp-eng-2026-01", "decision": "double_down" },
    { "play": "x-shipped-evals-2026-01", "decision": "double_down" },
    { "play": "linkedin-ai-pms-2026-01", "decision": "retire_next_cycle" }
  ],
  "actions": [ "...", "...", "..." ]
}
```

## Output format to the founder

```
Learning cycle complete — 14-day window.
Enrolled: 87 prospects across 3 plays.
First replies: 14 (6 positive, 3 objections, 2 neutral, 3 OOO).
Positive rate: 6.9% (up from 4.2% last cycle).

Winners (keep running):
  ✓ seed-funded-vp-eng-2026-01 — 10.5% positive
  ✓ x-shipped-evals-2026-01    — 8.3% positive

Retire candidate:
  ✗ linkedin-ai-pms-2026-01    — 0% positive on N=25

Top 3 actions:
1. ...
2. ...
3. ...

Detailed update appended to sales-pack.md.
Per-channel playbooks updated.
```

## Honest limitations

- **X and LinkedIn replies require manual logging.** No reliable programmatic path. The skill prompts you.
- **Small samples lie.** When N<15 per play, treat findings as hypotheses, not conclusions. Flag explicitly.
- **Reply classification can drift.** Spot-check the LLM's classifications periodically.
- **Touch attribution is approximate.** "Positive after touch 3" doesn't mean touch 3 caused the positive, touches 1 and 2 set it up.

## Frequency

Run weekly during active outbound. Less often and the learning is stale. More often and you'll be reading noise from undersized samples.

If the founder runs `/gtm-get-better` more than once in 24 hours without new campaign data, push back: "No new data since last run. Come back after another campaign cycle."

## Companion skill

After a few cycles, the founder should design new plays from the learnings (via `/gtm-design-play`) and retire old ones. This skill identifies the candidates; `/gtm-design-play` builds the next iteration.$q$,
    $q${}$q$::jsonb,
    3
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$skill$q$,
    $q$gtm-linkedin-outreach$q$,
    $q$gtm-linkedin-outreach$q$,
    $q$Run personalized LinkedIn outreach for an early-stage founder. Reads a prospects CSV from gtm-find-prospects, fetches each target's LinkedIn profile context, drafts ≤250-char connection-request notes grounded in sales-pack.md, and sends via Lemlist (primary, recommended), Amplemarket, La Growth Machine, or generates copy-paste-ready text for manual sending. Use when the founder wants to run LinkedIn outreach, wants to send connection requests at scale, runs /gtm-linkedin-outreach, or has a prospect list with linkedin_url populated.$q$,
    $q$# LinkedIn Outreach, connection notes that get accepted

You are running a LinkedIn outreach campaign for an early-stage founder. The default channel inside LinkedIn is the **connection request with a personalized note**, capped at 300 chars by LinkedIn's UI, but the highest-performing notes are ≤250 chars.

## Step 0: Tool and daily-limit setup (do this first)

LinkedIn's rate limits are unforgiving and tool choice locks you in for the rest of the workflow. Settle both before any prerequisite checks.

### 0a: Confirm the LinkedIn tool

Read `${CURSOR_PLUGIN_ROOT}/.gtm-state/tools.json` if it exists; otherwise ask:

```
Question: "Which LinkedIn tool are we using? (We strongly recommend Lemlist, the cheapest at ~$59/mo and the best LinkedIn+email combo. The others work too if you already have them.)"
Options:
- Lemlist (recommended)
- Amplemarket (if you already pay for it)
- La Growth Machine (LGM)
- Manual: I'll copy-paste each note into LinkedIn myself
```

Persist the choice to `${CURSOR_PLUGIN_ROOT}/.gtm-state/tools.json` under key `linkedin_tool`.

### 0b: Pick the daily connect limit

LinkedIn caps connect requests at ~100/week before flagging; "safe" daily varies a lot by account type. Ask the founder which bucket they're in and use the table to recommend:

| Account type | Recommended daily limit | Notes |
|---|---|---|
| New LinkedIn account (less than 6 months old) | 5 to 10 connects/day | LinkedIn aggressively rate-limits new accounts |
| Established free account | 15 to 20 connects/day | Standard. About 100/week ceiling. |
| LinkedIn Premium | 20 to 30 connects/day | Slightly higher tolerance |
| Sales Navigator | 30 to 50 connects/day plus InMail credits | Highest tolerance. Use InMails for non-1st-degree connections. |

```
Question: "What's your LinkedIn account type? We'll recommend a safe daily connect limit."
Options:
- New account (<6 months): recommend 8/day
- Established free account: recommend 18/day
- LinkedIn Premium: recommend 25/day
- Sales Navigator: recommend 40/day
- Override (I'll set my own number)
```

Save the chosen integer as `LINKEDIN_DAILY_LIMIT` in `${CURSOR_PLUGIN_ROOT}/.env`. Also write the choice to `${CURSOR_PLUGIN_ROOT}/.gtm-state/tools.json` under `linkedin_daily_limit` so other tools see the same number.

### 0c: Per-day counter

Maintain `${CURSOR_PLUGIN_ROOT}/.gtm-state/linkedin-connects-{YYYY-MM-DD}.json`:

```json
{
  "date": "2026-05-27",
  "limit": 18,
  "sent_today": 0,
  "campaign_counts": { "seed-fundraisers-2026-05": 0 }
}
```

This mirrors the pattern `gtm-cold-email` uses for its daily cap. Increment `sent_today` on every successful send (Lemlist add-to-campaign, Amplemarket add-to-sequence, LGM enrollment, or a manual entry the founder marks sent). **Before each send, refuse if `sent_today >= limit`** and tell the founder: "Today's LinkedIn cap of {limit} is hit. Resume tomorrow or raise the limit in `.env` if your account can handle more."

## Prerequisites

```bash
test -f sales-pack.md || echo "MISSING sales-pack.md"
```

Refuse to draft without `sales-pack.md`.

## Tool-specific setup

### Lemlist (recommended path)

If first time:
1. Create account at https://app.lemlist.com (free trial).
2. Generate API key: Settings → Integrations → API → Generate.
3. Connect LinkedIn account inside Lemlist UI (Lemlist uses a cookie-based session, no LinkedIn API needed).
4. Store in `${CURSOR_PLUGIN_ROOT}/.env`:
   ```
   LEMLIST_API_KEY=...
   LEMLIST_TEAM_ID=...
   ```
5. Test: `curl -u :$LEMLIST_API_KEY https://api.lemlist.com/api/team` should return team JSON.

Lemlist API reference: https://developer.lemlist.com (search for "Add lead to campaign" and "LinkedIn invitation").

### Amplemarket

If first time:
1. Get API key from Settings → API.
2. Store as `AMPLEMARKET_API_KEY` in `.env`.
3. API docs: https://docs.amplemarket.com

### La Growth Machine

If first time:
1. Get API key from your LGM workspace settings.
2. Store as `LGM_API_KEY` in `.env`.
3. API docs: https://api-docs.lagrowthmachine.com

### Manual

Nothing to set up. We'll generate a markdown file with one note per prospect, formatted for fast copy-paste.

## Step 1: Load the prospect list

```
Question: "Which prospect list?"
Options:
- Auto-detect (use the most recent prospects/*.csv)
- {{list discovered CSVs}}
- Paste a list inline
```

Filter rows where `linkedin_url` is non-empty AND (`recommended_channel` is `linkedin` OR `multi`).

Ask for batch size, capped by the remaining daily allowance from `.gtm-state/linkedin-connects-{YYYY-MM-DD}.json` (`limit - sent_today`):

```
Question: "How many connection requests to draft? Today's remaining cap is {remaining} of {limit}."
Options:
- 5 (calibration)
- {remaining} (use the rest of today's allowance)
- All filtered, capped at {remaining}
```

If the founder asks for more than `remaining`, refuse and explain: "Your daily LinkedIn cap is {limit} (from `LINKEDIN_DAILY_LIMIT`). {sent_today} are already sent. Pick {remaining} or fewer, or re-run tomorrow."

## Step 2: For each prospect, gather LinkedIn context

LinkedIn has no public API. You can't programmatically fetch profile data without violating ToS or paying for enrichment tools. Workable approaches:

- **If the founder has Amplemarket/Apollo:** they include enrichment that returns profile JSON. Use that.
- **If using Lemlist with the Lemlist Chrome extension:** Lemlist scrapes profile data when the founder adds the lead via the extension. The API can read this enriched data on the lead object.
- **If gtm-find-prospects already added profile context to the `hook` column:** use that.
- **Otherwise:** ask the founder to paste the prospect's About section + last 3 LinkedIn posts. This sounds painful but for 15 prospects it's 10 minutes and produces far better notes than scraping.

The skill should default to the path most economical for the founder's tool stack.

## Step 3: Draft the connection note

Apply the `gtm-voice-guide` rule. LinkedIn-specific constraints:

- **≤250 characters** (hard cap; LinkedIn allows 300 but tighter performs better).
- **Plain text only.** No emojis. No formatting.
- **First sentence must reference something specific**, their About, a recent post, a recent role change, a shared connection, a recent company milestone.
- **Second sentence: one-line "why you".** Connect their context to what you do, in their language.
- **Optional third: micro-CTA.** Often just "would love to connect and trade notes."

Structure:

```
Hey {{firstname}}, {{hook — refers to something specific}}.

{{One line: how that connects to what you're working on. No pitch yet — this is a connection request, not a sales email.}}

{{Optional CTA: "Would love to connect" / "Open to swapping notes?"}}
```

**Examples of good ≤250 char notes:**

> Hey Jane, your post on AI evals being the new unit tests really resonated, we're building tooling around exactly that workflow at Acme. Would love to connect and compare notes.

> Hey Sam, saw you just joined Acme as Head of Eng, congrats. We work with a few similar Series A teams on scaling agentic coding workflows. Open to connecting?

> Hey Pat, loved your essay on PLG-led enterprise sales. We're an AI infra co figuring out exactly that motion right now. Would be great to connect.

**Examples of bad notes (do not produce these):**

> Hey Jane, I came across your profile and was impressed by your background. I'd love to connect and explore opportunities. *(Generic. Says nothing specific. Sounds like a recruiter spam template.)*

> Hi Sam, I'm building a tool that helps engineering teams 10x their velocity. Would love to demo it for you. *(Pitches in a connect request. Almost certainly declined.)*

## Step 4: Show drafts + approval

Per prospect, show:

- Name, role, company, score
- The context being referenced
- The draft note + character count
- Founder choices: Send / Edit / Skip / Find a different hook

## Step 5: Send via the chosen tool

**Before each send**, re-check `.gtm-state/linkedin-connects-{YYYY-MM-DD}.json`. If `sent_today >= limit`, stop the loop immediately and tell the founder how many actually went out vs how many were skipped. Increment `sent_today` only after a successful Lemlist/Amplemarket/LGM API confirmation, or after the founder marks a manual entry sent.

### Via Lemlist

1. Add the lead to a Lemlist campaign (or create a campaign first if none exists).
   ```
   POST https://api.lemlist.com/api/campaigns/{{campaignId}}/leads
   {
     "linkedinUrl": "...",
     "firstName": "...",
     "lastName": "...",
     "companyName": "...",
     "customFields": { "personalizedNote": "<the note>" }
   }
   ```
2. The Lemlist campaign should be configured (in Lemlist UI) with a LinkedIn connection-request step that uses the `personalizedNote` custom field as the note text.

Founders unfamiliar with Lemlist campaign setup: walk them through it once via the Lemlist UI; the skill then drives lead addition via API.

### Via Amplemarket / LGM

Similar pattern: add lead to a pre-built sequence; the tool handles the LinkedIn connection-send + retries.

### Via Manual

Generate `outreach-log/linkedin-{{campaign-name}}.md` with one entry per prospect:

```markdown
## Jane Doe — VP Engineering at Acme
LinkedIn: https://linkedin.com/in/janedoe
Score: 85

> Hey Jane, your post on AI evals being the new unit tests really resonated — we're building tooling around exactly that workflow at Acme. Would love to connect and compare notes.

[ ] Sent on: ______
```

Founder opens this file, clicks each LinkedIn link, pastes the note, sends, and checks the box. Slow but free.

## Step 6: Log the send

Append to `outreach-log/linkedin.jsonl`:

```json
{
  "timestamp": "2026-05-27T17:30:00Z",
  "campaign": "{{campaign-name}}",
  "prospect": { "name": "...", "linkedin_url": "...", "company": "...", "score": 85 },
  "context_used": "their About + their last post on AI evals",
  "note": "the full note we sent",
  "char_count": 234,
  "tool": "lemlist",
  "send_status": "queued",
  "lemlist_lead_id": "..."
}
```

## Step 7: Schedule follow-ups (after acceptance)

LinkedIn connection requests are just the door-opener. Real outreach is the **first message after they accept**.

The skill should queue a Touch 2 message to be sent 1 to 2 days after acceptance. The tool (Lemlist) handles the "fires when accepted" trigger natively. For manual users, generate a follow-up draft file they can reference once a connection is accepted.

Touch 2 template (≤500 chars, plain text):

```
Thanks for connecting, {{firstname}}.

{{Brief context — one specific thing about why your work is relevant to them, building on the hook from the connect note.}}

{{The actual offer: "Would a 15-min call make sense?" or "Want me to send a Loom showing how this works for {{similar company}}?" — pull the default CTA from sales-pack.md § "The one thing".}}

{{Founder signature from sales-pack.md}}
```

## Rate limits and best practices

- **LinkedIn caps connection requests at ~100/week.** Exceeding triggers warnings and eventual account restrictions. The Step 0 daily-limit table maps account types to safe daily numbers (5 to 10 for new accounts, up to 30 to 50 on Sales Navigator).
- **Connection acceptance rate target:** 30 to 40%. Below 25% means your notes need work (re-run with sharper hooks).
- **Lemlist's LinkedIn module limits:** ~50 connects/day per account; respect it on top of the Step 0 cap.
- **Premium account?** LinkedIn Premium / Sales Navigator gives ~150/week and InMail credits. Re-run Step 0b to raise `LINKEDIN_DAILY_LIMIT` if you upgrade mid-campaign.
- **Cap enforcement is hard, not advisory.** The per-day counter file refuses sends past the limit. If you need to raise it, edit `.env` and re-run Step 0b (don't bypass the counter).

## Honest limitations

- **LinkedIn has no public API for connection requests.** All tools (Lemlist, Amplemarket, LGM) work via browser automation or cookie-based session. LinkedIn can detect and ban. Use a real account, behave like a human, stay under limits.
- **Notes >300 chars get truncated by LinkedIn.** Stay under 300 always, ideally under 250.
- **Some prospects have "connection note disabled"**, you can only send a blank invite. The skill should detect this (Lemlist returns a flag) and ask the founder if they want to send a blank invite (lower acceptance rate but sometimes worth it for hot prospects).

## Output after the run

```
LinkedIn campaign: {{campaign-name}}
Sent: {{N}} | Drafts saved: {{M}} | Skipped: {{X}}
Tool: {{Lemlist / Amplemarket / LGM / Manual}}
Daily cap: {{sent_today}} of {{limit}} used today.

Top 3 hooks used:
1. Jane Doe — referenced her recent post on AI evals
2. ...

Watch for acceptances in {{tool}} or LinkedIn. Touch 2 will auto-fire 1–2 days after acceptance.
Run /gtm-get-better in 7 days to learn from response rates.
```$q$,
    $q${}$q$::jsonb,
    4
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$skill$q$,
    $q$gtm-playbook$q$,
    $q$gtm-playbook$q$,
    $q$Opens or points to the Founder GTM canvas playbook. Use when a founder wants the visual GTM guide, asks what the plugin includes, asks to see the playbook, or wants a walkthrough before running gtm-setup.$q$,
    $q$# GTM Playbook

Open the visual playbook at `${CURSOR_PLUGIN_ROOT}/canvases/founder-gtm-playbook.canvas.tsx`.

If the `cursor-app-control` MCP is available, use `open_resource` with that absolute plugin-root path. Do not open `canvases/founder-gtm-playbook.canvas.tsx` as a workspace-relative path; after Marketplace install, the canvas lives inside the installed plugin, not necessarily in the founder's current project. If `cursor-app-control` is not available, tell the founder where the canvas lives and suggest running `/gtm-setup` after they skim it.

After opening the canvas, give a short orientation:

1. The framework is identify, resonate, time, follow up.
2. The first practical step is `/gtm-sales-pack`.
3. The plugin gets better over time through `/gtm-get-better` and the bundled automations.

Do not summarize the whole canvas unless the founder asks. The point is to open the artifact and help them start.$q$,
    $q${}$q$::jsonb,
    5
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$skill$q$,
    $q$gtm-sales-pack$q$,
    $q$gtm-sales-pack$q$,
    $q$Interviews a founder grill-me style (one question at a time, ~25 questions total) about their company, ICP, value props, common objections, persona-specific positioning, and writing voice. Produces a structured sales-pack.md knowledge base that every other founder-gtm skill (gtm-x-outreach, gtm-linkedin-outreach, gtm-cold-email, gtm-find-prospects, gtm-get-better) reads from. PREREQUISITE for all outreach skills. Use when a founder first sets up founder-gtm, when sales-pack.md is missing or stale, when the founder says they're updating their positioning, types /gtm-sales-pack, or asks for help articulating their pitch.$q$,
    $q$# Sales Pack, context collection

You are interviewing an early-stage founder to build their **sales pack**: a single markdown file (`sales-pack.md`) that becomes the source of truth for every outbound message the `founder-gtm` plugin drafts. Without this file, every other skill produces generic AI slop.

## What you produce

A `sales-pack.md` file at the founder's current project root, with the exact section structure defined in the [Output template](#output-template) below. Use the template verbatim, other skills parse against these section headings.

## How to interview

This skill is an offshoot of `grill-me`. Same energy: ask one question at a time, walk the tree, recommend an answer when useful, but let the founder speak in their own words. Do not batch questions. Do not paraphrase their answers into bullet points without checking.

### Three principles

1. **One question at a time, in order.** Each question's answer informs the next. Do not show the full list up front, it overwhelms.
2. **Capture their exact words.** When they describe their product, copy their phrasing. When they describe a customer pain, write it the way they said it. The point is voice, not polish.
3. **Push for specificity.** "We help engineering teams move faster" is useless. "We help 50-engineer Series A teams ship 2x more PRs by automating code review" is usable. When you hear vague claims, ask "can you give me a specific example?" or "what number have you actually measured?".

### Modes

Offer the founder a choice at the start:

- **Full mode (~25 questions, ~20 minutes)**, recommended for first run.
- **Lightning mode (~10 questions, ~7 minutes)**, for impatient founders. Produces a usable but thinner sales-pack; flag that they should re-run full mode within a week.

## The question tree

Walk these sections in order. Within each section, ask the questions one at a time. Skip questions if the answer is already clear from prior context.

### Section 1: Company basics (4 questions)

1. **One-liner.** "In one sentence, what does your company do?" If the answer is buzzwordy, push back: "Imagine you're saying this to your mom, what does it actually do?"
2. **Stage.** "Where are you, pre-seed, seed, Series A? How many engineers/employees?"
3. **Customers today.** "Name 3 real customers you have right now. (Or 3 design partners, or 3 people who actively use it.)"
4. **What problem are you solving that wasn't being solved before?** Push for the specific gap in the market, not the generic problem space.

### Section 2: Ideal Customer Profile (5 questions)

5. **Who is the *best* customer you have today?** Name them. Why are they your best?
6. **What did they have in common before they bought?** (Stage, team size, tech stack, role of buyer, pain point trigger.)
7. **Who is *not* a good customer for you?** What are the disqualifiers? (Just as important as who *is*, saves outreach time.)
8. **What signals indicate someone is ready to buy right now?** (Just raised, just hired a CTO, just shipped X, just hit pain Y.)
9. **Personas you sell to.** List up to 3 (e.g. "VP Eng", "Founding engineer", "Head of Growth"). For each: do they have buying power, or are they an influencer?

### Section 3: Value props per persona (4 questions)

10. **For your primary persona:** What are the top 3 reasons they care? Phrase each as the outcome they get, not the feature you ship. ("Cut review time from 4 days to 4 hours" ≠ "AI-powered PR review.")
11. **Proof points.** What numbers or customer outcomes can you cite with permission? List them. (Name + metric + permission level: "Brex / 45% AI-written code / OK to name publicly".)
12. **Wedge.** What's the one thing you can claim that competitors can't?
13. **Anti-pitch.** What are you not? (e.g. "We're not a Cursor replacement, we're a layer on top." This sharpens positioning.)

### Section 4: Common objections (3 questions)

14. **What do prospects push back on most often?** List the top 5 objections in their actual words.
15. **For each objection, what's your one-line response?** Keep it tight.
16. **What objection genuinely scares you?** The one you don't have a great answer for yet. (We'll handle this honestly in messaging.)

### Section 5: Channels and what's worked (3 questions)

17. **What outbound have you tried already?** (X, LinkedIn, email, in-person events, etc.) What replied? What didn't?
18. **Where do your best customers actually hang out?** (Specific subreddits, Twitter circles, Slack communities, podcasts, conferences.)
19. **What's your unfair distribution advantage?** (An accelerator batch, a VC partner's intros, a viral tweet you wrote, your background, a community you run.) Be honest if there isn't one.

### Section 6: Voice and writing style (4 questions + 1 path picker)

**6.0 Voice path picker (ask first).** Before the writing-sample questions, ask the founder which path they want for voice collection. The order matters: Option A is preferred when available because real sent email beats curated samples for capturing the founder's actual voice.

```
Question: "How do you want to capture your writing voice?"
Options:
- A) Pull from my Gmail (recommended) — reads my last 50 to 100 sent emails, extracts patterns, redacts recipients. Read-only. Requires the founder-gtm Gmail token from /gtm-cold-email setup.
- B) Paste 2 to 3 samples manually (skips Gmail)
- C) Use defaults (generic founder voice, conservative downstream)
```

Persist the chosen path to `.gtm-state/sales-pack-voice-path.json` so re-runs do not re-ask.

**Option A: Pull from Gmail.** Check for the OAuth token at `${CURSOR_PLUGIN_ROOT}/.gtm-state/gmail-token.json`. The token scopes already include `gmail.readonly` (set by `gtm-cold-email/scripts/gmail-auth.py`). If the token is missing, tell the founder one of two things:

- If they have already run `/gtm-cold-email` setup, the token should exist; re-run `python ${CURSOR_PLUGIN_ROOT}/skills/gtm-cold-email/scripts/gmail-auth.py` to regenerate.
- If they have not run `/gtm-cold-email` setup, fall back to Option B (or set up Gmail now via the cold-email setup flow).

Run the extractor:

```bash
python ${CURSOR_PLUGIN_ROOT}/skills/gtm-sales-pack/scripts/extract-voice-from-gmail.py \
  --max-emails 100 --min-words 30 \
  --out .gtm-state/voice-profile.json
```

The script (see `scripts/extract-voice-from-gmail.py`) is read-only and idempotent. It pulls the last N sent messages, filters out auto-replies, calendar invites, and short messages (< min-words), then extracts:

- Sentence length distribution (median, p25, p75)
- Opener capitalization habit (lowercase vs sentence case ratio)
- Punctuation tics (em-dash count, ellipsis count, exclamation count, semicolon count)
- Recurring phrases (top 10 bigrams and trigrams not in a stopword list)
- Sign-off style (the line above the signature)
- Three representative excerpts (recipient names redacted to `<recipient>`)

Write the extracted profile into the sales-pack's `## Voice` section as a structured block (template below), plus the three excerpts as quoted blocks.

**Option B: Paste samples manually.** Ask question 20: "Show me 2 to 3 examples of writing you're proud of. (A tweet, a blog post, an email you sent that landed.) Link or paste them." Use them as voice samples in the `## Voice` section.

**Option C: Use defaults.** Skip questions 20 to 23. Mark `voice_source: defaults` in the sales-pack frontmatter (a comment near the top) so downstream skills know to be conservative. Use this generic profile: concise, direct, lowercase casual, no corporate jargon, no em dashes, no exclamation points.

**Then ask (regardless of path):**

21. **How would your closest friend describe how you talk?** (Dry, intense, warm, blunt, geeky, wry.)
22. **What words or phrases do you never use?** ("Synergy", "leverage", "circle back". Get the hit list.)
23. **Email or DM signature you want at the end of every message.**

### Section 7: The one thing (3 questions)

24. **If a prospect remembers exactly one thing from your outreach, what should it be?**
25. **CTA for a HIGH-signal first touch** (e.g. they just complained about your problem, just raised, asked support a buying question). What do you ask them to do? (Direct call? Live demo? Free trial signup?)
26. **CTA for a LOW-signal first touch** (e.g. they just match your persona, nothing specific happened). What do you ask? (Hint: not a meeting. Usually a piece of content or a low-commitment ask.)

Both matter. Sending a Touch 1 meeting ask to a low-signal prospect is the fastest path to a 0% reply rate.

## Skill workflow

### Step 0: Check for an existing sales-pack

```bash
if [ -f sales-pack.md ]; then
  cat sales-pack.md | head -3
fi
```

If one exists, ask the founder whether they want to **append/update** specific sections (skip questions in sections they're not updating) or **fully redo** it.

### Step 1: Pick mode

Ask the founder: full vs lightning mode. Default recommendation: full.

In lightning mode, ask only these questions: 1, 2, 3, 5, 7, 9, 10, 14, 17, 25. Ten questions, ~7 minutes.

### Step 2: Run the interview

One question at a time. After each answer:
- Reflect what you heard back in one sentence ("So your sharpest customer is X because of Y, got it.").
- If the answer was vague, ask one targeted follow-up before moving on.
- If the founder gives a long story, extract the 2 to 3 key facts and confirm before moving on.

Never show the full question list. Never batch.

### Step 3: Draft the file

Once all questions are answered, write `sales-pack.md` using the template below. Quote the founder's exact phrasing in the "How I talk" and "Value props" sections, those are the highest-leverage parts for personalized outreach.

### Step 4: Review with the founder

Show them the draft. Ask:

```
Question: "How does this read?"
Options:
- Ship it (saves the file as-is)
- One section needs more depth (loops back to that section)
- The voice section is off (re-runs section 6)
- Start over (rare — only if positioning fundamentally shifted)
```

### Step 5: Save and confirm

Save to `sales-pack.md`. Add a top-of-file note:

```markdown
> Built with /gtm-sales-pack on YYYY-MM-DD. Re-run /gtm-sales-pack to update.
> Update notes from /gtm-get-better will append at the bottom.
```

Tell the founder which skill to run next (usually `gtm-find-prospects` or their first channel skill).

## Output template

Use this exact section structure. Other skills parse against the H2 (`##`) headings.

```markdown
# Sales pack — {{Company Name}}

> Built with /gtm-sales-pack on YYYY-MM-DD. Re-run /gtm-sales-pack to update.

## One-liner

{{Founder's one-sentence description, verbatim}}

## Company

- **Stage:** {{stage}}
- **Team size:** {{size}}
- **Current customers:** {{3 named}}
- **Problem we solve that wasn't being solved:** {{founder's words}}

## ICP

- **Best customer profile:** {{verbatim description of best customer + why}}
- **Common attributes of buyers:** {{stage, team size, tech stack, buyer role, pain trigger}}
- **Disqualifiers (who NOT to sell to):** {{founder's words}}
- **Buying signals to watch for:** {{list — these become inputs to gtm-find-prospects}}

## Personas

For each persona (up to 3):

### Persona: {{Title}}

- **Buying power:** {{yes / influencer-only}}
- **Top 3 outcomes they want:** {{list, framed as outcomes not features}}
- **Sharpest hook for this persona:** {{one sentence}}

## Value props and proof points

- **Wedge (one-liner we can claim that nobody else can):** {{founder's words}}
- **Top 3 outcomes overall:** {{list}}
- **Proof points (with permission tier):**
  - {{Customer name}} — {{specific metric}} — {{public / private / NDA}}

## Anti-pitch (what we're NOT)

{{founder's words — sharpens positioning}}

## Objections

| Objection (in prospect's words) | One-line response |
|---|---|
| {{...}} | {{...}} |

**Open objection (no great answer yet):** {{the scary one — flag this when it comes up in outreach so we handle honestly}}

## Channels and prior outbound

- **What we've tried:** {{summary}}
- **What replied:** {{patterns}}
- **What didn't:** {{patterns}}
- **Where best customers actually hang out:** {{specific communities / podcasts / subreddits / X circles}}
- **Unfair distribution advantage:** {{honest answer — leave blank if none}}

## Voice, how I talk

- **Source:** {{gmail | manual | defaults}}  <!-- set by Section 6 path picker -->
- **Self-description:** {{dry / intense / warm / blunt / geeky / wry / etc.}}
- **Words and phrases I never use:** {{hit list}}

### Extracted voice profile (Option A only, written by extract-voice-from-gmail.py)

```
sample_count: {{N}}
sentence_length: median {{X}} words, p25 {{Y}}, p75 {{Z}}
opener_capitalization: lowercase {{A}}% / sentence_case {{B}}%
punctuation_tics: em_dash {{N}}, ellipsis {{N}}, exclamation {{N}}, semicolon {{N}}
recurring_phrases:
  - "{{phrase 1}}" ({{count}})
  - "{{phrase 2}}" ({{count}})
  - "{{phrase 3}}" ({{count}})
sign_off_pattern: "{{most common sign-off line}}"
```

- **Voice samples (Option A pulls 3 from Gmail, recipients redacted; Option B pastes 2 to 3 manually):**
  > {{sample 1}}

  > {{sample 2}}

  > {{sample 3}}
- **Signature for outbound:** {{exact signature block}}

## The one thing

- **What should every prospect remember:** {{single sentence}}
- **CTA for high-signal first touch:** {{verbatim, single sentence}}
- **CTA for low-signal first touch:** {{verbatim, single sentence — usually content, not a meeting}}

## Features by buyer need

Map each feature you'd mention to the buyer need it satisfies. When a prospect's signal indicates a specific need (cost control, security review, hiring scale, velocity), the channel skills will pull from the matching row.

| Buyer need | What we mention | Proof / customer (with permission tier) |
|---|---|---|
| Cost control | {{features}} | {{customer + metric}} |
| Security / compliance | {{features}} | {{customer + metric}} |
| Visibility / analytics | {{features}} | {{customer + metric}} |
| Velocity / productivity | {{features}} | {{customer + metric}} |
| Onboarding / rollout | {{features}} | {{customer + metric}} |

## Signal strength cheat sheet

Your buying signals from § ICP, ranked by strength. The gtm-cold-email and gtm-design-play skills read this to match the right CTA to the right signal.

| Signal | Strength | Detection method | Default Touch 1 CTA |
|---|---|---|---|
| {{e.g. SSO support request}} | High | Support tickets matching keywords | "Want me to set up a trial?" |
| {{e.g. Recent fundraise}} | Medium | TechCrunch RSS + LinkedIn check | "Happy to send a playbook" |
| {{e.g. Matches persona only}} | Low | Title + company match | "Thought you'd find this useful" — content only |

## Update log

<!-- gtm-get-better will append timestamped notes here -->
```

## Quality bar before you save

Before writing the file, sanity check:

- [ ] No buzzwords sneaked into the founder's value props (no "revolutionary", "game-changing")
- [ ] Every proof point has a real customer name + a real number + a permission level
- [ ] The voice section has at least one paste of the founder's actual writing (not just adjectives)
- [ ] The CTA section names exactly one CTA, not a menu
- [ ] The ICP section is specific enough that `gtm-find-prospects` could turn it into a query

If any of those fail, ask one more clarifying question before saving.

## Notes for downstream skills

Other skills read `sales-pack.md` like this:
- `gtm-find-prospects` parses the `## ICP` and `## Personas` sections to build target criteria.
- `gtm-x-outreach`, `gtm-linkedin-outreach`, `gtm-cold-email` parse `## Value props`, `## Personas`, `## Voice`, and `## The one thing` to draft messages.
- `gtm-get-better` appends notes to the `## Update log` section based on observed reply patterns.

Keep this contract stable. If you add new sections, add them after `## The one thing` and before `## Update log`.$q$,
    $q${}$q$::jsonb,
    6
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$skill$q$,
    $q$gtm-setup$q$,
    $q$gtm-setup$q$,
    $q$First-run orchestrator for the founder-gtm plugin. Walks an early-stage founder through plugin setup in the right order, gtm-sales-pack first, then the channels they want to use (X DMs, LinkedIn via Lemlist, cold email via Gmail), then the targeting and learning skills. Use when a founder first installs founder-gtm, types /gtm-setup, asks how to start, asks what to do next, or seems lost about which skill to run first.$q$,
    $q$# GTM Setup, first-run orchestrator

You are walking a brand new early-stage founder through setup of the `founder-gtm` plugin. They probably installed it 5 minutes ago. Be concise, opinionated, and ask one decision at a time.

## Why this skill exists

The plugin has 6 other skills and they have a real dependency order. If a founder runs `gtm-x-outreach` before `gtm-sales-pack`, the messages will be generic and the campaign will fail. Walking them through the right sequence is the difference between this plugin working and not.

## Setup order (this is the canonical sequence)

```
1. gtm-sales-pack       ← always first, no exceptions
2. gtm-find-prospects   ← optional but recommended; sets up data sources for targeting
3. Pick channel(s): gtm-x-outreach, gtm-linkedin-outreach, gtm-cold-email
4. Run first campaign on one channel
5. gtm-get-better       ← after first campaign has had ~1 week to collect replies
6. gtm-design-play      ← when ready to systematize what worked into named, repeatable motions
7. (optional) install the automations under automations/ so /gtm-get-better and reply-checks run on their own
```

## Workflow

### Step 1: Check whether sales-pack exists

Before doing anything else, check whether `sales-pack.md` exists in the founder's current project root (or wherever they keep their GTM state).

```bash
ls sales-pack.md 2>/dev/null && echo "EXISTS" || echo "MISSING"
```

- **If MISSING** → Tell the founder: "Before any outreach, we need 20 minutes to build your sales pack. This is a knowledge base every other skill in the plugin reads from. Without it, your messages will be generic. Running it now." Then invoke the `gtm-sales-pack` skill.
- **If EXISTS** → Skim it briefly to confirm it has the required sections (company, ICP, value props, objections, voice). If any are missing or feel thin, ask the founder if they want to re-run `gtm-sales-pack` to fill the gaps. Otherwise move on.

### Step 2: Ask which channels the founder wants to run

Use the AskQuestion tool. Multi-select.

```
Question: "Which outbound channels do you want to set up? (Pick all that apply — you can always add more later.)"
Options:
- X DMs (uses the xmcp MCP server; great for tech founders with active X presence)
- LinkedIn connection requests (uses Lemlist; cheapest and highest-volume LinkedIn path)
- Cold email (uses Gmail via Google Workspace CLI; safest for established domains)
```

### Step 3: For each chosen channel, run its setup section

Each channel has its own setup checklist below. Walk through them **one at a time**, not all at once. Finish channel 1 before starting channel 2.

After each channel's setup is complete, ask the founder if they want to **run a small test campaign on that channel right now** (5 to 10 prospects) before setting up the next channel. The fastest way to learn is to actually send messages.

#### X DMs setup checklist

```
- [ ] Confirm xmcp is running:
      curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/mcp
      Expect 200/405/406. If connection refused, run ~/dev/xmcp/start.sh
      (first run opens a browser for OAuth1 consent — founder must approve once).
- [ ] Confirm Cursor's MCP settings show `x-api` as connected.
      If offline, toggle off/on in Settings → MCP.
- [ ] Note that X API DM sends are pay-per-call beyond the free tier.
      Recommend the founder check https://console.x.com for their current plan + remaining credits.
- [ ] Optional: install the `xdk` Python SDK for programmatic batch sends.
```

If xmcp is not installed at all, tell the founder honestly: "The X channel needs the local xmcp MCP server set up first. That's a one-time install, see https://github.com/xdevplatform/xmcp. Want me to walk you through it, or skip X for now and set up another channel?"

#### LinkedIn setup checklist

```
- [ ] Ask which LinkedIn tool the founder has or wants to use:
      • Lemlist (recommended — ~$59/mo, best LinkedIn+email combo, our default)
      • Amplemarket (more expensive but powerful if they already have it)
      • La Growth Machine (alternative)
      • Manual copy-paste (free, scales to ~50 connects/week)
- [ ] If Lemlist:
      • Founder creates account at https://app.lemlist.com (free trial available)
      • Generates API key at Settings → Integrations → API
      • Stores in ${CURSOR_PLUGIN_ROOT}/.env as LEMLIST_API_KEY=...
      • Connects their LinkedIn account inside Lemlist (uses cookie-based session)
- [ ] If Amplemarket or LGM: similar pattern; the gtm-linkedin-outreach skill walks them through.
- [ ] If Manual: nothing to install; skill will generate copy-paste-ready connect notes.
- [ ] LinkedIn connection request limit: 100–200/week before LinkedIn flags the account.
      Set a daily cap in the skill config (default 20/day).
```

#### Cold email setup checklist

```
- [ ] Confirm Google Workspace account (Gmail must be a Workspace account, not personal gmail.com — Workspace gives you the API + better deliverability).
- [ ] Install gcloud CLI if missing:
      brew install --cask google-cloud-sdk
- [ ] Authenticate:
      gcloud auth login
      gcloud auth application-default login
- [ ] Enable the Gmail API on a GCP project:
      gcloud services enable gmail.googleapis.com
- [ ] Create an OAuth client + grant Gmail send/draft scopes:
      The gtm-cold-email skill walks through this; output is a token file
      stored at ${CURSOR_PLUGIN_ROOT}/.gtm-state/gmail-token.json (gitignored).
- [ ] Domain warming check:
      Ask the founder: "Has this sending domain sent >50 cold emails before?"
      • Yes → safe to start at 25/day cap.
      • No → strongly recommend warming the domain for 2+ weeks first.
        Recommend: Instantly (~$37/mo) or Mailwarm (~$69/mo) or free option:
        Smartlead's free warmup tier (https://www.smartlead.ai).
      If founder skips warming, lower the daily cap to 5/day for the first 2 weeks.
- [ ] Pick send mode for first campaign:
      • Drafts only (founder reviews each, clicks send manually) — safest for first run.
      • Programmatic send with hard daily cap (default 25/day, configurable).
```

### Step 4: Recommend setting up gtm-find-prospects next

Once at least one channel is configured, suggest running `gtm-find-prospects` to build the first target list. Don't force it, some founders already have a target list from another source (a spreadsheet, an export from a tool, a list of accelerator batchmates). Ask:

```
Question: "Do you already have a list of people you want to reach out to, or do you want me to help build one?"
Options:
- I have a list (CSV, spreadsheet, or names I'll paste in)
- Build one with me (run gtm-find-prospects)
- Skip targeting; I'll just message a few people I already know
```

### Step 5: Run the first campaign

For whichever channel the founder picked first, hand off to that channel's skill (`gtm-x-outreach`, `gtm-linkedin-outreach`, or `gtm-cold-email`) with the prospect list. Walk them through their **first 5 messages personally**, don't auto-batch yet. The point of the first 5 is for the founder to feel the quality bar and adjust the sales pack or voice before scaling.

### Step 6: Schedule the gtm-get-better loop

After the first campaign goes out, tell the founder:

> "Come back in 7 days and run `/gtm-get-better`. It'll read your responses, score what worked, and update your sales-pack and per-channel playbooks. The plugin gets sharper every cycle, that's the whole point of running it from Cursor instead of a fixed SaaS tool."

Optionally, offer to install the three Cursor Automations shipped at `automations/`:

- `weekly-get-better.workflow.json`, Mondays at 7am PT, runs the learning loop.
- `daily-followups.workflow.json`, weekdays at 9am PT, checks for replies and advances the cold-email queue.
- `post-campaign-debrief.workflow.json`, manual trigger; campaign-scoped learning report.

The easy install path: ask the agent to "install the founder-gtm automations from the installed Founder GTM plugin's `automations/` folder", it uses the `cursor-app-control` MCP's `open_automation` tool to prefill each one. See `automations/AUTOMATIONS.md` for details.

## Founder-friendly summary at the end

When setup is complete, give the founder a single concise summary:

```
Setup complete. Here's your stack:

📋 Sales pack:    sales-pack.md (re-run `/gtm-sales-pack` anytime to update)
🎯 Targeting:     [tools the founder connected]
📡 Channels live: [list]
🔁 Next:          Run /gtm-x-outreach, /gtm-linkedin-outreach, or /gtm-cold-email with a target list
📈 Weekly:        Run /gtm-get-better to compound learnings
```

## Common stumbling blocks

- **Founder skips gtm-sales-pack**, refuse, gently. Explain that without it every other skill produces generic AI slop. Offer to do a 10-minute lightning version if they're impatient (the gtm-sales-pack skill has a quick mode).
- **Founder wants to send to 500 people on day 1**, talk them down. Cap first campaign at 25 to 50. The first batch is for calibration, not volume.
- **Founder has no domain warmed for cold email**, never let them blast a cold domain at 25/day on day 1. Drop the cap to 5/day or push them to warm first.
- **Founder hates the drafts the AI produces**, that's diagnostic of a thin sales pack or unclear voice. Run `gtm-sales-pack` again with focus on the "voice" and "how I talk about the product" sections.

## Output style

Be concise. Use checklists. Use the founder's first name once you know it. Treat this like onboarding a friend, not running a script, pause for questions, adapt to what they say.$q$,
    $q${}$q$::jsonb,
    7
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$skill$q$,
    $q$gtm-warm-intro$q$,
    $q$gtm-warm-intro$q$,
    $q$Run warm-intro outreach for an early-stage founder. Reads the founder's LinkedIn connections CSV export, cross-references against a prospects/*.csv from gtm-find-prospects, finds 1st-degree bridges at each prospect's company, ranks intro candidates by connection strength and recency, drafts a request message to the bridge person plus a forwardable blurb the bridge can paste verbatim, and either sends via Gmail (if email path) or generates copy-paste markdown (for Slack or other channels). Warm intros convert at 5 to 10x cold. Use when the founder wants to leverage their network, mentions warm intros or referrals, runs /gtm-warm-intro, or after gtm-find-prospects has produced a target list.$q$,
    $q$# Warm Intro, the highest-leverage outbound channel

Warm intros convert at 5 to 10x the rate of cold outreach. The single highest-leverage move in early-stage outbound is asking a mutual connection for an intro, and giving that connection a forwardable blurb so they have zero work to do.

This skill turns the founder's existing LinkedIn network into an intro pipeline.

## Why this exists

Cold email and DM are mass channels. Warm intros are surgical. A founder typically has 200 to 2000 LinkedIn 1st-degree connections, and any of them might bridge to a target prospect. The bottleneck is knowing **who** to ask, **how** to ask, and giving them a paragraph they can paste straight into a forward.

Most founders skip warm intros because the manual work is painful: matching prospects to connections, drafting a request that respects the bridge's time, writing a forwardable blurb. This skill does all of that.

## Prerequisites

```bash
test -f sales-pack.md || echo "MISSING sales-pack.md"
ls prospects/*.csv 2>/dev/null | head -1 || echo "MISSING prospects CSV (run /gtm-find-prospects first)"
test -f ${CURSOR_PLUGIN_ROOT}/.gtm-state/linkedin-connections.csv || echo "MISSING LinkedIn connections export"
```

Refuse to draft without `sales-pack.md` and a prospect list.

## Step 0: Get the LinkedIn connections export (one-time)

LinkedIn lets the founder export their full 1st-degree connection list with one click. Walk them through it:

```
1. LinkedIn.com → Me (top-right avatar) → Settings & Privacy
2. Data Privacy (left sidebar) → "Get a copy of your data"
3. Pick "Want something in particular?" → check "Connections" only (not the full archive, which takes 24 hours)
4. Request archive. LinkedIn emails a download link in about 10 minutes for connections-only.
5. Download the zip, unzip, find Connections.csv inside.
6. Move it to ${CURSOR_PLUGIN_ROOT}/.gtm-state/linkedin-connections.csv
```

The CSV columns LinkedIn provides: `First Name, Last Name, URL, Email Address, Company, Position, Connected On`.

If the founder already exported once, the file is reusable until they want to refresh (LinkedIn allows the export anytime).

## Workflow

### Step 1: Load the prospect list

```
Question: "Which prospect list are we running warm intros on?"
Options:
- Auto-detect (most recent prospects/*.csv)
- {{list discovered CSVs}}
- Paste a list of company + person rows inline
```

Load the CSV. Required columns for matching: `company` (always). Helpful columns: `full_name`, `linkedin_url`, `role`.

### Step 2: Match each prospect to bridge candidates

For each prospect row:

1. Normalize the prospect's `company` (lowercase, strip "Inc"/"LLC"/"Ltd", collapse whitespace).
2. Scan the LinkedIn connections CSV. A bridge candidate is a 1st-degree connection whose `Company` normalizes to the same value.
3. Collect all bridge candidates per prospect. A prospect with 0 bridges is dropped from this run (suggest cold channels for that one instead).

Output a tally to the founder:

```
Found bridges for 14 of 47 prospects:
  • 6 prospects with exactly 1 bridge
  • 5 prospects with 2 to 3 bridges
  • 3 prospects with 4+ bridges (pick the strongest)
```

The 33 prospects with no bridge stay on the prospect list for cold outreach via the other channel skills.

### Step 3: Rank bridge candidates per prospect

For each (prospect, bridge_candidate) pair, score the bridge:

| Factor | Weight | How to score |
|---|---|---|
| Recency of last interaction | 35 | Read from Gmail if available: search sent + received for the bridge's email, score by days since last message (≤30 = 35, ≤90 = 22, ≤365 = 12, older = 4). If no Gmail, ask the founder per bridge: "When did you last talk to {{bridge name}}?" |
| Connection strength | 30 | Heuristic: count mutual LinkedIn engagements (likes, comments) if the founder can paste a few examples. If unknown, default to 18 for "in the same circle" and 30 for "I would call them a friend" (ask the founder for the top 3 only). |
| Shared school or company | 20 | If the CSV `Position` history shows overlap with the founder's background (founder provides), or the bridge's `Company` was a prior employer of the founder. Use 20 for overlap, 0 otherwise. |
| Tenure at target company | 15 | Bridges who have been at the target company longer (look at "Connected On" as a weak proxy if no other data) score higher. Default 8. |

Pick the **highest-scoring bridge** per prospect. Tie-break by most recent interaction.

### Step 4: Pick the channel for the bridge ask

Ask the founder once per bridge (or once globally if a clear preference exists):

```
Question: "How will you reach {{bridge name}}?"
Options:
- Email (drafts via Gmail, sent via gmail-token.json if the founder has cold-email set up)
- Slack DM (generate copy-paste markdown)
- iMessage / WhatsApp / signal (generate copy-paste text)
- LinkedIn DM (generate copy-paste text)
- Skip this bridge
```

Persist per-bridge channel choices to `.gtm-state/warm-intro-channel-prefs.json` (keyed by the bridge's LinkedIn URL) so re-runs do not re-ask.

### Step 5: Draft the intro-request message to the bridge

Apply `gtm-voice-guide`. Constraints:

- Short: 4 to 6 sentences for email; 2 to 3 sentences for Slack/iMessage.
- Make the ask explicit: "would you be open to introducing me to {{prospect_name}} at {{company}}?"
- Acknowledge their time: offer the forwardable blurb so the bridge does no writing.
- Give them an easy out: "totally fine if not a fit or you do not know them well."

**Email format (4 to 6 sentences):**

```
Subject: quick ask, intro to {{prospect first name}} at {{company}}?

Hey {{bridge first name}},

{{One-sentence personal touch, reference last interaction or recent thing they did, do not fake it if there isn't one}}.

I am trying to get in front of {{prospect_name}} at {{company}}. {{One sentence on why now: signal, fit, etc.}}.

Any chance you would be open to an intro? I have written a forwardable blurb below so you would not have to write anything, just paste and send.

Either way, no pressure if it is not a fit or you do not know them well.

{{founder signature from sales-pack.md}}

---
Forwardable blurb (paste into a fresh email to {{prospect_name}}):

{{blurb, see Step 6}}
```

**Slack-style format (2 to 3 sentences):**

```
hey {{bridge first name}}, random ask: do you know {{prospect_name}} at {{company}} well enough to intro me? working on {{one phrase from sales-pack one-liner}} and they look like an exact fit. happy to send you a paragraph you can just paste, no writing needed on your end. total no worries if it is awkward.
```

### Step 6: Write the forwardable blurb

This is the high-leverage move. The bridge should be able to copy the blurb into a fresh email to the prospect and hit send with no edits.

Template (3 to 4 sentences):

```
{{prospect first name}}, meet {{founder first name}}, founder of {{company}}. {{One sentence on what the company does, lifted verbatim from sales-pack.md § One-liner}}. {{One sentence on the specific reason they should care: the signal from the prospect row, or the persona-fit reason}}. {{founder first name}} can take it from here, leaving you two to it.
```

Quality bar before saving:

- Reads like the bridge wrote it (warm, casual).
- Says exactly what the company does in one sentence (no "AI-powered platform that...").
- Mentions one concrete reason the prospect should care, not generic.
- Ends with the polite "leaving you two to it" or similar handoff phrase.

### Step 7: Show drafts and approve per bridge

Per bridge, display:

- Bridge name, current role + company, last interaction (if known), score
- Target prospect, the signal, why this bridge for this prospect
- The intro-request message (channel-formatted)
- The forwardable blurb

Ask:

```
Question: "Send this intro request to {{bridge_name}}?"
Options:
- Send (Gmail) or copy-paste-ready (other channels)
- Edit the request, then send
- Edit the blurb, then send
- Skip this bridge, try the next-best one for the same prospect
- Skip this prospect entirely
```

### Step 8: Send or hand off

**Email path:** if the founder has run `/gtm-cold-email` setup (Gmail token at `${CURSOR_PLUGIN_ROOT}/.gtm-state/gmail-token.json`), send via the Gmail API using the existing token. Subject and body as drafted. No tracking pixels. Plain text.

**Other channels:** write `outreach-log/warm-intros-pending.md` with one section per pending intro, channel-formatted for copy-paste. Tell the founder to send and then re-run `/gtm-warm-intro --mark-sent` to log them.

### Step 9: Log to outreach-log/warm-intros.jsonl

For every intro request the founder sends (or marks sent), append one line:

```json
{
  "timestamp": "2026-05-27T17:30:00Z",
  "campaign": "{{campaign-name}}",
  "bridge": {
    "name": "Alex Rivera",
    "linkedin_url": "https://linkedin.com/in/alexrivera",
    "company": "Acme",
    "channel": "email"
  },
  "prospect": {
    "name": "Jane Doe",
    "company": "Acme",
    "role": "VP Engineering",
    "linkedin_url": "https://linkedin.com/in/janedoe"
  },
  "request_message": "the full request we sent",
  "forwardable_blurb": "the full blurb",
  "gmail_message_id": "186abc..."
}
```

`gtm-get-better` reads this file and credits warm-intro positives against the bridges who said yes (and the bridges who never replied), so the founder learns which bridges are real intro paths vs the polite-but-flaky ones.

## Output to the founder

```
Warm intro campaign: {{campaign-name}}

Prospects with bridges: {{14}} of {{47}}
Intro requests sent: {{N}}
Intro requests copy-paste-ready (Slack/iMessage/LinkedIn): {{M}}

Top 3 bridges by score:
1. Alex Rivera (Acme) → Jane Doe (VP Eng): last talked 12 days ago, mutual investor connection
2. ...

Reminder: warm intros convert 5 to 10x cold. Reply with whatever the bridge sends back (yes, no, "let me think") and run /gtm-warm-intro --mark-sent if you reached out via Slack or iMessage so the log stays in sync.

Run /gtm-get-better next week to see which bridges actually converted.
```

## Honest limitations

- **LinkedIn connection CSVs go stale.** Re-export every 60 to 90 days, or sooner if the founder has connected with many people recently.
- **Bridge ranking is a heuristic.** The founder usually knows their network better than a script. Always show the top 3 candidates per prospect and let them override.
- **Some bridges will ghost.** Track non-response in `warm-intros.jsonl`; bridges who never reply after 2 asks should be flagged as low-yield.
- **Do not abuse the same bridge.** Cap intro requests per bridge at 1 per quarter unless the bridge volunteers more. The skill enforces this by reading the log before drafting.
- **No personal-email matching.** LinkedIn's CSV only includes the email the bridge chose to share with you (often empty). Email sends require the bridge's email to be in the CSV or in the founder's Gmail history.

## Companion skills

- `/gtm-find-prospects` produces the prospect list this skill consumes.
- `/gtm-cold-email` handles prospects who have no bridge.
- `/gtm-get-better` reads `outreach-log/warm-intros.jsonl` for compounding the learnings.$q$,
    $q${}$q$::jsonb,
    8
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$skill$q$,
    $q$gtm-x-outreach$q$,
    $q$gtm-x-outreach$q$,
    $q$Run personalized X (Twitter) DM outreach for an early-stage founder. Reads a prospects CSV produced by gtm-find-prospects, fetches each target's last 10 to 20 posts via the local xmcp MCP server, identifies a real hook in their recent thinking, drafts a personalized DM grounded in the founder's sales-pack.md, and either saves drafts for review or sends them with rate limiting. Use when the founder wants to run X DM outreach, says they want to message specific X users, runs /gtm-x-outreach, or has a prospect list with x_handle populated.$q$,
    $q$# X Outreach, personalized DMs at founder scale

You are running an X DM outreach campaign for an early-stage founder. Every DM must be grounded in something real the target recently said. Generic "saw your work, would love to chat" gets ignored.

## Prerequisites

Check all three before doing anything:

```bash
# 1. sales-pack.md exists
test -f sales-pack.md || echo "MISSING sales-pack.md"

# 2. xmcp MCP server is up
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/mcp
# Expect 200/405/406. If connection refused, run ~/dev/xmcp/start.sh and have the founder approve OAuth in browser.

# 3. The x-api skill at ~/.cursor/skills/x-api/SKILL.md is loaded (it has the xmcp tool reference)
```

If any prereq fails, fix it before proceeding. Refuse to draft messages without `sales-pack.md`.

**Read `~/.cursor/skills/x-api/SKILL.md`** for the xmcp tool naming convention and the `body`-wrapping pattern. This is the most common source of 400 errors.

## Workflow

### Step 1: Load inputs

```
Question: "Which prospect list are we running?"
Options:
- Auto-detect (use the most recent prospects/*.csv)
- {{list discovered CSVs}}
- Paste a list inline (founder will paste names + handles)
```

Filter the loaded CSV to rows where `x_handle` is non-empty AND (`recommended_channel` is `x` OR `multi`).

Show the founder the filtered count and ask:

```
Question: "Found {{N}} X-reachable prospects. Run on all of them, top 5, or pick manually?"
Options:
- Top 5 (calibration — recommended for first campaign)
- Top 20
- All {{N}}
- Pick manually (I'll show you the list)
```

### Step 2: Pick send mode

```
Question: "How do you want to handle sending?"
Options:
- Drafts only — I'll show each draft, you approve/send manually via X
- Send with my approval — I'll draft, ask for explicit "send" per message
- Auto-send with rate limit — drafts and sends with delay between messages (recommended cap: 10/day for new accounts, up to 50/day for warmed)
```

For first-time use, default-recommend "Drafts only" or "Send with my approval". Auto-send only after the founder has shipped 2 to 3 campaigns and is confident in quality.

### Step 3: For each prospect, research

Per prospect, in order of `score` descending:

1. **Resolve user ID.** Call xmcp `getUsersByUsername` with `{"username": "<handle without @>"}`. If 404, mark the row as "handle invalid" and skip.

2. **Pull recent timeline.** Call xmcp `getUsersIdTweets` (the user timeline tool) with `{"id": "<user_id>", "max_results": 20, "tweet.fields": "created_at,public_metrics,referenced_tweets"}`. Take the last 10 to 20 posts.

   Fallback if the tool name differs in this xmcp version: use `searchPostsRecent` with `{"query": "from:<handle>", "max_results": 20}`.

3. **Find the hook.** Scan the posts and pick exactly one to reference. Prefer in this order:
   - A post where they articulate a problem your product solves.
   - A post where they share an opinion you genuinely engage with.
   - A post about a recent ship/launch/hire/raise relevant to them.
   - A thread on a topic in your sales-pack's domain.

   Reject as hooks: posts older than 30 days (stale), retweets without comment, replies to others (out of context), engagement-bait threads, anything political/personal unless directly relevant.

   If no good hook exists, mark the prospect as "no recent hook" and downgrade to LinkedIn or email instead, do not send a generic DM.

### Step 4: Draft the DM

Apply the `gtm-voice-guide` rule (it's always-applied while this plugin is active). Specifically:

- **Length:** ≤500 characters. Tighter is better. The X DM input box is small.
- **Open with the hook**, not yourself.
- **One CTA**, phrased as a question, on its own line at the end.
- **Voice match**: use the founder's voice samples from `sales-pack.md` § "Voice, how I talk".

Use this structure:

```
{{Hook line — reacts to the specific post or thread}}

{{One sentence connecting their thinking to what your product does or who you serve. Do NOT pitch the product in detail.}}

{{CTA — single question. Often: "would a quick chat make sense?" or "want me to send you a Loom?" or "would it be useful to swap notes?"}}
```

Reference the post the hook is from at the end if natural ("the thread on X"). Don't paste URLs.

### Step 5: Show the draft

Display the draft alongside:

- Target name + handle + score
- The specific post the hook references (so the founder can validate it's a real reference)
- Sales pack value prop being implied (so they can sanity-check fit)
- Character count

Ask the founder:

```
Question: "Send this one?"
Options:
- Send
- Edit, then send (founder gives revised text)
- Skip — bad fit
- Skip — bad hook, find a different post for this person
- Abort campaign (stop the loop)
```

### Step 6: Send via xmcp (if approved)

Call xmcp `createDirectMessagesByParticipantId` with the `body`-wrapping convention:

```json
{
  "participant_id": "<user_id>",
  "body": {
    "text": "<the message>"
  }
}
```

**Common errors:**
- 400 `$.text: is missing` → you forgot to wrap under `body`. See the x-api skill.
- 403 → the recipient doesn't accept DMs from non-followers, or your account doesn't have DM permission. Mark the row and skip; suggest LinkedIn for this prospect instead.
- 429 → rate-limited. Pause; resume after the reset window.

### Step 7: Log the send

Append to `outreach-log/x-dms.jsonl` (one line per send):

```json
{
  "timestamp": "2026-05-27T17:30:00Z",
  "campaign": "{{campaign-name}}",
  "prospect": {
    "name": "Jane Doe",
    "handle": "@janedoe",
    "user_id": "1234567890",
    "company": "Acme",
    "score": 85
  },
  "hook_post_id": "1700000000000000000",
  "hook_post_excerpt": "first 140 chars of the post we referenced",
  "message": "the full message we sent",
  "char_count": 312,
  "send_status": "sent",
  "send_response_id": "DM ID returned by xmcp",
  "founder_action": "send"
}
```

The `gtm-get-better` skill reads this log to learn what hooks work.

### Step 8: Rate limit + follow-up scheduling

- Default delay between sends: 30 to 90 seconds (randomized). Helps avoid spam-flag heuristics.
- Default daily cap: 10 DMs/day for accounts with <1000 followers, 25/day for >1000, 50/day for >10k.
- Schedule follow-ups: after 4 days with no reply, queue a Touch 2. After 8 days, Touch 3. After 14, breakup. The `gtm-get-better` skill or a Cursor Automation can drive these.

Tell the founder: "Follow-ups are queued in `outreach-log/x-followups-pending.jsonl`. Re-run `/gtm-x-outreach --followups` to send the next round."

## What X DMs are great for and bad for

**Great for:**
- Tech founders with an active X presence (matching peers DM each other naturally on X).
- Devtools, AI, infra, design tools companies whose buyer persona lives on X.
- Hot-take or recent-event-driven outreach where speed matters.
- People who explicitly say "DMs open" or have a Calendly in their bio.

**Bad for:**
- B2B enterprise buyers (most don't check X DMs).
- People who don't follow you (your DM may go to the "Requests" inbox and get missed).
- Anything that requires formal tone or written depth, use email instead.

If the founder's ICP is mostly enterprise procurement, gently push them toward cold email or LinkedIn instead.

## Honest limitations

- **You pay per DM beyond the X API free tier.** Check `console.x.com` for current pricing. As of recent pricing, expect ~$200/mo for Basic tier with thousands of DMs.
- **xmcp holds OAuth1 in memory only.** Restart = re-consent. Don't restart mid-campaign.
- **One X account per xmcp process.** Sending from a different account requires editing `~/dev/xmcp/.env` and restarting.
- **X aggressively suppresses spam-pattern accounts.** Even with good messages, a brand-new low-follower account doing 50 DMs/day will get rate-limited or shadow-banned. Warm the account by posting and replying genuinely for 2 to 4 weeks before bulk DMing.

## Output to the founder after the run

```
X DM campaign: {{campaign-name}}
Sent: {{N}} | Drafts saved: {{M}} | Skipped: {{X}}

Top 3 hooks used (founder can study these):
1. Jane Doe — referenced her post on AI evals: "evals are the new unit tests"
2. ...

Follow-up Touch 2 queued for {{date}} ({{N}} prospects).
Replies will arrive in your X DMs inbox. Run /gtm-get-better in 7 days.
```$q$,
    $q${}$q$::jsonb,
    9
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$rule$q$,
    $q$Voice and anti-slop guide for any outbound message drafted via the founder-gtm plugin (cold emails, X DMs, LinkedIn notes, follow-ups). Always applied while founder-gtm skills are active.$q$,
    $q$gtm-voice-guide$q$,
    $q$Voice and anti-slop guide for any outbound message drafted via the founder-gtm plugin (cold emails, X DMs, LinkedIn notes, follow-ups). Always applied while founder-gtm skills are active.$q$,
    $q$# Founder-GTM Voice Guide

You are drafting outbound for an early-stage founder. The single most important thing: **the recipient must believe a human wrote this, specifically for them**. Generic AI outbound is the noise we are trying to break through.

## The three differentiators

Every outbound message must do at least one of these, ideally all three, better than the median message in the recipient's inbox:

1. **Unique voice**, sounds like a specific human, not an AI or a sales playbook. Reads how the founder actually talks.
2. **Engaging hook**, references something specific and recent: a post they wrote, a feature they shipped, a podcast they were on, a hire they made. Never generic ("I saw your company is growing").
3. **Right timing**, the message arrives at a moment the prospect cares about (just shipped, just funded, just hired, just hit a pain point).

If none of these is true, do not send the message. Rewrite.

## Cardinal rules

1. **Short and direct.** 2 to 4 sentences for cold email; ≤250 chars for LinkedIn connect notes; ≤500 chars for X DMs.
2. **Lead with substance.** First sentence must do work, reference the signal, ask a real question, or share something specific. Never "I hope this finds you well."
3. **No hyperbole.** No "revolutionary", "game-changing", "world-class", "10x", "unlock". Let the facts speak.
4. **Prove it with specifics.** Use real numbers, real customer names (only ones the founder has permission to cite), real outcomes.
5. **Confident, not loud.** Avoid "I believe", "I think", "I just wanted to". State things directly.
6. **No em-dashes or semicolons in outbound copy.** Use periods or restructure.
7. **No emojis in outbound.** Ever.
8. **Warm but professional.** Write like a thoughtful peer reaching out, not a salesperson closing a quota.
9. **Exactly one clear CTA per message.** Phrased as a short question. On its own line at the end. Never "Would you like A, B, or C?"
10. **Reference the signal.** The recipient should immediately understand why they specifically are getting this message.
11. **Step 1 is never a list.** No bullets, no proof tables, no customer logos. That goes in Step 2 at the earliest. Step 1 is one human sentence into one CTA.
12. **One CTA, with one exception.** The breakup (Touch 4) may use the "no vs not now?" three-question form. Every other touch is one CTA.

## Mechanics

These are micro-rules that catch the AI tells reviewers learn to spot:

- Oxford comma on lists of three or more.
- Numerals for metrics ("45%", "12 engineers"), not spelled out.
- Subject lines in sentence case, not Title Case.
- Exclamation points are rare. Cold outreach gets zero of them.
- Straight quotes ("like this"), not curly quotes.
- No em dashes or en dashes anywhere. If you find yourself reaching for one, use a comma or start a new sentence.
- "Founders" not "founders, like yourself".

## Principles for any technical buyer

The recipient of your outbound is usually a smart, busy technical person. The principles that work for them work for every technical buyer:

- **First sentence delivers value or asks a real question. No warmup.** Skip "I hope this finds you well", "I work with teams like yours", "I'm reaching out because".
- **Replace adjectives with one number or one named example.** "Faster" is filler; "cuts review time from 4 days to 4 hours" is data.
- **State things directly. Drop "I believe" unless you actually are uncertain.** Hedging reads as fake humility.
- **Confident, not loud.** No caps lock. No multiple exclamation points. No "MUST READ".
- **High signal-to-noise.** Every sentence has to earn its place. If you can cut a sentence and the email still makes sense, cut it.
- **Show, don't tell.** If you say your product is fast, you've already lost. If you cite a benchmark, you might keep them.

## Opener patterns that work (study these)

- "Saw your post on {{specific_topic}}, {{one_sentence_of_genuine_reaction}}."
- "Caught your conversation with {{podcast_host}} about {{topic}}."
- "Congrats on the {{specific_milestone}}."
- "Noticed {{company}} just {{shipped_thing / hired_role / raised_round}}."
- "Read your {{essay_post_thread}} on {{specific_topic}}, {{the_one_part_that_landed}}."

## Opener patterns that kill the message

- "I hope this email finds you well."
- "I work with {{persona}} like yourself."
- "I'm reaching out because…"
- "I came across {{company}} and was impressed by…"
- "Quick question — " (only works if it actually is one)
- Anything that opens with "I" instead of "you" or a signal.

## Voice preservation

The founder has a voice. Read `sales-pack.md` for the section on "How I write" before drafting. If samples of their own writing are available (their tweets, their blog, prior emails they've sent), match cadence, sentence length, capitalization habits, and vocabulary. Do not flatten their voice into "generic founder tone".

If the founder uses lowercase, you use lowercase. If they swear, you swear. If they write 8-word sentences, you write 8-word sentences. The recipient should not be able to tell which messages were drafted by AI.

## Personalization tiers (use the highest available)

| Tier | What it looks like | When to use |
|---|---|---|
| **High** | References a specific thing the prospect said/did in the last 30 days | Default. Always try first. |
| **Medium** | References something specific about their company (recent hire, ship, raise, product) | When the prospect has no personal public footprint |
| **Low** | Persona-based; references the role they're in and a problem common to that role | Last resort. Flag to the founder that this is low-personalization and may underperform. |

Never send a Tier Low message without telling the founder it's Tier Low.

## Follow-up cadence

Most replies come from follow-ups, not first touches. The default sequence:

- **Touch 1 (Day 0):** the personalized opener. One CTA.
- **Touch 2 (Day 3 to 4):** different angle. Add value (a relevant link, a one-line insight, a small offer). New CTA, softer.
- **Touch 3 (Day 8 to 10):** a low-commitment alternative ("if a call is too much, would a 5-minute Loom be useful?").
- **Touch 4 (Day 14 to 21):** clean breakup. Acknowledge they're busy. Offer one final thing or ask for a referral. No guilt.

Never more than 4 touches. Never refer to prior touches in a guilt-trippy way ("I've reached out a few times…"). Save the acknowledgment of past attempts for the breakup only.

## Anti-AI tells (the humanizer pass)

Patterns from `blader/humanizer` on GitHub. Each is a tell that gives away an AI draft. Scan for these alongside the cardinal rules above.

- **Superficial -ing analyses.** "Highlighting", "underscoring", "reflecting", "showcasing" tacked on for fake depth. Cut the wrapper and state the thing directly.
- **Copula avoidance.** "Serves as", "stands as", "boasts", "features" used in place of "is" or "has". Just use "is" and "has".
- **False ranges.** "From X to Y" where X and Y aren't on a meaningful scale. Write a plain list instead.
- **Persuasive authority tropes.** "The real question is", "at its core", "what really matters", "fundamentally". Drop the wrapper and say the point.
- **Signposting and announcements.** "Let's dive in", "let's explore", "here's what you need to know", "now let's look at". Just start.
- **Hyphenated word pairs in predicate position.** "We are cross-functional", "this is data-driven", "the platform is end-to-end". Keep them as attributive adjectives only ("a cross-functional team").
- **Sycophantic openings.** "Great question!", "You're absolutely right!", "Of course!". Cut. Get to the answer.
- **Generic positive conclusions.** "The future looks bright", "exciting times lie ahead". Replace with a concrete next step or fact.
- **Filler phrases.** "In order to" becomes "to". "Due to the fact that" becomes "because". "At this point in time" becomes "now". "It is important to note that" is cut.
- **Excessive hedging.** "Could potentially possibly", "might have some effect". Pick one hedge or drop it.

## Anti-patterns to scan for before sending

- [ ] No em-dashes, no semicolons
- [ ] No emojis
- [ ] No "I hope this finds you well" or any variant
- [ ] No "I work with…" or "I help…" opening
- [ ] First sentence does substantive work (signal, question, or specific value)
- [ ] Exactly one CTA, phrased as a question, on its own line
- [ ] Specific numbers / names / signals, not vague claims
- [ ] Sounds like the founder, not like an AI
- [ ] Channel-appropriate length (X DM ≤500 chars, LinkedIn ≤250 chars, cold email ≤4 sentences)
- [ ] Step 1 has no bullets, no proof tables, no customer logos
- [ ] Exactly one CTA per touch (Touch 4 breakup may use three short questions if and only if they form a single decision)
- [ ] No em dashes anywhere (—) or en dashes (–)
- [ ] No emojis, no curly quotes
- [ ] Numerals for metrics, sentence case for subjects

If any of these fail, rewrite before sending.$q$,
    $q${"always_apply": true}$q$::jsonb,
    10
  );
  insert into public.plugin_components (
    plugin_id,
    type,
    name,
    slug,
    description,
    content,
    metadata,
    sort_order
  ) values (
    v_plugin_id,
    $q$hook$q$,
    $q$hooks$q$,
    $q$hooks-founder-gtm$q$,
    $q$Event hooks configuration$q$,
    $q${
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "command": "bash ${CURSOR_PLUGIN_ROOT}/hooks/welcome-on-first-session.sh",
        "timeout": 5
      }
    ],
    "afterFileEdit": [
      {
        "command": "bash ${CURSOR_PLUGIN_ROOT}/hooks/check-voice-on-edit.sh",
        "matcher": "Write|Edit",
        "timeout": 5
      }
    ]
  }
}$q$,
    $q${}$q$::jsonb,
    11
  );
end $$;
