export const frontendArchitectureRules = [
    {
      title: "The Ultimate Frontend Development Instruction",
      tags: ["TypeScript", "React", "Next.js", "Frontend", "JavaScript"],
      libs: ["TailwindCSS", "Shadcn UI", "Radix UI", "Framer Motion", "Zod"],
      slug: "ultimate-frontend-development-guide",
      content: `
  # The Ultimate Frontend Development Guide: Principles, Patterns, and Practices
  
  ## Development Philosophy
  
  - **First Principles**: Embrace SOLID principles, KISS (Keep It Simple, Stupid), and DRY (Don't Repeat Yourself)
  - **Functional Over Object-Oriented**: Favor functional and declarative programming patterns over imperative and OOP
  - **Component-Driven Development**: Build applications as compositions of well-defined, reusable components
  - **Type Safety**: Leverage TypeScript to its fullest potential for enhanced developer experience and code quality
  - **Think Then Code**: Begin with step-by-step planning and detailed pseudocode before implementation
  
  ## Code Architecture & Structure
  
  ### Project Organization
  - Use lowercase with dashes for directories (\`components/auth-wizard/\`)
  - Structure files consistently:
    1. Exported component/functionality
    2. Subcomponents/helpers 
    3. Static content
    4. Types/interfaces
  
  ### Naming Conventions
  
  - **PascalCase** for:
    - Components (\`UserProfile\`)
    - Type definitions/Interfaces (\`UserData\`)
    
  - **kebab-case** for:
    - Directory names (\`components/auth-wizard/\`)
    - File names (\`user-profile.tsx\`)
    
  - **camelCase** for:
    - Variables, functions, methods
    - Hooks, properties, props
    
  - **Descriptive Prefixes**:
    - Prefix event handlers with 'handle': \`handleClick\`, \`handleSubmit\`
    - Prefix boolean variables with verbs: \`isLoading\`, \`hasError\`, \`canSubmit\` 
    - Prefix custom hooks with 'use': \`useAuth\`, \`useForm\`
  
  ## TypeScript Implementation
  
  - Enable strict mode
  - Prefer interfaces over types for object structures, especially when extending
  - Use type guards for null/undefined values
  - Apply generics for type flexibility
  - Leverage TypeScript utility types (\`Partial<>\`, \`Pick<>\`, \`Omit<>\`)
  - Avoid enums; use const objects/maps instead
  - Use discriminated unions for complex state management
  
  ## React & Next.js Best Practices
  
  ### Component Patterns
  
  - Use functional components with explicit TypeScript interfaces
  - Use the \`function\` keyword for component definitions, not arrow functions
  - Extract reusable logic into custom hooks
  - Place static content in variables outside render functions
  - Implement proper cleanup in useEffect hooks
  
  ### Server Components First
  
  - Default to Server Components
  - Use \`'use client'\` directive sparingly, only when necessary:
    - Event listeners
    - Browser APIs
    - State that must be client-side
    - Client-side-only libraries
  - Use URL query parameters for server state management
  - Implement proper data fetching using Next.js patterns
  
  ### Performance Optimizations
  
  - Use React.memo() strategically
  - Implement useCallback for event handlers passed to child components
  - Use useMemo for expensive computations
  - Avoid inline function definitions in JSX
  - Implement code splitting using dynamic imports
  - Use proper key props in lists (avoid using index as key)
  - Wrap client components in Suspense with appropriate fallbacks
  
  ## UI and Styling
  
  - Use Tailwind CSS for utility-first, maintainable styling
  - Leverage component libraries like Shadcn UI and Radix UI for accessible, composable UI
  - Design with mobile-first, responsive principles
  - Implement dark mode using CSS variables or Tailwind's dark mode features
  - Maintain consistent spacing values and design tokens
  - Use Framer Motion library for the animations of components
  
  ## Error Handling - The Art of Graceful Failures
  
  ### The Early Return Pattern
  
  - Handle errors and edge cases at the beginning of functions
  - Use early returns for error conditions
  - Place the happy path last in the function
  - Avoid unnecessary else statements; use if-return pattern instead
  - Implement guard clauses to handle preconditions
  
  ### Structured Error Handling
  
  - Use custom error types for consistent error handling
  - For Next.js Server Actions, model expected errors as return values
  - Implement error boundaries using error.tsx files
  - Provide user-friendly error messages
  - Log errors appropriately for debugging
  
  ## Form Validation
  
  - Use Zod for schema validation
  - Implement proper error messages
  - Use react-hook-form for form state management
  - Combine with useActionState for server actions
  
  ## State Management
  
  - Use useState for simple component-level state
  - Implement useReducer for complex local state
  - Use React Context for shared state within a component tree
  - For global state, choose appropriate tools:
    - Redux Toolkit for complex applications
    - Zustand for simpler state management
    - TanStack Query for server state
  
  ## Accessibility (a11y)
  
  - Use semantic HTML elements
  - Apply appropriate ARIA attributes only when necessary
  - Ensure keyboard navigation support
  - Maintain accessible color contrast ratios
  - Follow a logical heading hierarchy
  - Provide clear and accessible error feedback
  - Test with screen readers
      `,
      author: {
        name: "Elina Lesyk",
        url: "https://github.com/EliaLesyk",
        avatar: "https://avatars.githubusercontent.com/u/56804907?v=4"
      }
    }
  ];