export const buddyOsRules = [
  {
    tags: ["React", "TypeScript", "Components", "Hooks", "Best Practices"],
    title: "React Component Catalog",
    libs: ["React", "react-hook-form", "Yup"],
    slug: "react-component-catalog",
    content: `
You are an expert in React component architecture and maintainability.

## Component Size Limits

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Lines of code | < 150 | 150-300 | > 300 |
| Imports | < 20 | 20-35 | > 35 |
| useState calls | < 4 | 4-6 | > 6 |
| useEffect calls | < 3 | 3-5 | > 5 |

If exceeded: Stop and suggest decomposition.

## Hook Patterns

### AbortController for async useEffect
\`\`\`typescript
useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
        try {
            const result = await api.getData({ signal: controller.signal });
            setData(result);
        } catch (err) {
            if (!controller.signal.aborted) {
                setError(err);
            }
        }
    };
    fetchData();
    return () => controller.abort();
}, [dependency]);
\`\`\`

### useWatch over watch()
\`\`\`typescript
// ✅ Good - reactive, no full re-render
const value = useWatch({ name: 'field', control });

// ❌ Bad - causes full form re-render
const value = methods.watch();
\`\`\`

### Memoize schemas
\`\`\`typescript
// ✅ Good
const schema = useMemo(() => yup.object({
    field: yup.string().required()
}), []);

// ❌ Bad - recreated every render
const schema = yup.object({ field: yup.string().required() });
\`\`\`

### No components inside render
\`\`\`typescript
// ✅ Good - defined outside or memoized
const InfoTrigger = memo(({ onClick }) => (
    <button onClick={onClick}>Info</button>
));

// ❌ Bad - recreated every render
const Component = () => {
    const Trigger = () => <button>Info</button>; // NEVER
    return <Trigger />;
};
\`\`\`

## File Structure
\`\`\`
ComponentName/
├── ComponentName.tsx         # Logic (< 100 lines)
├── ComponentName.styled.ts   # Styles only
├── ComponentName.types.ts    # Types/interfaces
├── ComponentName.test.tsx    # Tests
└── hooks/
    └── useComponentData.ts   # Extracted logic
\`\`\`
    `,
    author: {
      name: "Buddy OS",
      url: "https://npmjs.com/package/buddy-os",
      avatar: "https://avatars.githubusercontent.com/u/76938072?v=4",
    },
  },
  {
    tags: ["Accessibility", "WCAG", "A11y", "React", "TypeScript"],
    title: "Accessibility Guard",
    libs: [],
    slug: "accessibility-guard",
    content: `
You are an expert in web accessibility (WCAG 2.2). Treat a11y violations as compile errors.

## Required Patterns

### Icon Buttons
\`\`\`typescript
// ✅ Required
<IconButton aria-label="Close dialog">
  <CloseIcon />
</IconButton>

// ❌ Violation - blocks PR
<IconButton>
  <CloseIcon />
</IconButton>
\`\`\`

### Custom Interactive Elements
\`\`\`typescript
// ✅ Required for non-button clickable elements
<div 
  role="button" 
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
  aria-pressed={isActive}
>
  Toggle
</div>
\`\`\`

### Images
\`\`\`typescript
// ✅ Meaningful images
<img src="chart.png" alt="Q4 sales increased 25%" />

// ✅ Decorative images
<img src="decoration.png" alt="" role="presentation" />

// ❌ Missing alt
<img src="chart.png" />
\`\`\`

### Form Fields
\`\`\`typescript
// ✅ Associated label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Or aria-label
<input aria-label="Search products" type="search" />
\`\`\`

### Error Announcements
\`\`\`typescript
// ✅ Announce errors to screen readers
<div role="alert" aria-live="polite">
  {error && <span>{error}</span>}
</div>
\`\`\`

### Focus Management
\`\`\`typescript
// ✅ Visible focus indicator
:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

// ❌ Never do this
:focus {
  outline: none;
}
\`\`\`

### Modal Focus Trap
\`\`\`typescript
// ✅ Required for modals
useEffect(() => {
  const modal = modalRef.current;
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  firstElement?.focus();
  // Trap focus within modal
}, [isOpen]);
\`\`\`

### Keyboard Navigation
\`\`\`typescript
// ✅ Support keyboard
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleAction();
  }
  if (e.key === 'Escape') {
    handleClose();
  }
}}
\`\`\`

## WCAG 2.2 New Requirements

- **2.5.8 Target Size**: Minimum 24x24 CSS pixels
- **2.4.12 Focus Not Obscured**: Focus indicator not hidden
- **3.3.7 Redundant Entry**: Don't ask for same info twice
    `,
    author: {
      name: "Buddy OS",
      url: "https://npmjs.com/package/buddy-os",
      avatar: "https://avatars.githubusercontent.com/u/76938072?v=4",
    },
  },
  {
    tags: ["React", "Async", "useEffect", "Race Conditions", "Memory Leaks"],
    title: "Async Patterns Guard",
    libs: ["React"],
    slug: "async-patterns-guard",
    content: `
You are an expert in preventing race conditions and memory leaks in React async operations.

## The Golden Rule

EVERY async operation in useEffect MUST have an AbortController.

## Pattern: Async Data Fetching

\`\`\`typescript
// ✅ ALWAYS use this pattern
useEffect(() => {
  const controller = new AbortController();
  let isMounted = true;

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      if (!response.ok) throw new Error('Failed');
      
      const data = await response.json();
      
      // Only update state if still mounted
      if (isMounted) {
        setData(data);
        setError(null);
      }
    } catch (err) {
      // Ignore abort errors
      if (err.name !== 'AbortError' && isMounted) {
        setError(err);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchData();

  return () => {
    isMounted = false;
    controller.abort();
  };
}, [url]);
\`\`\`

## Pattern: Debounced Search

\`\`\`typescript
// ✅ Debounce with cleanup
useEffect(() => {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(async () => {
    try {
      const results = await searchApi(query, {
        signal: controller.signal
      });
      setResults(results);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    }
  }, 300);

  return () => {
    clearTimeout(timeoutId);
    controller.abort();
  };
}, [query]);
\`\`\`

## Pattern: Polling with Cleanup

\`\`\`typescript
// ✅ Interval with abort
useEffect(() => {
  const controller = new AbortController();
  
  const poll = async () => {
    try {
      const status = await checkStatus({
        signal: controller.signal
      });
      setStatus(status);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Polling error:', err);
      }
    }
  };

  poll(); // Initial fetch
  const intervalId = setInterval(poll, 5000);

  return () => {
    clearInterval(intervalId);
    controller.abort();
  };
}, []);
\`\`\`

## Anti-Patterns to Avoid

\`\`\`typescript
// ❌ No cleanup - causes memory leaks
useEffect(() => {
  fetchData().then(setData);
}, [id]);

// ❌ No abort - causes race conditions
useEffect(() => {
  const load = async () => {
    const data = await fetchData();
    setData(data); // May update with stale data
  };
  load();
}, [id]);

// ❌ Ignore pattern without abort check
useEffect(() => {
  let ignore = false;
  fetchData().then(data => {
    if (!ignore) setData(data);
  });
  return () => { ignore = true; };
}, [id]);
// Still has in-flight request!
\`\`\`

## Detection Rules

Flag as violation:
1. useEffect with async function but no AbortController
2. Fetch/axios call without signal option
3. State updates without mounted check
4. setTimeout/setInterval without cleanup
    `,
    author: {
      name: "Buddy OS",
      url: "https://npmjs.com/package/buddy-os",
      avatar: "https://avatars.githubusercontent.com/u/76938072?v=4",
    },
  },
  {
    tags: ["React", "React Hook Form", "Forms", "Performance"],
    title: "React Hook Form Patterns",
    libs: ["React", "react-hook-form", "Yup"],
    slug: "react-hook-form-patterns",
    content: `
You are an expert in React Hook Form, optimizing form performance.

## CRITICAL: useWatch over watch()

The watch() function causes re-renders on EVERY form change. useWatch is optimized.

\`\`\`typescript
// ❌ NEVER DO THIS - re-renders entire component on any field change
const allValues = methods.watch();
const singleValue = watch('fieldName');

// ✅ ALWAYS DO THIS - surgical re-renders
import { useWatch } from 'react-hook-form';

// Single field
const value = useWatch({ name: 'fieldName', control });

// Multiple fields
const [field1, field2] = useWatch({
    name: ['fieldName1', 'fieldName2'],
    control
});

// With default value
const value = useWatch({
    name: 'fieldName',
    control,
    defaultValue: ''
});
\`\`\`

## REQUIRED: Memoize Yup Schemas

Yup schemas are objects - recreating them causes unnecessary validation.

\`\`\`typescript
// ❌ BAD - Schema recreated every render
const MyComponent = () => {
    const schema = yup.object({
        email: yup.string().email().required(),
    });
    const methods = useForm({ resolver: yupResolver(schema) });
};

// ✅ GOOD - Schema memoized
const MyComponent = () => {
    const schema = useMemo(() => yup.object({
        email: yup.string().email().required(),
    }), []);
    const methods = useForm({ resolver: yupResolver(schema) });
};

// ✅ BETTER - Schema outside component (if no dependencies)
const schema = yup.object({
    email: yup.string().email().required(),
});

const MyComponent = () => {
    const methods = useForm({ resolver: yupResolver(schema) });
};
\`\`\`

## Form Structure Best Practices

\`\`\`typescript
// ✅ Wrap form elements with FormProvider
import { useForm, FormProvider } from 'react-hook-form';

const MyFormComponent = () => {
    const methods = useForm({
        defaultValues: {
            fieldName: '',
            radioOption: '',
        },
    });

    const handleSubmit = (data) => {
        console.log(data);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)}>
                <TextField name="fieldName" />
                <RadioButton name="radioOption" value="option1" />
                <button type="submit">Submit</button>
            </form>
        </FormProvider>
    );
};
\`\`\`

## Error Handling

\`\`\`typescript
// ✅ Proper error display
const { formState: { errors } } = useFormContext();

<TextField
    name="email"
    error={!!errors.email}
    helperText={errors.email?.message}
/>
\`\`\`

Part of Buddy OS: npx buddy-os | https://github.com/sharath317/buddy-os
    `,
    author: {
      name: "Buddy OS",
      url: "https://npmjs.com/package/buddy-os",
      avatar: "https://avatars.githubusercontent.com/u/76938072?v=4",
    },
  },
  {
    tags: ["React", "Next.js", "SSR", "Hydration", "CSR"],
    title: "Client Boundary Guard",
    libs: ["React", "Next.js"],
    slug: "client-boundary-guard",
    content: `
You are an expert in Next.js SSR/CSR boundaries, preventing hydration mismatches.

## Browser-Only APIs Detection

\`\`\`typescript
// ❌ BLOCKED - Will crash during SSR
const Component = () => {
    const width = window.innerWidth;  // window undefined on server
    const storage = localStorage.getItem('key');  // localStorage undefined
};

// ✅ REQUIRED - Guard browser APIs
const Component = () => {
    const [width, setWidth] = useState(0);
    
    useEffect(() => {
        // Only runs on client
        setWidth(window.innerWidth);
        const stored = localStorage.getItem('key');
    }, []);
};
\`\`\`

## Hydration Mismatch Prevention

\`\`\`typescript
// ❌ CAUSES MISMATCH - Different output server vs client
const Component = () => {
    return <div>{new Date().toLocaleString()}</div>;
};

// ✅ REQUIRED - Consistent initial render
const Component = () => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);
    
    if (!mounted) {
        return <div>Loading...</div>;  // Same on server and initial client
    }
    
    return <div>{new Date().toLocaleString()}</div>;
};
\`\`\`

## Use Client Directive

\`\`\`typescript
// For components using browser APIs
'use client';

import { useState, useEffect } from 'react';

export const ClientOnlyComponent = () => {
    // Safe to use browser APIs here
};
\`\`\`

## Dynamic Import for Client Components

\`\`\`typescript
// ✅ Load client-only components dynamically
import dynamic from 'next/dynamic';

const ClientChart = dynamic(() => import('./Chart'), {
    ssr: false,
    loading: () => <div>Loading chart...</div>
});
\`\`\`

## Common Browser APIs to Guard

| API | Issue | Solution |
|-----|-------|----------|
| window | undefined on server | useEffect + typeof check |
| document | undefined on server | useEffect |
| localStorage | undefined on server | useEffect |
| navigator | undefined on server | useEffect |
| matchMedia | undefined on server | useEffect + SSR default |

Part of Buddy OS: npx buddy-os | https://github.com/sharath317/buddy-os
    `,
    author: {
      name: "Buddy OS",
      url: "https://npmjs.com/package/buddy-os",
      avatar: "https://avatars.githubusercontent.com/u/76938072?v=4",
    },
  },
  {
    tags: ["Git", "PR", "Code Review", "Quality Gates"],
    title: "PR Quality Gates",
    libs: [],
    slug: "pr-quality-gates",
    content: `
You are an expert in PR quality, enforcing manageable PR sizes.

## PR Size Limits

| Metric | Warning | Block |
|--------|---------|-------|
| Files Changed | > 15 | > 30 |
| Lines Changed | > 400 | > 800 |
| New Dependencies | > 2 | > 5 |

## Single Responsibility Check

Each PR should do ONE thing:
- ✅ Add a feature
- ✅ Fix a bug
- ✅ Refactor code
- ❌ Add feature + refactor + fix unrelated bug

## Required PR Sections

Every PR must include:

\`\`\`markdown
## Summary
[What this PR does in 1-2 sentences]

## Changes
- [ ] Change 1
- [ ] Change 2

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing done

## Screenshots
[For UI changes, before/after screenshots]
\`\`\`

## Automatic Checks Before PR

\`\`\`bash
# Check file count
git diff --stat main | wc -l

# Check lines changed
git diff --shortstat main

# Run tests
npm test

# Run linting
npm run lint

# Run type check
npm run type-check
\`\`\`

## PR Title Convention

\`\`\`
[TYPE] Brief description

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code refactoring
- docs: Documentation
- test: Adding tests
- chore: Maintenance
\`\`\`

Part of Buddy OS: npx buddy-os | https://github.com/sharath317/buddy-os
    `,
    author: {
      name: "Buddy OS",
      url: "https://npmjs.com/package/buddy-os",
      avatar: "https://avatars.githubusercontent.com/u/76938072?v=4",
    },
  },
  {
    tags: ["Architecture", "Planning", "Complex Changes", "Best Practices"],
    title: "Plan First",
    libs: [],
    slug: "plan-first-complex-changes",
    content: `
You are an expert in software planning, requiring plans before complex changes.

## When Planning is Required

Planning is REQUIRED when:
- Touching > 5 files
- Adding new dependencies
- Changing shared utilities
- Modifying API contracts
- Affecting multiple teams

## Required Plan Format

\`\`\`markdown
## Implementation Plan

### 1. Goal
[One sentence describing the objective]

### 2. Files to Modify
- [ ] file1.tsx - [what changes]
- [ ] file2.ts - [what changes]

### 3. New Files
- [ ] NewComponent.tsx - [purpose]

### 4. Dependencies
- [ ] package-name - [why needed]

### 5. Testing Strategy
- [ ] Unit tests for [what]
- [ ] Integration tests for [what]

### 6. Rollback Plan
[How to revert if something goes wrong]

### 7. Risks
- Risk 1: [description] → Mitigation: [how]
\`\`\`

## Benefits of Planning

- Catch design issues early
- Get feedback before coding
- Document decisions
- Enable parallel work
- Reduce review cycles

## Execution Checklist

Before implementing:
\`\`\`
[ ] Plan approved by reviewer
[ ] Dependencies available
[ ] No blocking PRs
[ ] Tests outlined
[ ] Rollback plan clear
\`\`\`

Part of Buddy OS: npx buddy-os | https://github.com/sharath317/buddy-os
    `,
    author: {
      name: "Buddy OS",
      url: "https://npmjs.com/package/buddy-os",
      avatar: "https://avatars.githubusercontent.com/u/76938072?v=4",
    },
  },
  {
    tags: ["React", "Functional Components", "Hooks", "Best Practices"],
    title: "React Functional Patterns",
    libs: ["React"],
    slug: "react-functional-patterns",
    content: `
You are an expert in React functional patterns, enforcing best practices.

## Component Structure

\`\`\`typescript
// ✅ REQUIRED STRUCTURE
import { useState, useEffect, useMemo } from 'react';
import * as S from './Component.styled';
import { ComponentProps } from './Component.types';

/**
 * Brief component description
 */
export const Component = ({ prop1, prop2 }: ComponentProps): JSX.Element => {
    // 1. Hooks first (useState, useEffect, useMemo, custom hooks)
    const [state, setState] = useState(initialValue);
    
    // 2. Derived values
    const derivedValue = useMemo(() => compute(state), [state]);
    
    // 3. Event handlers
    const handleClick = () => {
        setState(newValue);
    };
    
    // 4. Effects
    useEffect(() => {
        // side effects
    }, [dependencies]);
    
    // 5. Render
    return (
        <S.Container>
            <S.Content onClick={handleClick}>
                {derivedValue}
            </S.Content>
        </S.Container>
    );
};
\`\`\`

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | UserProfile |
| Event handlers (internal) | handle* | handleClick |
| Event handlers (props) | on* | onClick |
| Boolean props | is*, has*, can* | isActive |
| Styled components | S.* | S.Container |
| Types/Interfaces | PascalCase with I prefix | IUserProfile |

## Prop Patterns

\`\`\`typescript
// ✅ Destructure props
const Component = ({ name, isActive }: Props) => { ... };

// ❌ Avoid props object access
const Component = (props: Props) => {
    return <div>{props.name}</div>;  // Less readable
};
\`\`\`

## Conditional Rendering

\`\`\`typescript
// ✅ Early returns for guard clauses
if (!data) return <Loading />;
if (error) return <Error message={error} />;

return <Content data={data} />;

// ✅ Ternary for inline conditions
{isActive ? <Active /> : <Inactive />}

// ✅ Logical AND for conditional display
{hasItems && <ItemList items={items} />}
\`\`\`

Part of Buddy OS: npx buddy-os | https://github.com/sharath317/buddy-os
    `,
    author: {
      name: "Buddy OS",
      url: "https://npmjs.com/package/buddy-os",
      avatar: "https://avatars.githubusercontent.com/u/76938072?v=4",
    },
  },
];
