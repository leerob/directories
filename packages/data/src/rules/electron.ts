export const electronRules = [
  {
    tags: ["Electron", "TypeScript", "Desktop"],
    title: "TypeScript, Electron, and Desktop App Cursor Rules",
    libs: ["Electron", "Electron Builder"],
    slug: "typescript-electron-desktop-app-cursor-rules",
    content: `
You are an expert in TypeScript, Electron, and Desktop App Development.

Code Style and Structure:
- Write concise, type-safe TypeScript code throughout your application.
- Structure your project into distinct layers: the main process, renderer processes, and preload scripts.
- Organize files by feature, grouping related components, modules, utilities, and styles.
- Clearly separate core application logic from UI components to enhance maintainability and testability.

Naming Conventions:
- Use camelCase for variable and function names (e.g., \`isWindowOpen\`, \`handleUserEvent\`).
- Use PascalCase for classes and components (e.g., \`MainWindow\`, \`SettingsPanel\`).
- Directory names should be lowercase and hyphenated (e.g., \`main-process\`, \`renderer-components\`).

TypeScript Usage:
- Use TypeScript for every part of your Electron application, including the main process, renderer, and preload scripts.
- Enable strict typing in \`tsconfig.json\` to catch errors early.
- Avoid using \`any\`; strive for precise types using interfaces and type aliases for props, state, and IPC message definitions.
- Leverage modern TypeScript features to improve code robustness, readability, reliability, and maintainability.

Performance Optimization:
- Offload heavy computations from the main thread by utilizing background processes or web workers.
- Optimize renderer performance by minimizing re-renders and leveraging lazy loading for non-critical modules.
- Implement efficient resource management to ensure a smooth, responsive desktop experience.
- Use Electron’s asynchronous APIs and optimize IPC (Inter-Process Communication) for fast and secure communication between processes.
- Use lazy loading for modules and components that are not immediately required.
- Optimize resource handling (e.g., images, assets) to ensure faster load times and a smoother user experience.

UI and Styling:
- Build your renderer interface using modern UI frameworks (such as React or Vue) to create dynamic, responsive UIs.
- Use consistent styling methods, whether through CSS-in-JS libraries, CSS modules, or styled-components.
- Ensure that the UI scales effectively across different desktop resolutions and operating systems.
- Optimize asset handling (e.g., images, icons) for clarity and performance.
- Utilize CSS preprocessors or CSS-in-JS libraries to keep styles organized and scalable.

Best Practices:
- Follow Electron’s security guidelines rigorously: enable context isolation, disable Node.js integration in the renderer, and use secure IPC patterns.
- Leverage Electron’s auto-update and packaging tools (like Electron Builder) to streamline deployment and updates.
- Implement comprehensive error handling with try-catch blocks, proper logging, and, if applicable, error boundaries in UI frameworks.
- Write unit and integration tests to ensure application stability and maintainability.
- Document your code and architectural decisions thoroughly to facilitate future development and debugging.

Key Conventions:
1. Adhere to a "Convention Over Configuration" approach to minimize boilerplate code.
2. Prioritize security, performance, and maintainability in every layer of your application.
3. Structure your project to clearly separate the main process, renderer processes, and preload scripts.
4. Write comprehensive tests and maintain clear documentation for long-term maintenance.
5. Leverage Electron’s built-in features and extend functionality using established patterns instead of modifying core functionality directly.
    `,
    author: {
      name: "Akinshola Samuel AKINDE",
      url: "https://github.com/thisishaykins",
      avatar: "https://gravatar.com/thisishaykins",
    },
  },
];
