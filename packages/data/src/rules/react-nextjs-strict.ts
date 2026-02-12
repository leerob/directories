export const reactNextjsStrictRules = [
  {
    tags: ["React", "Next.js", "TypeScript", "App Router"],
    title: "React & Next.js Strict Rules Pack",
    libs: ["zod", "react-hook-form", "tanstack-query"],
    slug: "react-nextjs-strict-rules-pack",
    content: `
You are an expert React and Next.js developer. Follow these rules strictly.

Code Style
- Use TypeScript for all new files
- Prefer functional components with hooks over class components
- Use named exports over default exports (except page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx, and route.ts — Next.js requires default exports for these)
- Keep components small and focused — if it's over 150 lines, split it
- Components: PascalCase. Hooks: camelCase with use prefix. Utilities: camelCase.
- Group files by feature, not by type. Colocate tests with components.

React Patterns
- Always define prop types with TypeScript interfaces
- Destructure props in function signature
- Prefer explicit return types over React.FC — it handles implicit children poorly
- Start with local state (useState), lift only when needed
- Use useReducer for complex state logic
- Before writing a useEffect, ask: can this be computed during render, handled by an event handler, or moved to the server? Most effects are unnecessary.
- Reserve effects for synchronizing with external systems (DOM manipulation, subscriptions, timers)
- Use useOptimistic for instant UI feedback on mutations (pair with Server Actions)
- Use useFormStatus to track pending form submissions in child components

Error Boundaries
- Always create error.tsx alongside every page.tsx — non-negotiable
- Create global-error.tsx in the app root to catch root layout errors
- error.tsx must be a client component ('use client') that receives error and reset props
- Wrap independent feature sections in separate error boundaries — don't let one widget crash the page
- Log errors to your monitoring service from the error boundary

Next.js App Router
- Use Server Components by default
- Add 'use client' only when you need interactivity, browser APIs, or hooks
- Colocate loading.tsx and error.tsx with page.tsx
- Use route groups (folder) for organization without URL impact

Server Actions
- Use for form submissions and data mutations instead of API routes
- Mark with 'use server' directive
- Always validate input with Zod — never trust client data
- Return structured responses: { success: boolean, data?: T, error?: string }
- Pair with revalidatePath or revalidateTag to refresh data after mutations
- Use useOptimistic on the client for instant feedback while the action runs
- Don't use Server Actions for data fetching — they're for mutations only

Data Fetching
- Server Components: fetch directly, no useEffect needed
- Client Components: use TanStack Query or SWR
- Fetch in parallel when possible (Promise.all) — don't create request waterfalls

Caching
- Use fetch options: cache: 'force-cache' (default), cache: 'no-store' (fresh), next: { revalidate: 3600 } (timed), next: { tags: ['posts'] } (tagged)
- Use revalidatePath('/path') or revalidateTag('tag') after mutations
- When in doubt, start with no-store and add caching as you measure performance

Metadata & SEO
- Export metadata object or generateMetadata function from page.tsx / layout.tsx
- Set title, description, and openGraph at minimum
- Include robots.ts and sitemap.ts at the app root

Form Handling
- Use React Hook Form for state management
- Validate with Zod schemas — share validation between client and server
- Define the schema first, infer the TypeScript type from it (z.infer<typeof schema>)
- For simple forms with Server Actions, use native <form action={...}> + useFormStatus

Anti-Patterns to Avoid
1. Don't use any — take the time to type properly
2. Don't fetch in useEffect for initial data — use Server Components or React Query
3. Don't put secrets in client code — use NEXT_PUBLIC_ prefix only for client-safe values
4. Don't mix App Router and Pages Router patterns
5. Don't use Server Actions for data fetching — mutations only
6. Don't call revalidatePath/revalidateTag from client code — call from Server Actions or Route Handlers

When Generating Code
1. Always include TypeScript types and error handling
2. Add loading states for async operations
3. Make components accessible by default
4. Use Server Components unless client interactivity is required
5. Validate all external input with Zod
    `,
    author: {
      name: "nedcodes",
      url: "https://cursorrulespacks.gumroad.com",
      avatar:
        "https://avatars.githubusercontent.com/u/199618707",
    },
  },
];
