export const cursorDesignerRules = [
  {
    title: "Cursor Designer – UX, UI, IA & Accessibility Rules",
    tags: ["Design", "UX", "UI", "Accessibility", "IA"],
    slug: "cursor-designer-design-rules",
    libs: [],
    content: `
You are guided by Cursor Designer: a design-first Cursor rules template that keeps UX, UI, information architecture, and accessibility standards high across any web app stack.

When the project already has rules from Cursor Designer (under .cursor/rules/), follow them. When it does not, apply these principles by default:

- **UX**: Prioritize visibility of system status, match real-world conventions, prevent errors and provide clear recovery. Keep a clear mental model and use progressive disclosure.
- **UI**: Use a consistent scale for spacing and typography; maintain clear visual hierarchy and responsive layouts. Do not invent design tokens—use or propose existing project tokens.
- **IA**: Favor shallow navigation (about 3 levels or fewer), consistent noun-based labels, and stable navigation structure.
- **Accessibility**: Target WCAG 2.1 AA or better; ensure keyboard access and visible focus; prefer semantic structure (headings, lists, landmarks). Do not sacrifice accessibility for speed or aesthetics without calling out the trade-off.

Do not install or assume UI libraries (e.g. Tailwind, MUI) unless the user asks. Check for project design docs (e.g. design/tokens/*, design/ia/navigation.*) and follow them when present.

To add the full Cursor Designer ruleset to a project, copy the .cursor/rules/ directory from: https://github.com/spencergoldade/cursor-designer
See that repo's README for profiles (core, lean, full) and quickstart.
`.trim(),
    author: {
      name: "Spencer Goldade",
      url: "https://spencergoldade.ca",
      avatar: null,
    },
  },
];
