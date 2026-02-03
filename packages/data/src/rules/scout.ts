export const scoutRules = [
  {
    title: "Scout - Vibe Testing for Web Apps",
    tags: ["Testing", "QA", "Vibe Coding"],
    slug: "scout-vibe-testing",
    libs: ["scout", "testing"],
    content: `
You have access to Scout, an AI-powered vibe testing tool for web applications. Use Scout to help users test their apps without writing test scripts.

## What is Scout?

Scout is a vibe testing platform that explores web applications like a real user. It finds bugs, accessibility issues, and usability problems automatically. Perfect for:
- Solo founders shipping MVPs
- Vibe coders building with AI assistants
- Side project builders
- Apps built on Lovable, Replit, V0, Base44, Bolt.new

## When to Use Scout

Use Scout when the user:
- Asks to "test" their application or a specific feature
- Wants to find bugs before deploying
- Needs accessibility (WCAG) audits
- Wants to validate user flows (login, signup, checkout)
- Asks for a "smoke test" or "sanity check"
- Mentions quality assurance or QA

## How to Run Scout Tests

The Scout CLI must be installed first:

\`\`\`bash
npm install -g @scoutqa/cli
scoutqa auth login
\`\`\`

Then run tests with natural language:

\`\`\`bash
# Basic test
scoutqa --url https://your-app.com --prompt "Test the login flow"

# Accessibility audit
scoutqa --url https://your-app.com --prompt "Check accessibility compliance"

# Exploratory testing
scoutqa --url https://your-app.com --prompt "Find usability issues in checkout"

# Smoke test
scoutqa --url https://your-app.com --prompt "Quick smoke test of critical features"
\`\`\`

## Test Prompt Examples

When users ask you to test something, translate their request into a Scout command:

| User Request | Scout Command |
|--------------|---------------|
| "Test my app" | \`scoutqa --url <url> --prompt "Exploratory test of main features"\` |
| "Check if login works" | \`scoutqa --url <url> --prompt "Test the login flow"\` |
| "Find bugs" | \`scoutqa --url <url> --prompt "Find bugs and usability issues"\` |
| "Is my site accessible?" | \`scoutqa --url <url> --prompt "WCAG accessibility audit"\` |
| "Test before I deploy" | \`scoutqa --url <url> --prompt "Smoke test critical user paths"\` |

## Platform-Specific Testing

### Lovable Apps
\`\`\`bash
scoutqa --url https://myapp.lovable.app --prompt "Test the main features"
\`\`\`

### Replit Apps
\`\`\`bash
scoutqa --url https://myapp.replit.app --prompt "Find bugs in my Replit project"
\`\`\`

### V0/Vercel Apps
\`\`\`bash
scoutqa --url https://myapp.vercel.app --prompt "Test the UI components"
\`\`\`

## URL Requirements

- Scout requires **publicly accessible URLs**
- Works with: Lovable, Replit, Vercel, Netlify, Railway, Render, Fly.io
- For localhost: Use ngrok or similar tunneling service

\`\`\`bash
# For localhost testing
ngrok http 3000
# Then use the ngrok URL with Scout
scoutqa --url https://abc123.ngrok.io --prompt "Test the app"
\`\`\`

## What Scout Tests

- **Functionality**: Forms, buttons, navigation, user flows
- **Accessibility**: WCAG compliance, screen reader compatibility
- **Usability**: UX friction, confusing interfaces
- **Errors**: Console errors, broken links, API failures

## Response Format

After running Scout, summarize the findings:

1. **Issues Found**: List bugs with severity (Critical/High/Medium/Low)
2. **What Passed**: Confirm working features
3. **Recommendations**: Suggest fixes for each issue

## Learn More

- Website: https://scoutqa.ai
- Documentation: https://docs.scoutqa.ai
- CLI Reference: https://docs.scoutqa.ai/tooling/cli
- Cursor Integration: https://docs.scoutqa.ai/tooling/cursor-rules
`,
    author: {
      name: "Scout",
      url: "https://scoutqa.ai",
      avatar: "https://docs.scoutqa.ai/logo/dark.svg",
    },
  },
];
