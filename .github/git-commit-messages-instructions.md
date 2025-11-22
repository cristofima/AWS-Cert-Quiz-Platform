# GitHub Copilot Git Commit Message Guidelines

Generate [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for Next.js + AWS projects.

## Commit Structure

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Header rules:** Max 50 chars, imperative tense ("add" not "added"), lowercase type, capitalize description
**Body rules:** Past tense, wrap at 72 chars, explain WHY not what
**Footer rules:** Breaking changes (`BREAKING CHANGE:`), issue refs (`Closes #123`)

---

## Commit Types

### `feat` - New Functionality

New pages, components, API routes, hooks, types, middleware, database tables.

```
feat(quiz): add question timer component
feat(api): implement session management
feat(auth): add password reset flow
feat(hooks): add useQuizSession hook
```

### `fix` - Bug Resolution

Fixing errors, wrong logic, validation bugs, type errors, navigation issues.

```
fix(quiz): correct multiple-choice scoring
fix(api): resolve session timeout handling
fix(auth): fix Cognito token refresh loop
fix(components): resolve hydration mismatch
```

### `refactor` - Code Improvement (Same Behavior)

Extracting components, reorganizing files, simplifying logic, removing duplicates.

```
refactor(components): extract QuestionCard logic
refactor(quiz): convert to Server Component
refactor(lib): consolidate GraphQL queries
refactor(hooks): simplify useAuth state
```

### `perf` - Performance Optimization

Code splitting, memoization, caching, query optimization, lazy loading.

```
perf(app): implement dynamic imports for admin
perf(components): memoize QuestionCard rendering
perf(api): add caching to question queries
perf(graphql): implement DataLoader batching
```

### `docs` - Documentation ONLY

**CRITICAL:** ANY `.md` file change = `docs` type (even new files). Also JSDoc, comments.

```
docs: update README with setup instructions
docs(api): document GraphQL schema
docs: add architecture decision records
docs: create deployment troubleshooting guide
```

**Common mistakes:**

- ❌ `feat: add commit guidelines` → ✅ `docs: add commit guidelines`
- ❌ `chore: update README` → ✅ `docs: update README`

### `test` - Test Code

Unit tests, E2E tests, integration tests, test fixes.

```
test(hooks): add useQuizSession tests
test(components): add QuestionCard unit tests
test(e2e): add quiz flow end-to-end tests
test(api): add integration tests
```

### `build` - Build System & Infrastructure

**Infrastructure as Code, dependencies, build configs, Lambda, DynamoDB, Terraform.**

```
build(terraform): add DynamoDB table for sessions
build(lambda): update Node.js runtime to v20
build(npm): upgrade Next.js to version 15
build(iam): add Bedrock access permissions
build: update tsconfig for strict mode
```

Use specific scopes: `build(terraform):`, `build(lambda):`, `build(dynamodb):`

### `ci` - CI/CD Pipelines

GitHub Actions, Amplify, CodeBuild, deployment automation.

```
ci(github-actions): add deployment workflow
ci(amplify): configure build settings
ci: add automatic security scanning
ci(hooks): add pre-commit linting
```

### `style` - Formatting Only

Prettier, whitespace, indentation (rare, usually auto-formatted).

```
style: format all files with Prettier
style: fix indentation in components
```

### `chore` - Miscellaneous

IDE configs, .gitignore, lock files, .prettierrc, .eslintrc rules.

```
chore: update .gitignore for Next.js cache
chore(.vscode): configure Copilot settings
chore: add .editorconfig
chore(.github): add CODEOWNERS file
```

**Common mistakes:**

- ❌ `chore(terraform): add table` → ✅ `build(terraform): add table`
- ❌ `chore: update dependencies` → ✅ `build: update dependencies`

### `revert` - Revert Commit

```
revert: revert "feat(quiz): add timer"

This reverts commit abc123.
Reason: Timer causing performance issues.
```

---

## Scopes (Recommended)

**Feature-level:** `quiz`, `admin`, `auth`, `dashboard`, `api`, `landing`
**Directory-level:** `app`, `components`, `lib`, `hooks`, `types`
**Infrastructure:** `terraform`, `lambda`, `graphql`, `cognito`, `dynamodb`, `appsync`
**Component-level:** `ui`, `layout`, `forms`

Examples:

```
feat(quiz): add question navigation
fix(api/sessions): resolve race condition
refactor(lib/graphql): consolidate client config
build(terraform/dynamodb): add GSI for queries
```

Omit scope for cross-cutting changes:

```
refactor: standardize error handling
style: format all files
docs: add architecture docs
```

---

## Body Guidelines

### When to Include Body

**REQUIRED:**

- Multiple files modified (list if 2-10, group if >10)
- Complex changes needing explanation
- Breaking changes (always explain)
- Performance changes (include metrics)

**Format for 2-10 files:**

```
Modified files (5):
- app/quiz/page.tsx: Added timer component
- components/QuizTimer.tsx: New implementation
- hooks/useQuizSession.ts: Timer state management
- types/index.ts: Added TimerConfig interface
- lib/utils.ts: Time formatting helper
```

**Format for >10 files:**

```
This change spans 15 files across multiple layers:

App layer: Updated quiz pages with navigation
Component layer: Refactored question display
Library layer: Consolidated GraphQL queries
```

### When to Omit Body

- Single file, simple change
- Self-explanatory (e.g., `docs: fix typo`)
- Trivial updates

---

## Breaking Changes

Mark changes requiring consumers to modify their code.

**Format:**

```
feat(api)!: change question response format

BREAKING CHANGE: Response now includes metadata object.

Old: { id, text, options }
New: { id, text, options, metadata: { difficulty, tags } }

Migration:
- Update type definitions to include metadata
- Add null checks: response.metadata?.difficulty
- Update test fixtures

Backward compatibility until Dec 31, 2025.

Closes #156
```

**What IS breaking:**

- Removing/renaming public APIs or endpoints
- Changing request/response structures
- Modifying method signatures or types
- Removing configuration keys
- Major framework upgrades (Next.js 14 → 15)

**What is NOT breaking:**

- Internal refactoring
- Adding optional parameters (with defaults)
- Performance improvements (same output)
- Bug fixes restoring intended behavior

---

## Quick Decision Tree

1. **Only .md files?** → `docs`
2. **IDE config (.vscode/, .editorconfig)?** → `chore`
3. **Infrastructure (Terraform, Lambda)?** → `build`
4. **Build configs (tsconfig, package.json deps)?** → `build`
5. **CI/CD (GitHub Actions, Amplify)?** → `ci`
6. **New functionality?** → `feat`
7. **Fix broken functionality?** → `fix`
8. **Performance improvement?** → `perf`
9. **Code restructuring (same behavior)?** → `refactor`
10. **Tests only?** → `test`
11. **Formatting only?** → `style`
12. **Everything else?** → `chore`

---

## File Type Reference

| File Pattern                      | Type    | Example                         |
| --------------------------------- | ------- | ------------------------------- |
| `*.md`                            | `docs`  | `docs: update README`           |
| `.vscode/*`, `.editorconfig`      | `chore` | `chore: configure VS Code`      |
| `.github/workflows/*.yml`         | `ci`    | `ci: add deployment workflow`   |
| `package.json` (deps)             | `build` | `build: upgrade Next.js`        |
| `tsconfig.json`, `next.config.ts` | `build` | `build: enable strict mode`     |
| `terraform/**/*.tf`               | `build` | `build(terraform): add table`   |
| `lambdas/**/*.ts`                 | `build` | `build(lambda): update runtime` |
| `app/**/page.tsx` (new)           | `feat`  | `feat(quiz): add quiz page`     |
| `components/**/*.tsx` (new)       | `feat`  | `feat(ui): add Button`          |
| `hooks/**/*.ts` (new)             | `feat`  | `feat(hooks): add useAuth`      |

---

## Examples

### Simple Commits

```
feat(quiz): add question timer
feat(auth): implement password reset
fix(api): correct scoring calculation
fix(auth): resolve token refresh loop
refactor(lib): consolidate GraphQL client
perf(app): implement code splitting
test(hooks): add useAuth tests
docs: update deployment guide
build(terraform): add sessions table
build: upgrade Next.js to v15
ci(github-actions): add workflow
chore: update .gitignore
```

### With Body

```
feat(quiz): add interactive quiz interface

Implemented complete quiz experience with timer, navigation,
and progress tracking for all question types.

Modified files (6):
- app/quiz/[examType]/page.tsx: Main quiz page
- components/quiz/QuizContainer.tsx: Orchestration
- components/quiz/QuestionCard.tsx: Display logic
- components/quiz/QuizTimer.tsx: Timer component
- hooks/useQuizSession.ts: State management
- types/quiz.ts: Added QuizState types

Features:
- Auto-save to localStorage
- Timer warning at 5 minutes
- Keyboard shortcuts (N=next, P=prev)
- Mobile-responsive design

Closes #45
```

### Bug Fix

```
fix(api/quiz): resolve session creation race condition

Fixed duplicate session creation from rapid API calls.
Added idempotency with DynamoDB conditional expressions.

Root cause: No idempotency key validation
Solution: Client-side UUID + conditional PutItem

Modified files (3):
- app/api/quiz/sessions/route.ts: Idempotency logic
- lib/dynamodb/sessions.ts: Conditional expressions
- types/api.ts: CreateSessionRequest interface

Fixes #123
```

### Performance

```
perf(graphql): implement DataLoader for question batching

Eliminated N+1 queries when loading quiz sessions.
Reduced DynamoDB reads from 50+ to 1-2 per request.

Performance metrics (100 concurrent requests):
- Before: 2,450 reads, 3.2s avg response
- After: 48 reads, 0.4s avg response
- Cost reduction: $0.35/day → $0.01/day (97%)

Modified files (4):
- lib/graphql/loaders/QuestionLoader.ts: DataLoader
- lib/graphql/resolvers/QuizSession.ts: Use loader
- lib/graphql/context.ts: Initialize loaders
- types/graphql.ts: Loader types

Refs: #234
```

### Infrastructure

```
build(terraform): add EventBridge for background tasks

Implemented scheduled Lambda invocations for question
generation and cleanup.

Modified files (5):
- infrastructure/terraform/eventbridge.tf: Rules
- infrastructure/terraform/lambda.tf: Permissions
- infrastructure/terraform/iam.tf: Execution roles
- infrastructure/terraform/cloudwatch.tf: Log groups
- infrastructure/terraform/sqs.tf: DLQ config

Schedules:
- question-generation: Daily at 2 AM UTC
- cleanup-sessions: Daily at 3 AM UTC

Cost: +$0.50/month

Closes #89
```

---

## Common Mistakes

### Documentation

```
❌ feat: add commit guidelines → ✅ docs: add commit guidelines
❌ chore: update README → ✅ docs: update README
❌ refactor(docs): reorganize → ✅ docs: reorganize structure
```

### Infrastructure

```
❌ feat(terraform): add table → ✅ build(terraform): add table
❌ chore(lambda): update memory → ✅ build(lambda): increase memory
❌ fix(terraform): correct policy → ✅ build(iam): fix Lambda policy
```

### CI/CD

```
❌ build(github-actions): add workflow → ✅ ci(github-actions): add workflow
❌ feat(amplify): configure → ✅ ci(amplify): configure build
```

### IDE Config

```
❌ feat(.vscode): add settings → ✅ chore(.vscode): configure settings
❌ build: configure VS Code → ✅ chore: configure VS Code
```

### feat vs refactor

```
❌ feat: extract Button component → ✅ refactor: extract Button component
❌ refactor: add timer feature → ✅ feat(quiz): add timer
```

---

## Checklist Before Committing

- [ ] Type correct (used decision tree)
- [ ] Scope specific and accurate
- [ ] Description < 50 chars, imperative tense
- [ ] Body included if multiple files
- [ ] Breaking change marked with `!`
- [ ] Files listed (2-10) or grouped (>10)
- [ ] Explained WHY, not just WHAT
- [ ] Issues referenced (`Closes #123`)
- [ ] No sensitive data
- [ ] Grammar checked

---

## Key Principles

1. **Atomic commits:** One logical change per commit
2. **Type hierarchy:** When mixed: feat > fix > perf > refactor
3. **Documentation = `docs`:** ANY .md file = `docs`, no exceptions
4. **Infrastructure = `build`:** Terraform, Lambda, configs = `build`
5. **CI/CD = `ci`:** GitHub Actions, Amplify = `ci`
6. **IDE = `chore`:** .vscode, .editorconfig = `chore`
7. **Use scopes:** Adds context, helps team understand impact
8. **Breaking changes need migration guide:** Always explain impact

---

**Remember:** Clear commits enable automated changelogs and semantic versioning!
