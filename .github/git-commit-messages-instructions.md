# GitHub Copilot Custom Instructions - Git Conventional Commit Messages

These instructions guide GitHub Copilot in generating Git commit messages for Next.js projects that adhere to the Conventional Commits specification.

**I. Conventional Commits Specification:**

- "Generate commit messages that follow the Conventional Commits specification ([https://www.conventionalcommits.org/en/v1.0.0/](https://www.conventionalcommits.org/en/v1.0.0/))."
- "Structure commit messages with a type, an optional scope, and a description: `<type>[optional scope]: <description>`"
- "A complete commit message follows this structure:"

  ```
  <type>[optional scope]: <description>

  [optional body]

  [optional footer(s)]
  ```

- "Separate the header from the optional body and footer with a blank line."

**II. Commit Message Structure:**

- **Header:**
  - **Type:**
    - "Use one of the following types (in lowercase) based on these specific criteria:"
      - `feat`: **NEW FUNCTIONALITY** - Adding new features, pages, components, or capabilities that provide value to users. Examples:
        - Adding a new page (`app/quiz/page.tsx`, `app/admin/questions/new/page.tsx`)
        - Creating new React components (QuizCard, QuestionForm, ProgressChart)
        - Implementing new API routes (`app/api/questions/route.ts`, `app/api/quiz/[id]/route.ts`)
        - Adding new UI components from shadcn/ui (`npx shadcn add button`)
        - Creating new hooks (useQuizSession, useQuestions, useAuth)
        - Implementing new layouts or route groups (`app/(dashboard)/layout.tsx`)
        - Adding new TypeScript types or interfaces (Question, QuizSession, UserProgress)
        - Creating new middleware (auth, rate limiting, CORS)
      - `fix`: **BUG RESOLUTION** - Correcting existing functionality that was not working as intended. Examples:
        - Fixing incorrect quiz scoring logic
        - Resolving navigation issues in route groups
        - Correcting TypeScript type errors or validation bugs
        - Fixing hydration errors in Server/Client components
        - Resolving API route response formatting issues
        - Correcting incorrect Tailwind class applications
        - Fixing authentication state management bugs
        - Resolving image optimization or loading issues
      - `refactor`: **CODE IMPROVEMENT WITHOUT BEHAVIOR CHANGE** - Restructuring existing code without changing its external behavior or adding new features. Examples:
        - Extracting components for better reusability (QuestionItem from QuizPage)
        - Converting Client Components to Server Components (removing "use client")
        - Reorganizing file structure within `app/` or `components/`
        - Simplifying component logic while maintaining same output
        - Renaming variables/functions for clarity
        - Moving shared logic to custom hooks
        - Converting inline styles to Tailwind utilities
        - Refactoring API route handlers for better organization
        - Removing unused imports or dependencies
      - `perf`: **PERFORMANCE OPTIMIZATION** - Code changes that specifically improve performance without adding new features. Examples:
        - Implementing dynamic imports or code splitting
        - Adding React.memo or useMemo optimizations
        - Optimizing images with Next.js Image component
        - Implementing Incremental Static Regeneration (ISR)
        - Adding caching strategies (API routes, data fetching)
        - Reducing bundle size by tree-shaking or lazy loading
        - Optimizing database queries (DynamoDB, AppSync)
      - `build`: **BUILD SYSTEM & INFRASTRUCTURE** - Changes that affect the build system, external dependencies, or infrastructure as code. Examples:
        - **npm/package changes**: Updating dependencies in package.json
        - **Build configuration**: Modifying next.config.ts, tsconfig.json, webpack config
        - **Terraform/IaC**: Creating or modifying Terraform modules (DynamoDB tables, Lambda functions, IAM roles)
        - **Infrastructure scripts**: AWS CDK, CloudFormation templates, deployment scripts
        - **Docker**: Dockerfile changes, docker-compose configurations
        - **Environment configuration**: .env files, AWS Amplify configuration
        - **NOTE**: Use `build(terraform):`, `build(lambda):`, `build(dynamodb):` scopes for clarity
      - `ci`: **CI/CD & AUTOMATION** - Changes to continuous integration/deployment configuration files and scripts. Examples:
        - **GitHub Actions**: Workflow files (.github/workflows/\*.yml)
        - **AWS Amplify**: Deployment configuration (amplify.yml)
        - **Deployment pipelines**: CodePipeline, CodeBuild configurations
        - **Automation scripts**: Pre-commit hooks, deployment automation
        - **Testing automation**: E2E test runs, coverage reporting setup
      - `docs`: **DOCUMENTATION ONLY** - Changes exclusively to documentation files. Examples:
        - Modifying Markdown (.md) files (README.md, TECHNICAL-ROADMAP.md, git-commit-messages-instructions.md, etc.)
        - Updating inline code comments or JSDoc documentation
        - Updating API documentation or usage examples
        - **CRITICAL**: If a .md file is modified, the type MUST be `docs`, NOT `refactor(docs)` or any other type
        - **CRITICAL**: Even if adding NEW documentation files (.md), use `docs`, NOT `feat`
      - `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semicolons, Prettier formatting, etc.).
      - `test`: Adding missing tests or correcting existing tests (Vitest unit tests, Playwright E2E tests).
      - `revert`: Reverts a previous commit (use footer to reference reverted commits).
      - `chore`: Miscellaneous commits. Other changes that don't modify `src`/`app` or test files. Examples:
        - .gitignore modifications
        - IDE configuration files (.vscode/settings.json, .idea/, etc.)
        - Editor configuration files (.editorconfig, .prettierrc, etc.)
        - GitHub-specific files (.github/CODEOWNERS, .github/dependabot.yml, etc.)
        - Package manager lock files (package-lock.json, yarn.lock, pnpm-lock.yaml)
        - License files, contribution guides (if not primary documentation)
    - "**IMPORTANT**: If you're restructuring code without adding new functionality or changing behavior, use `refactor`, NOT `feat`."
    - "**CRITICAL FOR DOCUMENTATION**: If modifying ONLY .md files or documentation, use `docs` type, NEVER `refactor(docs)` or `feat(docs)` or other types. This applies even when ADDING NEW .md files."
    - "**CRITICAL FOR IDE/EDITOR CONFIG**: Changes to IDE/editor configuration files (.vscode/, .idea/, .editorconfig) should use `chore`, NOT `feat` or `build`."
    - "If none of the types apply, use 'chore'."
  - **Scope (Optional but Strongly Recommended for this project):**
    - "**STRONGLY RECOMMENDED to include a scope** to provide context about what part of the codebase was affected."
    - "Scope is OPTIONAL per Conventional Commits spec, but provides valuable context."
    - "Use the following scope hierarchy for Next.js projects (most specific applicable level):"
      - **App Directory Level**: `app`, `components`, `lib`, `types`, `public`
      - **Feature/Page Level**: `quiz`, `admin`, `auth`, `dashboard`, `landing`, `api`
      - **Route Group Level**: `(auth)`, `(dashboard)`, `admin`
      - **Component Category Level**: `ui`, `layout`, `middleware`, `hooks`, `utils`
      - **Infrastructure Level**: `terraform`, `lambda`, `graphql`, `cognito`, `dynamodb`
    - "**Scope Examples for Next.js AWS Quiz Platform:**"
      - `feat(quiz): add multiple-choice question component`
      - `fix(api): correct quiz session scoring logic`
      - `refactor(components): extract question card to separate file`
      - `perf(app): implement dynamic imports for admin pages`
      - `test(hooks): add unit tests for useQuizSession`
      - `docs(README): update local development setup guide`
      - `feat(admin): add question approval workflow`
      - `fix(auth): resolve Cognito token refresh issue`
      - `refactor(lib): simplify GraphQL client configuration`
      - `feat(terraform): add EventBridge scheduled rules`
    - "If the change affects multiple scopes, use the most general applicable scope or omit parentheses for cross-cutting changes."
  - **Description:**
    - "A concise description of the change in imperative, present tense (e.g., 'fix: correct typos in documentation', not 'fixed typos...')."
    - "Capitalize the first letter of the description."
    - "Do not end the description with a period."
    - "Limit the description to 50 characters."
- **Body (Optional but Recommended for Complex Changes):**
  - "**WHEN TO INCLUDE BODY:**"
    - "**REQUIRED when modifying multiple files** unless the title is self-explanatory"
    - "When the change needs explanation beyond the title"
    - "When explaining WHY the change was made (motivation)"
    - "When describing the impact or side effects"
    - "For complex refactoring or architectural changes"
  - "**WHEN BODY CAN BE OMITTED:**"
    - "Simple, self-explanatory single-file changes"
    - "The title completely describes the change"
    - "Trivial fixes or updates (e.g., 'docs: fix typo in README')"
  - "**BODY FORMAT AND STYLE:**"
    - "Write in **past tense** (describe what was done, not what to do)"
    - "Examples: 'Added feature X', 'Implemented Y', 'Fixed Z', 'Updated configuration'"
    - "Use complete sentences with proper capitalization and punctuation"
    - "Wrap lines at 72 characters for readability"
    - "Separate paragraphs with blank lines for better structure"
  - "**LISTING MODIFIED FILES:**"
    - "For **2-10 files**: List files with brief description of changes"
    - "Format: 'Modified files (X):' or 'Affected files (X):' followed by bulleted list"
    - "Use `-` (hyphen) for bullet points, not `•`"
    - "Example format: `- FileName.cs: Brief description of change`"
    - "File descriptions should use past tense (e.g., 'Added method', 'Updated logic')"
    - "For **>10 files**: Group by layer/component instead of listing all files"
    - "Example: 'This change spans multiple layers (15 files modified):'"
    - "Then list high-level changes by component/layer, not individual files"
    - "For **1 file**: Generally omit file listing (it's in the commit diff)"
  - "Explain the motivation for the change and how it differs from previous behavior."
  - "For significant changes, include performance metrics, testing notes, or migration guidance."
- **Footer (Optional):**
  - "Use the footer to reference issue trackers, breaking changes, or other metadata."
  - "**Breaking Changes:** Start with `BREAKING CHANGE: ` (or `BREAKING-CHANGE:`) followed by a description. Alternatively, append `!` after type/scope (e.g., `feat!:` or `feat(api)!:`)."
  - "**Issue References:** Use `Closes #issueNumber`, `Fixes #issueNumber`, `Resolves #issueNumber` to link to issues."
  - "**Other Footers:** May include `Reviewed-by:`, `Refs:`, `Acked-by:`, etc. following git trailer format."

**II.A. Breaking Changes - Detailed Guidelines:**

**When to Mark as BREAKING CHANGE (correlates with MAJOR version bump):**

A breaking change is ANY modification that requires consumers of your code to make changes to their codebase. Use `BREAKING CHANGE:` footer or `!` suffix when:

**1. API Contract Changes:**

- **Changing method signatures:**
  - Removing parameters from public methods
  - Changing parameter types or order
  - Changing return types
  - Example: `UpdateTask(int id, string title)` → `UpdateTask(int id, TaskUpdateDto dto)`
- **Removing or renaming public APIs:**
  - Deleting public methods, properties, or classes
  - Renaming interfaces (e.g., `ITaskService` → `ITaskAgentService`)
  - Removing endpoints (e.g., deleting `GET /api/tasks/legacy`)
- **Changing HTTP response structures:**
  - Removing fields from JSON responses
  - Changing field types (e.g., `"id": 123` → `"id": "abc-123"`)
  - Renaming response properties (e.g., `taskName` → `title`)
  - Example: `{ "id": 1, "name": "Task" }` → `{ "id": 1, "title": "Task", "metadata": {} }`

**2. Behavior Changes:**

- **Changing default behavior:**
  - Modifying default values that affect functionality
  - Changing validation rules that reject previously valid input
  - Altering error handling that changes response codes
  - Example: Changing default task status from "Pending" to "Draft"
- **Changing business logic:**
  - Modifying core algorithms that produce different results
  - Changing authorization/authentication requirements
  - Altering data persistence behavior (e.g., soft delete → hard delete)

**3. Data/Database Changes:**

- **Schema changes requiring migration:**
  - Removing database columns
  - Changing column types (e.g., `int` → `string`)
  - Adding non-nullable columns without defaults
  - Renaming tables or columns that break existing queries
- **Data format changes:**
  - Changing serialization format (JSON → XML)
  - Modifying date/time formats
  - Changing enum values or their numeric representations

**4. Configuration Changes:**

- **Removing or renaming configuration keys:**
  - `appsettings.json` key changes requiring user updates
  - Environment variable name changes
  - Example: `AzureOpenAI:ApiKey` → `Azure:OpenAI:Key`
- **Changing required configuration:**
  - Adding new required settings without defaults
  - Removing previously optional settings that become required

**5. Dependency Changes:**

- **Major framework version upgrades:**
  - .NET 8 → .NET 9 or .NET 9 → .NET 10
  - Entity Framework Core 8 → 9
  - Example: Upgrading to new SDK version with incompatible APIs
- **Removing dependencies:**
  - Removing packages that consumers might rely on
  - Changing database providers (SQL Server → PostgreSQL)

**6. Authentication/Authorization Changes:**

- **Changing security requirements:**
  - Adding authentication to previously public endpoints
  - Changing permission models or role requirements
  - Modifying token formats or validation rules

**When NOT to mark as BREAKING CHANGE:**

❌ **Pure refactoring (no external impact):**

- Internal code reorganization (moving files, renaming private methods)
- Extracting private helper classes
- Improving internal algorithms with same output
- Example: `refactor(Infrastructure): extract agent instructions to builder class` (internal change only)

❌ **Backward-compatible additions:**

- Adding new optional parameters with defaults
- Adding new methods/endpoints without removing existing ones
- Adding new properties to responses (additive only)
- Example: `feat(api): add optional filter parameter to GET /api/tasks` (old code still works)

❌ **Bug fixes that restore intended behavior:**

- Fixing incorrect validation that was a bug
- Correcting calculation errors
- Example: `fix(Domain): correct task priority validation logic` (fixing broken behavior)

❌ **Internal dependency updates (no API changes):**

- Updating packages that don't affect public API
- Minor/patch version bumps of dependencies
- Example: `build: update Newtonsoft.Json from 13.0.1 to 13.0.3`

❌ **Performance improvements (same behavior):**

- Optimizing queries or algorithms
- Adding caching or indexes
- Example: `perf(Infrastructure): add database indexes for task queries` (faster, but same results)

**Breaking Change Examples for Next.js AWS Quiz Platform:**

```
feat(api)!: change question response format to include metadata

BREAKING CHANGE: Question API responses now include a metadata object.
The response structure has changed from:
{
  "id": "DEV-ASSOC#Q001",
  "questionText": "What is...",
  "options": [...]
}

To:
{
  "id": "DEV-ASSOC#Q001",
  "questionText": "What is...",
  "options": [...],
  "metadata": {
    "difficulty": "medium",
    "tags": ["ec2", "networking"],
    "lastUpdated": "2025-10-30"
  }
}

Clients must update their response parsing to handle the new structure.
```

```
refactor!: rename useQuiz to useQuizSession

BREAKING CHANGE: The hook useQuiz has been renamed to
useQuizSession for better clarity. All components using
this hook must update their imports.

Migration:
- Update imports: import { useQuizSession } from '@/hooks/useQuizSession'
- Replace all useQuiz() calls with useQuizSession()
- Update mock objects in tests
```

```
build!: upgrade to Next.js 16

BREAKING CHANGE: Project now uses Next.js 16. Consumers must:
- Update Node.js to version 20.x or higher
- Run npm install to update dependencies
- Review breaking changes in Next.js 16 release notes
- Update any custom server configurations

This change enables use of new React 19 features and
improved Server Components performance.
```

```
feat(api)!: remove deprecated /api/quiz/start endpoint

BREAKING CHANGE: Removed the deprecated /api/quiz/start endpoint.
Use POST /api/quiz/sessions instead.

Migration path:
- Replace POST /api/quiz/start requests
- With POST /api/quiz/sessions using new request format
- New endpoint returns sessionId in response body

Closes #78
```

```
fix(auth)!: correct Cognito token validation logic

BREAKING CHANGE: Token validation now strictly enforces
token expiration times. Previously expired tokens were
accepted with a 5-minute grace period.

Impact:
- Clients must implement proper token refresh logic
- Sessions will expire exactly at token expiration time
- Add token refresh calls before expiration

This fixes a security vulnerability where expired tokens
were incorrectly accepted.

Fixes #134
```

**Decision Tree for Breaking Changes:**

1. **Does it remove or rename public APIs?** → BREAKING CHANGE
2. **Does it change HTTP request/response structures?** → BREAKING CHANGE
3. **Does it require consumers to modify their code?** → BREAKING CHANGE
4. **Does it change database schema in a non-compatible way?** → BREAKING CHANGE
5. **Does it change configuration keys or requirements?** → BREAKING CHANGE
6. **Does it upgrade major framework versions (e.g., .NET 9 → 10)?** → BREAKING CHANGE
7. **Does it change authentication/authorization requirements?** → BREAKING CHANGE
8. **Is it an internal refactor with no external impact?** → NOT breaking
9. **Does it add optional features without removing existing ones?** → NOT breaking
10. **Does it fix a bug to restore intended behavior?** → NOT breaking (usually)

**III. Commit Message Examples:**

**Basic Examples (Single File Changes):**

- `feat(quiz): add question timer component`
- `fix(api): correct multiple-choice scoring calculation`
- `refactor(components): extract progress bar to ui folder`
- `perf(app): optimize quiz page with Server Components`
- `test(hooks): add tests for useAuth hook`
- `docs: update deployment instructions`
- `docs(README): add Terraform setup prerequisites`
- `build(terraform): add DynamoDB table for quiz sessions`
- `build(lambda): update Node.js runtime to version 20`
- `ci(amplify): configure deployment branch settings`

**Examples with Breaking Changes:**

- `feat(api)!: change question response format to include metadata`
- `refactor!: rename QuizService to QuizSessionService`
- `build(terraform)!: migrate DynamoDB from provisioned to on-demand`

**Detailed Examples with Body (Multi-file or Complex Changes):**

```
feat(quiz): add interactive quiz interface with timer

Implemented complete quiz experience including question
navigation, answer selection, timer countdown, and progress
tracking. Supports single-choice, multiple-choice, and
true/false question types.

Modified files (4):
- app/quiz/page.tsx: Created main quiz interface
- components/quiz/QuestionCard.tsx: Question display component
- components/quiz/QuizTimer.tsx: Countdown timer component
- hooks/useQuizSession.ts: Quiz state management hook

Closes #23
```

```
refactor(components): migrate Client Components to Server Components

Converted several components from Client Components to Server
Components to improve initial page load performance. Moved
interactive logic to smaller client-side components.

Affected files (5):
- app/page.tsx: Removed "use client" directive
- components/landing/Features.tsx: Now Server Component
- components/landing/TechStack.tsx: Now Server Component
- components/ui/card.tsx: Kept as Client Component (interactive)
- lib/utils.ts: Added server-side helper functions

This change reduces the client-side JavaScript bundle by ~45KB
while maintaining the same user experience.
```

```
perf(app): implement dynamic imports for admin routes

Added dynamic imports with loading fallbacks for all admin
pages to reduce initial bundle size. Admin features are now
loaded on-demand when users access the admin panel.

Modified files (3):
- app/admin/layout.tsx: Added Suspense boundaries
- app/admin/questions/page.tsx: Wrapped in dynamic import
- components/admin/LoadingSkeleton.tsx: New loading component

Performance tests showed 60% reduction in initial page load
time for non-admin users.

Refs: #67
```

```
feat(api): implement GraphQL quiz session mutations

Added complete CRUD operations for quiz sessions through
AppSync GraphQL API. Includes session creation, answer
submission, and score calculation endpoints.

This change spans multiple layers (8 files modified):
- API routes: New GraphQL mutation handlers
- TypeScript types: Added QuizSession and Answer types
- Lib folder: GraphQL client configuration and queries
- Components: Updated to use new API endpoints

Key changes:
- Created createQuizSession mutation
- Implemented submitAnswer mutation with validation
- Added calculateScore resolver with multi-answer logic
- Integrated with DynamoDB for session persistence
- Added optimistic updates for better UX

Closes #34, #45
```

```
docs: update architecture and development documentation

Updated project documentation to reflect current Next.js 16
architecture patterns and AWS infrastructure setup. Added
comprehensive guide for local development environment.

Modified files (5):
- README.md: Added complete setup instructions
- articles/TECHNICAL-ROADMAP.md: Updated with Phase 1 progress
- articles/UPDATES-SUMMARY.md: Added recent decisions
- frontend/README.md: New file with Next.js specifics
- .github/copilot-instructions.md: Updated project conventions
```

```
build(terraform): add infrastructure for quiz session management

Created Terraform modules for quiz session persistence and
processing. Includes DynamoDB table with GSIs for efficient
querying and Lambda functions for background processing.

Modified files (6):
- infrastructure/terraform/dynamodb.tf: Added QuizSessions table
- infrastructure/terraform/lambda.tf: Added score-calculator function
- infrastructure/terraform/iam.tf: Created Lambda execution roles
- infrastructure/terraform/variables.tf: Added configuration variables
- infrastructure/terraform/outputs.tf: Exported resource ARNs
- infrastructure/terraform/versions.tf: Updated provider versions

Table configuration:
- Partition key: userId (String)
- Sort key: sessionId (String)
- GSI: examType-createdAt-index for filtering
- On-demand billing mode for cost optimization

Estimated cost: $5-10/month for 500 active users

Closes #56
```

```
ci(github-actions): add Terraform plan and apply workflow

Implemented CI/CD pipeline for infrastructure changes with
automated validation, cost estimation, and deployment to
staging and production environments.

Modified files (2):
- .github/workflows/terraform.yml: New workflow file
- .github/workflows/terraform-plan.yml: PR preview workflow

Features:
- Automatic terraform plan on pull requests
- Manual approval required for production deployments
- Infracost integration for cost estimates
- Slack notifications for deployment status

Refs: #78
```

```
build(lambda): upgrade background question generator

Updated Python Lambda for Bedrock integration with improved
error handling and retry logic. Increased memory to 2048MB
for better Claude 3.5 Sonnet performance.

Modified files (4):
- lambdas/background-question-generator/handler.py: Added retry logic
- lambdas/background-question-generator/requirements.txt: Updated boto3
- infrastructure/terraform/lambda.tf: Increased memory allocation
- infrastructure/terraform/eventbridge.tf: Added error DLQ

Performance improvements:
- Reduced cold start time by 40%
- Added exponential backoff for Bedrock throttling
- Implemented batch processing for 50 questions

Fixes #92
```

**Cross-Layer Examples:**

- `feat: add Cognito authentication with protected routes`
- `fix: resolve hydration mismatch in quiz session`
- `refactor: standardize error handling across API routes`

**Common Mistakes to Avoid - CRITICAL:**

❌ **INCORRECT USAGE OF `feat` FOR NON-FUNCTIONAL CHANGES:**

- `feat: add git commit message instructions` → Should be `docs: add git commit message guidelines`
- `feat: configure VS Code settings` → Should be `chore: configure VS Code settings`
- `feat: add .editorconfig file` → Should be `chore: add .editorconfig file`
- `feat: update README with setup guide` → Should be `docs: update README with setup guide`
- `feat(.vscode): add Copilot settings` → Should be `chore(.vscode): configure Copilot settings`

✅ **CORRECT USAGE:**

- `docs: add comprehensive commit message guidelines` (for .md files)
- `docs(README): update local development instructions` (for .md files)
- `chore(.vscode): configure GitHub Copilot instructions` (for IDE config)
- `chore: add .editorconfig for consistent formatting` (for editor config)
- `chore(.github): update CODEOWNERS file` (for GitHub config)

**Rule of Thumb:**

- If it's **documentation** (.md files, comments, JSDoc) → `docs`
- If it's **IDE/editor configuration** (.vscode/, .idea/, .editorconfig) → `chore`
- If it's **build system** (package.json, tsconfig, webpack) → `build`
- If it's **CI/CD** (GitHub Actions, Amplify config) → `ci`
- If it adds **code functionality** (components, pages, APIs, hooks) → `feat`

**Handling Commits with Multiple Change Types:**

- "Each commit should be as atomic as possible, addressing a single concern. A single commit must only have one type."
- "If a commit includes multiple types of changes (e.g., a new feature and a refactor), choose the type that represents the primary purpose of the commit. The hierarchy is generally `feat` > `fix` > `perf` > `refactor`."
- "**Example**: If you add a new component and also refactor some old code in the same file, the commit type must be `feat`."
  - `feat(quiz): add question navigation component` (even if it involved refactoring)
- "**AVOID** creating a single commit message that lists multiple types. A commit has ONE type."
- "**INCORRECT**: `feat: add component, refactor: simplify logic`"
- "**CORRECT**: `feat(quiz): add question filter with improved state logic` (This is the main change, even if refactoring was done)"

```

**Cross-Layer Examples:**

- `feat: add content safety middleware with 4-layer protection`
- `fix: resolve thread management in AI agent service`
- `refactor: standardize error handling across all layers`

**Handling Commits with Multiple Change Types:**

- "Each commit should be as atomic as possible, addressing a single concern. A single commit must only have one type."
- "If a commit includes multiple types of changes (e.g., a new feature and a refactor), choose the type that represents the primary purpose of the commit. The hierarchy is generally `feat` > `fix` > `perf` > `refactor`."
- "**Example**: If you add a new feature and also refactor some old code in the same file, the commit type must be `feat`."
  - `feat(Application.Functions): add update task priority tool` (even if it involved refactoring)
- "**AVOID** creating a single commit message that lists multiple types. A commit has ONE type."
- "**INCORRECT**: `feat: add function, refactor: simplify entity`"
- "**CORRECT**: `feat(Application.Functions): add search tasks by priority` (This is the main change, even if refactoring was done)

**IV. Instructions for Copilot:**

- "When generating commit messages, adhere strictly to the Conventional Commits specification ([https://www.conventionalcommits.org/en/v1.0.0/](https://www.conventionalcommits.org/en/v1.0.0/))."
- "**CRITICAL**: Distinguish carefully between `feat` and `refactor`:"
  - "Use `feat` ONLY when adding NEW functionality or capabilities"
  - "Use `refactor` when improving existing code structure without changing behavior"
  - "If restructuring code for better architecture = `refactor`"
  - "If adding new components, pages, or API routes = `feat`"
- "**CRITICAL FOR INFRASTRUCTURE CHANGES**: Use `build:` type for all infrastructure-as-code and build system changes:"
  - "✅ CORRECT: `build(terraform): add DynamoDB table for quiz sessions`"
  - "✅ CORRECT: `build(lambda): update runtime to Node.js 20`"
  - "✅ CORRECT: `build: upgrade Next.js to version 16`"
  - "✅ CORRECT: `build(docker): add multi-stage build configuration`"
  - "❌ INCORRECT: `feat(terraform): add DynamoDB table` (unless it's a new feature that includes infrastructure)"
  - "❌ INCORRECT: `chore(infrastructure): update Lambda memory`"
  - "**Rule**: If the primary change is infrastructure/build configuration, use `build:`"
  - "**Use scopes**: `build(terraform):`, `build(lambda):`, `build(dynamodb):`, `build(cognito):`, `build(npm):`"
- "**CRITICAL FOR CI/CD CHANGES**: Use `ci:` type for automation and deployment pipelines:"
  - "✅ CORRECT: `ci(github-actions): add Terraform deployment workflow`"
  - "✅ CORRECT: `ci(amplify): configure build settings`"
  - "❌ INCORRECT: `build(github-actions): add workflow` (workflows are CI, not build)"
- "**CRITICAL FOR DOCUMENTATION FILES**: When ONLY .md files are modified, use `docs` type, NEVER `refactor(docs)` or other combinations. Examples:"
  - "✅ CORRECT: `docs: update README with setup steps`"
  - "✅ CORRECT: `docs(README): add AWS configuration guide`"
  - "✅ CORRECT: `docs: add git commit message guidelines` (even when creating NEW .md file)"
  - "❌ INCORRECT: `refactor(docs): update README`"
  - "❌ INCORRECT: `chore(docs): update documentation`"
  - "❌ INCORRECT: `feat: add commit message instructions` (if it's just a .md file)"
- "**CRITICAL FOR IDE/EDITOR CONFIG**: Changes to .vscode/, .idea/, .editorconfig, or similar IDE/editor configuration files should use `chore` type:"
  - "✅ CORRECT: `chore: configure VS Code settings for Copilot`"
  - "✅ CORRECT: `chore(.vscode): add GitHub Copilot instructions`"
  - "❌ INCORRECT: `feat: add VS Code settings`"
  - "❌ INCORRECT: `build: configure IDE settings`"
- "**STRONGLY RECOMMENDED to include a scope** using the Next.js project hierarchy"
- "For Next.js AWS Quiz Platform, common scopes include:"
  - "Feature level: `quiz`, `admin`, `auth`, `dashboard`, `landing`"
  - "Directory level: `app`, `components`, `lib`, `types`, `api`"
  - "Component category: `ui`, `hooks`, `middleware`, `utils`"
  - "Infrastructure: `terraform`, `lambda`, `graphql`, `cognito`, `dynamodb`"
- "Use specific scopes like `(auth)`, `(dashboard)` for route groups when appropriate"
- "For API routes, use scope like `api/questions` or just `api` for general API changes"
- "Write descriptions in imperative, present tense with capital first letter"
- "Limit header to 50 characters, body lines to 72 characters"
- "**INCLUDE BODY when:**"
  - "Multiple files are modified (unless title is completely self-explanatory)"
  - "Complex changes that need explanation"
  - "Explaining WHY (motivation) not just WHAT"
  - "**ALWAYS include body when marking BREAKING CHANGE** to explain impact and migration path"
- "**OMIT BODY when:**"
  - "Single file, simple change"
  - "Title is completely self-explanatory"
  - "Trivial updates (e.g., 'docs: fix typo')"
- "**BODY WRITING STYLE - CRITICAL:**"
  - "**Header (title)**: Use IMPERATIVE PRESENT tense (e.g., 'add feature', 'fix bug', 'update config')"
  - "**Body**: Use PAST TENSE (e.g., 'Added feature', 'Fixed bug', 'Updated config')"
  - "Body describes what WAS done, header describes what the commit DOES"
  - "Use `-` (hyphen) for bullet points in body, NEVER `•` or other symbols"
  - "File listings format:"
    - "2-10 files: List each file with hyphen. Example: `- FileName.cs: Added method`"
    - ">10 files: Group by layer/component, don't list all files individually"
  - "Example for many files:"
    - "❌ DON'T: List all 15 files individually (too verbose)"
    - "✅ DO: 'This change spans multiple layers (15 files modified):'"
    - "Then describe by component: 'Application layer: New DTOs and services'"
  - "Wrap lines at 72 characters for readability"
- "**BREAKING CHANGES - Critical Decision Guide:**"
  - "Use `BREAKING CHANGE:` footer or `!` suffix when consumers MUST modify their code"
  - "**Ask yourself**: Would existing code that uses this API/endpoint/interface still work?"
  - "**If NO** (requires consumer changes) → BREAKING CHANGE"
  - "**If YES** (backward compatible) → NOT breaking"
  - "Common breaking changes:"
    - "Removing/renaming public APIs, methods, properties, endpoints"
    - "Changing HTTP response structures (removing/renaming fields)"
    - "Changing method signatures (parameters, return types)"
    - "Major framework upgrades (.NET 9 → .NET 10)"
    - "Removing/renaming configuration keys in appsettings.json"
    - "Changing database schema (removing columns, changing types)"
    - "Changing authentication/authorization requirements"
  - "NOT breaking changes:"
    - "Internal refactoring (private methods, file organization)"
    - "Adding optional parameters with defaults"
    - "Adding new methods/endpoints (keeping existing ones)"
    - "Performance improvements (same behavior/output)"
    - "Bug fixes restoring intended behavior"
    - "Minor dependency updates without API changes"
  - "**Format**: Use `type(scope)!: description` OR add footer `BREAKING CHANGE: explanation`"
  - "**Body REQUIRED**: Explain what breaks, why, and how to migrate"
- "Use footer for breaking changes (`BREAKING CHANGE: ` or `!` in header) and issue references (`Closes #123`)"
- "When in doubt between types, prefer the more specific type (e.g., `perf` over `refactor` for performance improvements)"

**V. Next.js AWS Quiz Platform Specific Guidelines:**

**Common Scenarios and Correct Types:**

1. **Adding new functionality (`feat`):**

   - New pages in app directory (`app/quiz/page.tsx`, `app/admin/questions/new/page.tsx`)
   - New React components (QuizCard, QuestionForm, ProgressChart, AdminPanel)
   - New API routes (`app/api/questions/route.ts`, `app/api/quiz/[id]/route.ts`)
   - New custom hooks (useQuizSession, useAuth, useQuestions)
   - New shadcn/ui component installations (`npx shadcn add table`)
   - New route groups or layouts (`app/(dashboard)/layout.tsx`)
   - New TypeScript types or interfaces (Question, QuizSession, UserProgress)
   - New middleware (authentication, rate limiting, CORS)
   - New Lambda functions for backend processing
   - New Terraform resources (DynamoDB tables, Lambda functions, EventBridge rules)

2. **Code improvements without new features (`refactor`):**

   - Extracting reusable components (QuestionItem from QuizPage)
   - Converting Client Components to Server Components (removing "use client")
   - Reorganizing file structure (moving components to subdirectories)
   - Simplifying component logic while maintaining same UI output
   - Renaming variables/functions for better clarity
   - Moving shared logic to custom hooks
   - Converting inline styles to Tailwind utility classes
   - Refactoring API route handlers for better organization
   - Consolidating duplicate GraphQL queries
   - Applying React patterns (compound components, render props)

3. **Performance improvements (`perf`):**

   - Implementing dynamic imports for code splitting
   - Adding React.memo, useMemo, or useCallback optimizations
   - Optimizing images with Next.js Image component
   - Implementing Incremental Static Regeneration (ISR)
   - Adding caching strategies (React Cache, API route caching)
   - Reducing bundle size through tree-shaking
   - Optimizing DynamoDB queries (batch operations, indexes)
   - Implementing lazy loading for admin components

4. **Bug fixes (`fix`):**

   - Correcting quiz scoring logic or calculation errors
   - Fixing navigation issues in route groups
   - Resolving TypeScript type errors or validation bugs
   - Fixing hydration mismatches between server and client
   - Correcting API route response formats
   - Fixing authentication state management issues
   - Resolving Cognito token refresh problems
   - Fixing incorrect Tailwind class applications
   - Correcting GraphQL query or mutation errors

**Scope Naming Conventions for this Project:**

- **Feature Level**: `quiz`, `admin`, `auth`, `dashboard`, `landing`, `progress`, `history`
- **Directory Level**: `app`, `components`, `lib`, `types`, `api`, `hooks`, `middleware`
- **Component Category**: `ui`, `layout`, `forms`, `charts`, `tables`
- **Infrastructure Level**: `terraform`, `lambda`, `graphql`, `cognito`, `dynamodb`, `appsync`, `amplify`
- **Route Group Level**: `(auth)`, `(dashboard)` (use parentheses in scope)

**Decision Tree for Commit Types:**

1. **Does it modify ONLY .md files or documentation?** → `docs` (NEVER `refactor(docs)` or `feat`)
2. **Does it modify IDE/editor configuration (.vscode/, .idea/, .editorconfig)?** → `chore`
3. **Does it modify infrastructure-as-code (Terraform, CloudFormation, CDK)?** → `build`
4. **Does it modify build configuration (package.json, next.config.ts, tsconfig)?** → `build`
5. **Does it modify CI/CD pipelines (GitHub Actions, Amplify workflows)?** → `ci`
6. **Does it add new user-facing functionality (pages, components, features)?** → `feat`
7. **Does it fix broken functionality or bugs?** → `fix`
8. **Does it improve performance measurably?** → `perf`
9. **Does it change code structure without changing behavior?** → `refactor`
10. **Does it add/modify tests only?** → `test`
11. **Does it change formatting/style only (Prettier, ESLint auto-fix)?** → `style`
12. **Does it revert a previous commit?** → `revert`
13. **Everything else (gitignore, misc config files)?** → `chore`

**Quick Reference for Infrastructure Changes:**

- **Terraform files** (.tf) → `build(terraform):`
- **Lambda code/config** → `build(lambda):` or `feat(lambda):` (if new functionality)
- **DynamoDB schemas** → `build(dynamodb):`
- **IAM policies** → `build(iam):`
- **EventBridge rules** → `build(eventbridge):`
- **Cognito configuration** → `build(cognito):`
- **AppSync schemas** → `build(graphql):` or `build(appsync):`
- **Amplify config** → `build(amplify):`
- **GitHub Actions workflows** → `ci(github-actions):`
- **Deployment scripts** → `ci:` or `build:` (depending on purpose)

**Multi-File Changes - Body Guidelines:**

- **Include body if:**
  - 2+ files modified (describe changes and list files if ≤10)
  - Change spans multiple layers or scopes
  - Explanation needed for WHY (not just WHAT)
  - Breaking changes or migrations involved
- **Body can be omitted if:**
  - Single file, straightforward change
  - Title like "docs: fix typo in README" is self-explanatory
  - Trivial formatting or style changes

**File Listing Best Practices:**

- **2-10 files modified:**
  - Include section: "Modified files (X):" or "Affected files (X):"
  - List each file with hyphen and brief description
  - Example: `- TaskService.cs: Added search method`
  - Use past tense for descriptions
- **>10 files modified:**
  - DON'T list all files individually (commit becomes too long)
  - State total count: "This change spans multiple layers (15 files modified):"
  - Group changes by layer/component/category
  - Example: "Application layer: New DTOs, interfaces, and service methods"
  - Example: "Infrastructure layer: Repository implementations and queries"
  - Focus on WHAT changed in each component, not listing every file
- **1 file modified:**
  - Generally omit file listing (obvious from commit diff)
  - Use body to explain WHY and HOW, not WHAT file

**Body Writing Style:**

- Header (title): Imperative present ("add feature", "fix bug")
- Body: Past tense ("Added feature", "Implemented logic", "Fixed validation")
- Bullet points: Use `-` (hyphen), not `•` or other symbols
- Line length: Wrap at 72 characters
- Paragraphs: Separate with blank lines for readability

**VI. Quick Reference: Specific File Types → Commit Types**

**ALWAYS use these mappings:**

| File/Directory | Commit Type | Scope Example | Example |
|----------------|-------------|---------------|---------|
| `*.md` (any Markdown file) | `docs` | Optional: file/section | `docs: add commit message guidelines` |
| `README.md` | `docs` | `README` | `docs(README): update setup instructions` |
| `.github/*.md` | `docs` | Optional | `docs: add contributing guidelines` |
| `.vscode/settings.json` | `chore` | `.vscode` | `chore(.vscode): configure Copilot instructions` |
| `.vscode/extensions.json` | `chore` | `.vscode` | `chore(.vscode): recommend Prettier extension` |
| `.idea/**` | `chore` | `.idea` | `chore: update IntelliJ project settings` |
| `.editorconfig` | `chore` | None | `chore: add .editorconfig for consistent formatting` |
| `.prettierrc` | `chore` | None | `chore: configure Prettier code style` |
| `.eslintrc.*` | `build` | None | `build: update ESLint configuration` |
| `.gitignore` | `chore` | None | `chore: ignore node_modules and .env files` |
| `.github/CODEOWNERS` | `chore` | `.github` | `chore(.github): update code ownership` |
| `.github/dependabot.yml` | `chore` | `.github` | `chore: configure Dependabot updates` |
| `.github/workflows/*.yml` | `ci` | `github-actions` | `ci(github-actions): add deployment workflow` |
| `package.json` (dependencies) | `build` | None | `build: upgrade Next.js to version 16` |
| `package-lock.json` | `chore` | None | `chore: update package lock file` |
| `tsconfig.json` | `build` | None | `build: enable strict TypeScript mode` |
| `next.config.ts` | `build` | None | `build: configure image optimization` |
| `terraform/**/*.tf` | `build` | `terraform` | `build(terraform): add DynamoDB table` |
| `app/**/*.tsx` (new page) | `feat` | page/feature | `feat(quiz): add quiz selection page` |
| `components/**/*.tsx` (new) | `feat` | component | `feat(ui): add progress bar component` |
| `app/api/**/*.ts` (new route) | `feat` | `api` | `feat(api): add quiz session endpoint` |

**IMPORTANT CLARIFICATIONS:**

1. **Documentation Files (.md)**:
   - ✅ `docs: add git commit guidelines` (.github/git-commit-messages-instructions.md)
   - ✅ `docs(README): update development setup`
   - ❌ NEVER `feat: add commit instructions` (even if it's a new file)

2. **IDE/Editor Configuration**:
   - ✅ `chore(.vscode): configure GitHub Copilot settings` (.vscode/settings.json)
   - ✅ `chore: add .editorconfig for code consistency`
   - ❌ NEVER `feat: add VS Code configuration`
   - ❌ NEVER `build: configure IDE settings`

3. **GitHub Configuration Files**:
   - ✅ `chore(.github): add CODEOWNERS file`
   - ✅ `ci(github-actions): add CI workflow` (for .github/workflows/*.yml)
   - ❌ NEVER `feat: add GitHub configuration`

4. **Build System vs. Chore**:
   - `build`: Affects compilation, bundling, or external dependencies (tsconfig, webpack, package.json dependencies)
   - `chore`: Affects development environment only, no impact on build (lock files, IDE settings, gitignore)

**Real-World Example from This Project:**

❌ **INCORRECT** (what was generated):
```

feat: add GitHub Copilot instructions for Conventional Commit messages

Added comprehensive guidelines for generating Git commit messages
in Next.js projects following the Conventional Commits specification.

Modified files (2):

- .github/git-commit-messages-instructions.md: Added detailed commit message guidelines
- .vscode/settings.json: Configured GitHub Copilot to use the new commit message instructions

```

✅ **CORRECT** (should be split into 2 commits OR use primary type):

**Option 1 - Split into 2 commits:**
```

docs: add comprehensive Git commit message guidelines

Added detailed instructions for generating Conventional Commit
messages in Next.js projects. Includes commit types, scopes,
body structure, and breaking change guidelines.

- .github/git-commit-messages-instructions.md: Complete guide

```

```

chore(.vscode): configure Copilot to use commit guidelines

Updated VS Code settings to use custom commit message instructions
from .github/git-commit-messages-instructions.md.

- .vscode/settings.json: Added commitMessageInstructions path

```

**Option 2 - Single commit with primary type:**
```

docs: add Git commit message guidelines and configure Copilot

Added comprehensive instructions for Conventional Commits
following the specification, and configured GitHub Copilot
to use these guidelines automatically.

Modified files (2):

- .github/git-commit-messages-instructions.md: Complete guide
- .vscode/settings.json: Configured Copilot instructions path

The primary change is documentation, so type is `docs` even
though a config file was also modified.

```

**Why this matters:**
- Commit type reflects the PRIMARY purpose of the change
- Documentation changes should be `docs`, not `feat`
- IDE configuration should be `chore`, not `feat`
- Clear commit types enable better changelog generation and semantic versioning
```
