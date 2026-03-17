---
description: Commit to git using conventional prefixes; staged only or recent changes
alwaysApply: false
---

# Commit Command

Commit using a **lowercase conventional prefix** and a short message. Prefer specificity over generic prefixes when the change is scoped.

## GitLens (preferred)

**Use the GitLens MCP tools** for git actions—faster and cleaner than terminal git.

- **Status:** `call_mcp_tool` → server `user-eamodio.gitlens-extension-GitKraken`, tool `git_status`, `directory` = repo path (e.g. workspace root).
- **Add/commit:** same server, tool `git_add_or_commit` with `action`: `"add"` or `"commit"`, `directory`, optional `files[]`, and `message` (required for commit).
- **Split/organize commits:** same server, tool `gitlens_commit_composer` with `directory` and optional `instructions` (e.g. conventional prefixes, split by purpose). Use when multiple logical commits are needed.

Always **split commits** where it makes sense (different purposes, different areas). Use `git_status` first, then either multiple `git_add_or_commit` calls (add specific files, commit, repeat) or `gitlens_commit_composer` with instructions.

## Terminal fallback

When GitLens is unavailable or for one-off commands, use terminal. **Use `;` to chain commands, not `&&`**.

- **Correct:** `cd "path-to-repo"; git status`
- **Wrong:** `cd "path-to-repo" && git status`

## Behavior

- **If something is staged** → commit only staged files (do not add more).
- **If nothing is staged** → stage recent changes (e.g. `git add -A` or what fits), then commit.

Keep messages short. Multiline is fine when it helps (e.g. body after first line); don’t overload.

## One commit vs several

- **Prefer multiple commits** when changes serve different purposes. Example: new component → one commit; edits to other components to match that component’s structure → separate commit(s).
- **One commit can be large** (many files) if everything in it serves the same purpose.
- **Many small edits** across files (e.g. one line or a few words/symbols each) can be a single commit when they’re the same kind of fix (e.g. typos, same lint fix, same constant rename). Use context: same purpose → one commit; mixed purposes → split.

## Prefix convention (lowercase)

Use one prefix per commit. Prefer the most specific that fits.

| Prefix      | Use for                                        |
| ----------- | ---------------------------------------------- |
| `fix:`      | Bug fixes, correcting behavior                 |
| `feat:`     | New feature or capability                      |
| `refactor:` | Code structure/flow change, no behavior change |
| `chore:`    | Tooling, config, deps, scripts, housekeeping   |
| `bump:`     | Version or dependency version bumps            |
| `docs:`     | README, comments, docs only                    |
| `style:`    | Formatting, whitespace, no logic change        |
| `test:`     | Tests only                                     |
| `perf:`     | Performance improvements                       |

## Avoid repeating "refactor"

When the change is a refactor, use a **more specific prefix** or **scope** when it fits:

- **By area:** `prisma:`, `api:`, `ui:`, `locale:`, `auth:`, `admin:`
- **By action:** `extract:`, `simplify:`, `reorder:`, `rename:`, `move:`, `split:`, `merge:`

Examples:

- `prisma: simplify message status query`
- `locale: add missing keys for admin messages`
- `api: extract message update into shared handler`
- `ui: simplify MessageDetailsModal state`

So: `refactor:` is fine for generic restructuring; for “refactor in X” or “refactor by doing Y”, use `prisma:`, `locale:`, `extract:`, etc.

## Examples

- `fix: prevent double submit on message status update`
- `feat: admin message status update API`
- `prisma: add index on Message.status`
- `chore: add commit convention to .cursor/commands`
- `bump: next to 14.1.0`

When you run this command: check `git status`, then create one or more commits (staged only or stage + commit) with messages that follow this convention. Split into multiple commits when the diff clearly serves different purposes.
