---
description: Generate PR description from git diff
alwaysApply: false
---

# Generate PR Description Command

Analyze the git diff and create a **compact** PR description (target ~100–150 words).

Focus on the 'why' and 'what' rather than detailed code changes.

## Rules

- **Never mention commits** – devs can see them in PR anyway
- **Be compact** – short bullets, minimal prose, no bloat
- **DB changes are mandatory** – one-line summary of what changed
- **Env variables are mandatory** – list new vars or state "None"
- **Merge related content** – avoid separate sections for architecture, features, performance; fold into Active Changes
- **Include Testing** – when relevant (e.g. new batching, sync, integrations), add a brief Testing section with concrete checks

## Output Format

**CRITICAL**:

- Output ONLY the markdown PR description wrapped in a markdown code block (````markdown ... ````)
- No AI commentary, no tool execution details, no explanatory text
- Do NOT create any temporary files – output directly in chat
- The code block must include a **PR title as H1** (`# Title`) at the top, followed by the description
- The whole block should be copy-pasteable into GitHub/Azure DevOps (title in PR title field or as first line; description below)

## Sections (use only what's relevant, keep each section short)

1. **Title (H1)** – Short, conventional-style PR title (e.g. `fix(cron): add run logging and admin status card`)
2. **Summary** – 1–2 sentences on what the PR accomplishes
3. **Active Changes** – Bulleted list of what works now (features, fixes, improvements)
4. **Database Changes** – One-line summary; required if DB changed
5. **Environment Variables** – New vars or "None"; required if any env vars exist in the project
6. **Testing** – Optional; add when there are new behaviors to verify (e.g. adaptive batching, sync flows, UI)
7. **Technical Details** – Breaking changes, related issue

Omit: High-Level Architectural Changes, Key Features, Performance, Service Changes, Business Impact, Future/In Progress unless essential. Prefer folding those into Active Changes as bullets.
