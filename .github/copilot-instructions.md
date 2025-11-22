# AWS Certification Quiz Platform - AI Agent Instructions

> **Quick Context**: Serverless AWS exam prep platform with Next.js 16 frontend, Terraform-managed AWS infrastructure (AppSync GraphQL, Cognito, Lambda, DynamoDB), and Bedrock-powered question generation.

## 🎯 Project Status & Phase Control

**Current Phase**: `article-1` (Backend fully deployed: Cognito, AppSync, Lambda, DynamoDB in `us-east-1`)
**Next Phase**: `article-2` (Admin panel with Bedrock AI generation + EventBridge)

**Phase Progression** (controlled via `terraform apply -var="article_phase=article-X"`):

- `article-1` → Cognito + Amplify Auth only + DynamoDB + Lambda + AppSync (CURRENT)
- `article-2` → + Bedrock + EventBridge (future)

## 🏗️ Architecture & Critical Data Flows

**Security-First Design**: Questions return WITHOUT `correctAnswers` during quiz; scoring happens server-side only.

```
User Browser → Next.js 16 (App Router) → Amplify Auth (JWT) → AppSync GraphQL → Lambda → DynamoDB
                                                                                    ↓
                                                                            Bedrock (Claude 3.5)
```

**Critical Security Flow**:

1. `getQuizQuestions` (quiz-selector Lambda) strips `correctAnswers` before returning to client
2. User submits answers → `submitQuiz` (score-calculator Lambda) fetches full questions server-side
3. Scoring happens server-side only → results returned with explanations

### AWS Services Stack (us-east-1)

| Service      | Config                 | Purpose                                                  |
| ------------ | ---------------------- | -------------------------------------------------------- |
| **Cognito**  | User Pool + Groups     | Auth (Groups: Users, Admins) + Custom email templates    |
| **AppSync**  | GraphQL API            | 4 resolvers (query + mutation)                           |
| **Lambda**   | Node.js 20, 512MB, 30s | 3 functions: question selection, scoring, custom-message |
| **DynamoDB** | On-demand billing      | 3 tables: Questions, QuizSessions, UserProgress          |
| **Bedrock**  | `claude-3-5-sonnet-v2` | AI question generation (~$0.015/question)                |

**Live Resource IDs**: Always check `infrastructure/terraform/outputs.json` after deployment

## 🚀 Critical Developer Workflows

### Frontend Development

```powershell
cd frontend
npm install              # Install dependencies
npm run dev             # Dev server → http://localhost:3000
npm run build           # Production build
npm run lint            # ESLint check
npx shadcn@latest add <component>  # Add UI components
```

**Installed shadcn/ui components**: button, card, badge, radio-group, checkbox, progress, tabs, table, dialog, select, alert

**No test suite configured yet** - Tests planned for Phase 3

### Infrastructure Deployment

**⚠️ CRITICAL ORDER**: Install Lambda dependencies BEFORE Terraform (it packages them into ZIPs)

```powershell
# 1. Install Lambda deps FIRST (use build script)
.\scripts\build-lambdas.ps1
# OR manually:
cd lambdas/quiz-selector && npm install && cd ../..
cd lambdas/score-calculator && npm install && cd ../..
cd lambdas/custom-message && npm install && npm run build && cd ../..

# 2. Deploy infrastructure
cd infrastructure/terraform
terraform init
terraform plan -var="article_phase=article-2"
terraform apply -var="article_phase=article-2" -auto-approve
terraform output -json > outputs.json

# 3. Configure frontend (copy outputs to .env.local)
```

**Phase Control** (`article_phase` variable):

- `article-1` → Cognito + Amplify only
- `article-2` → + DynamoDB + Lambda + AppSync (CURRENT)
- `article-3` → + Bedrock + EventBridge (future)

**Known Issues** (see `docs/deployment/troubleshooting.md`):

- CloudWatch Alarms commented out (need IAM permission for `cloudwatch:PutMetricAlarm`)
- Cognito domain uses `cert-quiz-*` prefix (AWS rejects "aws" as reserved word)
- Amplify hosting disabled (needs `github_repository_url` variable)

### Environment Setup

Create `frontend/.env.local` from Terraform outputs (see `infrastructure/terraform/outputs.json`):

```bash
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XNLodSkoE
NEXT_PUBLIC_COGNITO_CLIENT_ID=3eiuep4c75cccvm1vrielhl799
NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT=https://ztjeab3ravhhjkwfk2fam5ud5a.appsync-api.us-east-1.amazonaws.com/graphql
NEXT_PUBLIC_AWS_REGION=us-east-1
```

**Note**: Values above are example IDs - always use current values from `terraform output -json`

### Lambda Development

**quiz-selector** (220 lines): Queries DynamoDB by `examType`, distributes questions across domains, shuffles, returns WITHOUT `correctAnswers`

**score-calculator** (373 lines): Fetches questions WITH `correctAnswers`, scores (no partial credit for multi-choice), stores sessions, updates UserProgress

**custom-message** (274 lines): Cognito trigger for customizing emails; handles `ForgotPassword` event to send reset link with embedded code in URL

**Env vars** (auto-set by Terraform): `QUESTIONS_TABLE_NAME`, `QUIZ_SESSIONS_TABLE_NAME`, `USER_PROGRESS_TABLE_NAME`, `LOG_LEVEL`, `AWS_REGION`, `FRONTEND_URL` (custom-message only)

**Development pattern**:

- Use JSDoc comments for all exported functions
- Logger utility with levels: `logger.info()`, `logger.error()`, `logger.debug()`
- Always unmarshall DynamoDB responses with `@aws-sdk/util-dynamodb`
- Return `{ statusCode, body }` format for AppSync Lambda resolvers
- **custom-message**: Must build TypeScript BEFORE Terraform (`npm run build` generates `index.js`)

### Question Generation (Python + Bedrock)

```powershell
cd scripts
pip install -r requirements.txt
python generate-questions.py --exam-type Developer-Associate --count 50 --region us-east-1
```

**Config**: Claude 3.5 Sonnet v2, 4096 tokens, temp 1.0, ~$0.015/question. Questions created with `status="pending-review"` for admin approval.

**Dependencies**: `boto3` for AWS SDK, requires Bedrock model access enabled in console for `anthropic.claude-3-5-sonnet-20241022-v2:0`

## Project-Specific Conventions

### Next.js 16 Patterns

- **TypeScript**: Strict mode, no `any` types (`tsconfig.json`)
- **Path Aliases**: `@/*` maps to root (e.g., `@/components/ui/button`)
- **Server Components**: Default; only use `"use client"` for event handlers, hooks, browser APIs
- **Route Groups**: `(auth)`, `(dashboard)` organize routes without URL impact
- **shadcn/ui**: "new-york" variant, lucide-react icons, `cn()` utility for className merging

### Component Organization

```
components/
├── ui/          # shadcn primitives (install via CLI)
├── quiz/        # QuizSelector.tsx, QuestionCard.tsx
├── admin/       # Admin components (Phase 3)
└── auth/        # Auth forms + HomeRedirect.tsx
```

**Naming convention**: PascalCase for components, kebab-case for directories

### GraphQL Client Pattern

**Auto JWT injection** in `lib/graphql/client.ts`:

```typescript
const session = await fetchAuthSession();
const token = session.tokens?.idToken?.toString();
// Token sent in Authorization header to AppSync
```

**Usage**:

```typescript
import { graphqlRequest } from "@/lib/graphql/client";
import { GET_QUIZ_QUESTIONS } from "@/lib/graphql/queries";

const { questions } = await graphqlRequest({
  query: GET_QUIZ_QUESTIONS,
  variables: { examType: "Developer-Associate", questionCount: 20 },
});
```

### TypeScript Types

Import from `@/types/index.ts`:

- `QuestionType`: "single-choice" | "multiple-choice" | "true-false" | "scenario-based"
- `ExamType`: "Developer-Associate" | "Solutions-Architect-Associate" | "SysOps-Administrator-Associate"
- `QuestionStatus`: "pending" | "approved" | "rejected" | "archived"

**Question IDs**: Format is `ExamType#Q<number>` for DynamoDB queries

### Authentication

**User Roles**: `Users` (default), `Admins` (manual via CLI)

**Promote to admin**:

```powershell
aws cognito-idp admin-add-user-to-group `
  --user-pool-id us-east-1_XNLodSkoE `
  --username user@example.com `
  --group-name Admins `
  --region us-east-1
```

**Forgot Password Flow** (Industry-standard UX):

1. User enters email on `/forgot-password` → receives email with reset link
2. Email contains: Reset button + 6-digit code (visible as fallback)
3. Link format: `/reset-password?code=123456&email=user@example.com`
4. Form auto-fills email/code from URL params (one-click UX)
5. User enters new password → success toast → auto-redirect to `/login`

**Implementation**: CustomMessage Lambda (`lambdas/custom-message`) triggered by Cognito `ForgotPassword` event generates HTML email with embedded reset link. See `docs/development/forgot-password-flow.md` for security best practices.

### Color System

See `docs/development/colors.md`. Key tokens:

- Primary: AWS Orange (`oklch(0.72 0.17 50)`)
- Secondary: AWS Blue (`oklch(0.55 0.15 250)`)
- Use semantic tokens: `bg-primary`, `text-muted-foreground`, `border-input`

## Key Files Reference

### Configuration

- `infrastructure/terraform/outputs.json` - Live AWS resource IDs
- `infrastructure/terraform/schema.graphql` - AppSync GraphQL schema (4 resolvers)
- `docs/deployment/troubleshooting.md` - Known deployment issues
- `frontend/types/index.ts` - TypeScript type definitions
- `frontend/lib/graphql/client.ts` - GraphQL client with auto JWT
- `frontend/lib/graphql/queries.ts` - Query/mutation definitions

### Lambda Functions

- `lambdas/quiz-selector/index.ts` - Question selection + distribution
- `lambdas/score-calculator/index.ts` - Scoring + analytics
- `lambdas/custom-message/index.ts` - Cognito email customization (TypeScript → compile to `index.js`)

### Scripts

- `scripts/generate-questions.py` - Bedrock AI generation
- `scripts/seed-questions.py` - Batch DynamoDB upload
- `scripts/build-lambdas.ps1` - Builds all Lambda functions (installs deps + compiles TypeScript)

## Common Pitfalls

1. **Lambda Dependencies**: Install `node_modules` locally BEFORE `terraform apply` (Terraform packages into ZIPs)
2. **Bedrock Access**: Ensure model access in `us-east-1` for `claude-3-5-sonnet-v2`
3. **Cognito Groups**: Users NOT auto-added to `Admins`; use AWS CLI manually
4. **Question IDs**: Must follow `ExamType#Q<number>` format for DynamoDB querying
5. **Cost Monitoring**: Bedrock ~$0.015/question ($18 for 1,200 questions)

## AI Code Generation Guidelines

- **Frontend**: Next.js 16 App Router, TypeScript strict mode, Tailwind, shadcn/ui via `npx shadcn@latest add`
- **Infrastructure**: Terraform AWS Provider 5.x, modular design
- **Lambda**: Node.js 20 with JSDoc comments, Python 3.12 for Bedrock
- **GraphQL**: AppSync directives (`@aws_cognito_user_pools`)
- **State**: React Context + TanStack Query (avoid Redux for this scale)
- **Forms**: React Hook Form + Zod validation
- **Serverless Best Practices**: Idempotency, minimal cold starts, least privilege IAM
