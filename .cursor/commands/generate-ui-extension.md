# Generate Shopify Checkout UI Extension

Generate a new Shopify Checkout UI Extension, convert it to TypeScript, and apply best practices from `.cursor/rules/shopify-extension-checkout-ui.mdc` and `.cursor/rules/shopify-extension-typescript-conversion.mdc`.

## Steps

1. **Generate the extension**:
   - Run `shopify app generate extension`
   - Select "Checkout UI" when prompted
   - Use the extension name/handle provided in the prompt

2. **Convert from JavaScript to TypeScript**:
   - Rename `src/Checkout.jsx` → `src/Checkout.tsx`
   - Update `shopify.extension.toml`: Change `module = "./src/Checkout.jsx"` → `module = "./src/Checkout.tsx"`
   - Update `shopify.d.ts`: Change `declare module './src/Checkout.jsx'` → `declare module './src/Checkout.tsx'`
   - Update `tsconfig.json`: Ensure `strict: true` is set, remove `checkJs`/`allowJs` if present

3. **Apply TypeScript best practices**:
   - Add `Settings` interface at the top of `Checkout.tsx`
   - Type all settings variables (use `as Settings` for settings object)
   - Import types from `@lib/types` when available (e.g., `PaddingKeyword`, `BorderKeyword`, `BackgroundKeyword`)
   - Use `logger.collapse()` for debugging settings instead of `console.log()`

4. **Apply checkout UI best practices**:
   - Import utilities from `@lib/utils`: `logger`, `displayDesktopStyle`, `displayMobileStyle`, `normalizeImageSize`
   - Use Polaris web components only (`s-text`, `s-box`, `s-stack`, `s-grid`, `s-image`, `s-icon`, etc.) - NO HTML elements
   - Wrap responsive content in `<s-query-container>` when using `displayDesktopStyle()` or `displayMobileStyle()`
   - Use `repeat()` for grid columns (e.g., `repeat(3, auto)` instead of `auto auto auto`)
   - Use `repeat(auto-fit, minmax(0, max-content))` for flex-like behavior with multiple inline contents
   - Use `s-icon` component with `type` attribute for icons (e.g., `<s-icon type="arrow-left" size="small" />`)
   - Always call `displayDesktopStyle()` and `displayMobileStyle()` with parentheses `()`
   - Use `normalizeImageSize()` utility for image size settings
   - Organize settings in `shopify.extension.toml` with comment sections
   - Place padding settings (`padding_block`, `padding_inline`) at the bottom of settings sections
   - Use snake_case for all setting keys
   - Default border setting to `'none'` (valid keyword)
   - Use proper type casting for settings (e.g., `as PaddingKeyword`, `as BorderKeyword`)

5. **Update the component structure**:
   - Add proper imports: `import '@shopify/ui-extensions/preact'`, `import { render } from 'preact'`
   - Import utilities: `import { logger, displayDesktopStyle, displayMobileStyle, normalizeImageSize } from '@lib/utils'`
   - Import types: `import type { PaddingKeyword, GapKeyword, BorderRadiusKeyword, BackgroundKeyword, BorderKeyword, HorizontalAlignmentKeyword, VerticalAlignmentKeyword } from '@lib/types'`
   - Define `Settings` interface
   - Use `logger.collapse(settings, 'Extension Name | Settings', 'info')` for debugging
   - Return `null` early if no content to render
   - Use proper type assertions for settings values

6. **Update tsconfig.json**:
   - Ensure path aliases are configured:
     ```json
     {
       "compilerOptions": {
         "baseUrl": "../..",
         "paths": {
           "@lib/utils": ["lib/utils.ts"],
           "@lib/types": ["lib/types.ts"],
           "@lib/*": ["lib/*"]
         }
       },
       "include": ["./src", "./shopify.d.ts", "../../lib/**/*"]
     }
     ```

7. **Based on the prompt, customize the extension**:
   - Add settings as specified in the prompt
   - Implement the component logic according to the prompt requirements
   - Follow all best practices from the rule files

## Example Generated Structure

```typescript
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { logger, displayDesktopStyle, displayMobileStyle, normalizeImageSize } from '@lib/utils';
import type {
  PaddingKeyword,
  GapKeyword,
  BorderRadiusKeyword,
  BackgroundKeyword,
  BorderKeyword,
  HorizontalAlignmentKeyword,
  VerticalAlignmentKeyword
} from '@lib/types';

interface Settings {
  // Define settings based on prompt
  padding_block?: string;
  padding_inline?: string;
  // ... other settings
}

export default async () => render(<Extension />, document.body);

function Extension() {
  const settings = shopify.settings.value as Settings;
  logger.collapse(settings, 'Extension Name | Settings', 'info');

  const paddingBlock = (String(settings?.padding_block || 'none') as PaddingKeyword);
  const paddingInline = (String(settings?.padding_inline || 'none') as PaddingKeyword);

  // Early return if no content
  // if (!content) return null;

  return (
    <s-box paddingBlock={paddingBlock} paddingInline={paddingInline}>
      <s-query-container>
        {/* Component content */}
      </s-query-container>
    </s-box>
  );
}
```

## Notes

- Always use TypeScript (`.tsx`) files, never `.jsx`
- Only Polaris web components work - HTML elements (`<div>`, `<span>`, `<style>`, `<script>`) will NOT render
- Always wrap responsive content in `<s-query-container>` when using container queries
- Use `normalizeImageSize()` for all image size settings
- Follow snake_case naming convention for all setting keys
- Padding settings must always be at the bottom of settings sections
