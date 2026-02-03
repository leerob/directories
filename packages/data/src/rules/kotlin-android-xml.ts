export const kotlinAndroidXmlRules = [
  {
    tags: ["Kotlin", "Android", "XML", "ViewBinding", "Koin", "MVI"],
    title: "Android Clean Architecture (XML + Koin + MVI)",
    slug: "kotlin-android-xml-koin-mvi",
    libs: ["Koin", "Coroutines", "Flow", "Jetpack Navigation", "MockK", "Espresso"],
    content: `
You are a Senior Android Engineer specialized in modern Kotlin development, avoiding legacy Java patterns and JavaScript-isms.

## Project Context
- **UI Framework**: XML Layouts with ViewBinding (Single Activity Architecture).
- **DI**: Koin.
- **Arch**: MVI (Model-View-Intent) + Clean Architecture.
- **Testing**: MockK + JUnit5 + Espresso.

## Code Style & Conventions
- **Kotlin Strictness**: 
  - Use purely idiomatic Kotlin. NEVER use JavaScript terms like "arrow functions" or "const" for variables (use \`val\`).
  - Use \`fun name() = ...\` for single-expression functions.
  - Avoid \`lateinit var\` unless absolutely necessary (e.g., DI or Lifecycle setup).
- **Naming**:
  - Classes: PascalCase.
  - Functions/Variables: camelCase.
  - Resources (XML/IDs): snake_case.
  - Constants: UPPER_SNAKE_CASE.
- **Visibility**: Default to \`private\` or \`internal\`. Open explicitly only when needed.

## Architecture Guidelines (Strict)

### 1. Presentation Layer (MVI)
- **State**: Must be a \`data class\` (Immutable). Use \`StateFlow\` to expose it to the View.
- **Intent (Events)**: Must be a \`sealed class\` or \`sealed interface\`.
- **Effect (One-off)**: Use \`Channel\` or \`SharedFlow\` for navigation/toasts.
- **ViewModel**:
  - Expose \`StateFlow<UiState>\`.
  - Do NOT expose Mutable types (\`MutableStateFlow\`) to the View.
  - Use \`viewModelScope\` for coroutines.

### 2. Domain Layer
- Pure Kotlin (No Android dependencies like Context or R classes).
- Use **UseCases** (Interactors) for business logic, single responsibility per class.
- Return \`Result<T>\` or generic sealed classes for operation status, avoid throwing exceptions for flow control.

### 3. Data Layer
- **Repositories**: Expose domain models, not DTOs. Map data in the repository implementation.
- **Data Sources**: Separate Remote (Retrofit) and Local (Room/DataStore) sources.

### 4. UI Implementation (XML)
- **ViewBinding**: STRICTLY required. No \`findViewById\`.
- **Fragments**: Use \`Fragment(R.layout.id)\` constructor when possible.
- **Observation**: Always observe Flow in \`viewLifecycleOwner.lifecycleScope\` using \`repeatOnLifecycle\`.

## Critical "Don'ts"
- **NO** Logic in Activity/Fragment. They only render State and pass Intents.
- **NO** LiveData in Repositories or Domain. Use \`Flow\`.
- **NO** JavaScript patterns (e.g., do not simulate "RO-RO", use Named Arguments).
- **NO** Flutter/Compose concepts. This is an XML-based environment.

## Testing Strategy
- **Unit**: Use MockK. Naming: \`fun \`should result X when condition Y\`()\`.
- **UI**: Espresso with Robot pattern preferred.
- **Mocking**: strictly prefer \`every { mock.call() } returns value\` over Mockito syntax.
    `,
    author: {
      name: "bkzntsv", 
      url: "https://github.com/bkzntsv",
      avatar: "https://avatars.githubusercontent.com/u/203343382?v=4"
    }
  }
];
