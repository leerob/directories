export const skillcheckRules = [
  {
    tags: ["Claude", "Skills", "Validation", "AI", "Quality"],
    title: "SkillCheck - AI Skill Validator",
    libs: [],
    slug: "skillcheck-ai-skill-validator",
    content: `
# SkillCheck (Free)

Check skills against Anthropic guidelines and the agentskills specification. Validates Claude Code skills, Cursor rules, and AI assistant configurations.

## When to Use

Activate when user:
- Says "check skill", "skillcheck", or "validate SKILL.md"
- Wants to verify skills meet Anthropic best practices
- Asks to find issues in skill definitions

## Prerequisites

- Any AI assistant with file Read capability (Claude Code, Cursor, Windsurf, Codex CLI)
- Works on any platform (Unix/macOS/Windows)
- No special tools required (Read-only)

## How to Check a Skill

1. **Locate**: Find target SKILL.md file(s)
2. **Read**: Load the content
3. **Validate**: Apply each rule section below
4. **Report**: List issues found with severity and fixes

---

# Validation Rules

## 1. Frontmatter Structure

Every SKILL.md must start with YAML frontmatter between \`---\` markers.

### Required Fields

| Field | Required | Rules |
|-------|----------|-------|
| \`name\` | Yes | Lowercase, hyphens only, 1-64 chars, no reserved words |
| \`description\` | Yes | WHAT + WHEN pattern, 1-1024 chars |

### Name Validation

**Pattern**: \`^[a-z][a-z0-9-]*[a-z0-9]$\`

**Reserved words**: \`skill\`, \`skills\`, \`claude\`, \`anthropic\`, \`mcp\`, \`tool\`, \`tools\`, \`agent\`, \`agents\`, \`ai\`, \`assistant\`, \`bot\`

**Vague terms** (avoid): \`helper\`, \`utils\`, \`tools\`, \`misc\`, \`stuff\`, \`things\`, \`manager\`, \`handler\`

### Description Validation

Must contain:
1. **WHAT**: Action verb explaining what skill does
2. **WHEN**: Trigger phrase describing when to invoke

**Action verbs**: Create, Generate, Build, Convert, Extract, Analyze, Transform, Process, Validate, Format, Export, Import, Parse, Search, Find

**WHEN triggers**: "Use when", "Use for", "Invoke when", "Activate when", "Triggers on", "Run when", "Applies to", "Helps with"

---

## 2. Naming Quality

Names should be descriptive compounds, not single words.

**Bad**: \`generator\` (too generic)
**Good**: \`pdf-report-generator\`

**Length Guidelines**: Minimum 3 chars, optimal 10-30 chars, maximum 64 chars.

---

## 3. Semantic Checks

### Contradiction Detection
Flag conflicting instructions that simultaneously require and forbid the same action.

### Ambiguous Terms
Flag vague language: "multiple items", "correct settings", "appropriate values"
Use exact counts or specific criteria instead.

### Output Format Specification
Skills mentioning output should specify format with concrete examples (code blocks, JSON, tables).

---

## 4. Quality Patterns (Strengths)

Recognize positive patterns:
- Has Example Section (\`## Example\`, \`## Usage\`, \`<example>\` tags)
- Has Error Handling (\`## Error\`, \`## Limitation\`, "does not support")
- Has Trigger Phrases (Use when, Triggers on, Applies to)
- Has Output Format with examples
- Has Structured Instructions (numbered steps)
- Has Prerequisites documented

---

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| Critical | Skill may not function | Must fix |
| Warning | Best practice violation | Should fix |
| Suggestion | Could be improved | Nice to have |

---

## Reporting Format

\`\`\`markdown
## SkillCheck Results: [skill-name]

### Summary
- Critical: X | Warnings: Y | Suggestions: Z | Passed: N

### Critical Issues
**[Check ID]** Line N: [Issue description]
**Fix**: [How to resolve]
\`\`\`

---

## Pro Features

Get deeper analysis at https://getskillcheck.com:
- Anti-slop detection (AI writing patterns)
- Security scanning (secrets, injection, PII)
- Token budget analysis
- WCAG accessibility compliance
- Enterprise readiness checks
- CI/CD binary integration
    `,
    author: {
      name: "Olga Safonova",
      url: "https://github.com/olgasafonova",
      avatar:
        "https://avatars.githubusercontent.com/u/1171721?v=4",
    },
  },
];
