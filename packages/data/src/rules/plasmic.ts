export const plasmicRules = [
    {
      tags: ["Plasmic", "Low-code", "React", "Next.js"],
      title: "Plasmic Cursor Rules",
      libs: ["react", "next.js"],
      slug: "plasmic-cursor-rules",
      content: `
This is a set of rules that outlines the best practices and architecture principles to create Plasmic-compatible code:

Plasmic-Specific Guidelines

- Build reusable components for Plasmic Studio, not pages
- Pass as much UI work as possible to Plasmic Studio
- For repeatable components, use string/number props over slots
- Use slot components for images when possible; apply default styles with ".element image" selectors
- Use DataProvider only when exposing data to Plasmic Studio is necessary
- Use the Plasmic state feature if you need to listen to or propagate changes

Component Registration

- Register all components in plasmic-host.tsx
- Import components at the top of the file
- Use registerComponent with proper configuration (see Plasmic docs)
- Set appropriate name and displayName
- Use importPath with @/ prefix only in codegen mode (if loader library is absent)
- Provide default values for required props
- Add descriptive comments for each prop
- By default, registerComponent includes a className prop for root styles (do not add it explicitly)

Props Configuration

- Use type: "class" for all className props (never "string")
- For eventHandler props, include argTypes: []
- Use these types for props:
  - "string" for text
  - "number" for numbers
  - "boolean" for toggles
  - "imageUrl" for images
  - "array" for collections
  - "eventHandler" for callbacks
  - "slot" for customizable content
  - "class" for styles

Naming Conventions

- PascalCase: Components, Types, Interfaces
- kebab-case: directories, file names (e.g., auth-wizard, user-profile.tsx)
- camelCase: variables, functions, methods, hooks, props
- UPPERCASE: environment variables, constants
- Prefix event handlers with 'handle' (e.g., handleClick)
- Prefix booleans with verbs (e.g., isLoading, hasError)
- Prefix custom hooks with 'use' (e.g., useAuth)
- For style props, use suffix ClassName (e.g., titleClassName)
- For event handlers, use prefix on (e.g., onClick)

Styling Guidelines

- Use CSS modules (e.g., ComponentName.module.css)
- Design mobile-first and responsively
- Include hover states and transitions for interactive elements
- Add fallback styles for missing content (e.g., no-image state)
- Ensure color contrast accessibility
- Maintain consistent spacing
- Define CSS variables for theme colors and spacing
- Use Plasmic's registerToken/tokens for CSS variable integration
- Pass className for root element to allow Studio style customization
- Use classnames feature to allow Studio to override/modify child styles
- Allow initial CSS in UI components for Studio users to extend

Data & State Handling

- Use DataProvider only when exposing data to Studio is needed (in case if user would need to render something using the data, like a repeatable component, or if the component itself is created to fetch the data)
- Transform data inside the component as needed
- Define states in registration when needed, with correct valueProps/onChangeProps/variableType
- When using data sources (like fetching data from remote database) - use data fetching components, look up supabase example repository to see how it's done

Common Mistakes to Avoid

- Do not create pages; only reusable components
- Do not use type: "string" for className props (use "class")
- Do not use slots for repeatable components populated from data
- Do not forget argTypes: [] for eventHandler props
- Do not forget providesData: true when using DataProvider
- Do not add className prop again in registration
- Do not use app router features without confirming project structure
- Use "dynamic" clause to load registered components that rely on heavy front-end dependencies (like google maps, etc.)
    `,
    author: {
      name: "Plasmic",
      url: "https://plasmic.app",
      avatar: "https://avatars.githubusercontent.com/u/57023879?v=4",
    },
  },
];
