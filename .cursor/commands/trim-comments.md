---
description: Trim comments in the referenced file – keep only essential ones
alwaysApply: false
---

# Trim Comments

Inspect the **referenced file** (the file the user has @-mentioned or has open). Go through every comment and edit the file so that:

## Keep and format well

- **File header (top of file)**  
  Use a **JSDoc block with `@fileoverview`** (or `@file`) so IDEs show the description on hover when the file is imported or referenced (same as hovering on a function). One short paragraph: what the file does and why it matters. Example:
  `/** @fileoverview Product Sync. Syncs Shopify products/variants/collections to DB; used by search, cart, Typesense. */`

- **Critical config / constants**  
  When constants or config are important for correctness or safety (e.g. timeouts, batch sizes, “do not change without understanding”): keep a clear warning or explanation. Use a block with separators (e.g. `// ================`) so humans notice it before editing. Rephrase for clarity and brevity if needed.

- **Large or complex functions**  
  For functions that do several non-obvious things (e.g. fetch then enrich, or multiple steps): keep or add a short description that states what the function does overall and the main steps (e.g. “Fetches X, then fetches Y and Z per item”). JSDoc or a short block comment above the function is fine; format for readability.

## Keep (short)

- Comments that explain **why** the logic/code exists or **what** it does when it’s non-obvious
- `TODO:` when something is left to do (on its own line, prefixed with `TODO:`)
- `NOTE:` when something may need future change or context (on its own line, prefixed with `NOTE:`)

## Remove

- “Thinking” or process commentary
- Long explanations of obvious code, variable names, or function names
- Redundant or decorative comments
- Comments that restate what the code clearly already says

Apply edits directly to the file. Do not output a thinking process or a long explanation; just update the comments.
