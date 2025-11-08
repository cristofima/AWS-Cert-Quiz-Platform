# AWS Certification Quiz Platform - AI Agent Instructions

## Project Overview

Serverless AWS certification exam prep platform built with **Next.js 16**, **Terraform**, **AWS AppSync**, and **Amazon Bedrock**. Features include quiz interface, admin panel, automated question generation, and role-based access control.

**Current Status** (Phase 2 - Backend Deployed):

- ✅ Next.js 16 frontend with 11 shadcn/ui components (QuizSelector, QuestionCard)
- ✅ Complete landing page with responsive design
- ✅ Route structure for auth, dashboard, and admin
- ✅ TypeScript types for Question, QuizSession, UserProgress
- ✅ **Backend infrastructure deployed** (Cognito, AppSync, DynamoDB, Lambda)
- ✅ **GraphQL schema with 4 resolvers** (getQuizQuestions, submitQuiz, getUserProgress, getQuizHistory)
- ✅ **2 Lambda functions implemented** (quiz-selector, score-calculator)
- 🚧 Frontend integration with AppSync (GraphQL client setup in progress)
- 🚧 Question seeding script (generate-questions.py ready, needs execution)
- 🚧 Interactive quiz UI with real data (Phase 2 completion)

## Architecture & Data Flow

```
Next.js 16 (Amplify) → Cognito → AppSync GraphQL → Lambda → DynamoDB
                                                     ↓
                                              Bedrock (Claude 3.5 Sonnet v2)
                                                     ↓
                                       EventBridge → SNS → Admins
```

### AWS Services Stack

- **Frontend**: AWS Amplify hosting (Next.js 16 App Router)
- **Auth**: Amazon Cognito User Pools (Groups: `Users`, `Admins`)
- **API**: AWS AppSync (GraphQL with authorization rules)
- **Compute**: AWS Lambda (Node.js 20 + Python 3.12)
- **Database**: Amazon DynamoDB (6 planned tables)
- **AI**: Amazon Bedrock (Claude 3.5 Sonnet v2 - Model ID: `anthropic.claude-3-5-sonnet-20241022-v2:0`)
- **Automation**: Amazon EventBridge (weekly question generation)
- **IaC**: Terraform 1.9+ (AWS Provider ~> 5.0)

### DynamoDB Tables (Planned)

- `Questions` - Question bank (1,200 initial questions, status: approved/pending/archived)
- `UserProgress` - Per-user domain scores and history
- `QuizSessions` - Quiz attempts with timestamps
- `BackgroundJobs` - Generation job tracking
- `Users` - User metadata
- `Analytics` - Question performance metrics

## Development Workflows

### Frontend Development (Active)

```powershell
cd frontend
npm install
npm run dev  # Starts on localhost:3000
npm run build  # Production build
npm run lint  # ESLint check
```

**Adding shadcn/ui components**:

```powershell
npx shadcn@latest add <component-name>
```

Currently installed: button, card, badge, radio-group, checkbox, progress, tabs, table, dialog, select, alert

### Infrastructure Deployment (DEPLOYED - Article 2 Complete)

**Current Deployment Status**:

- ✅ Terraform infrastructure deployed to AWS (us-east-1)
- ✅ Cognito User Pool: `us-east-1_XNLodSkoE`
- ✅ AppSync API: `https://ztjeab3ravhhjkwfk2fam5ud5a.appsync-api.us-east-1.amazonaws.com/graphql`
- ✅ DynamoDB Tables: Questions, QuizSessions, UserProgress
- ✅ Lambda Functions: quiz-selector, score-calculator
- ⚠️ CloudWatch Alarms disabled (requires IAM permissions - see `DEPLOYMENT-FIXES.md`)

**Deployment Commands**:

```powershell
cd infrastructure/terraform
terraform init
terraform plan -var="article_phase=article-2"  # Verify changes
terraform apply -var="article_phase=article-2" -auto-approve
```

**Phase Control Variable**:

- `article_phase="article-1"` → Cognito + Amplify only
- `article_phase="article-2"` → + DynamoDB + Lambda + AppSync (CURRENT)
- `article_phase="article-3"` → + Bedrock + EventBridge (FUTURE)

**Known Issues**:

1. **Cognito Domain**: Cannot use "aws" prefix (reserved word) - using `cert-quiz-*` instead
2. **CloudWatch Alarms**: Commented out in `dynamodb.tf` and `lambda.tf` (needs `cloudwatch:PutMetricAlarm` IAM permission)
3. **Amplify Hosting**: Not deployed (requires `github_repository_url` variable)

### Lambda Development (IMPLEMENTED)

**Current Lambda Functions**:

```
lambdas/
├── quiz-selector/           # Node.js 20, 512MB - Random question selection ✅
│   ├── index.ts            # Main handler with weighted domain distribution
│   ├── package.json        # Dependencies: @aws-sdk/client-dynamodb
│   └── tsconfig.json
└── score-calculator/        # Node.js 20, 512MB - Multi-answer scoring ✅
    ├── index.ts            # Scoring logic + DynamoDB session storage
    ├── package.json        # Dependencies: @aws-sdk/client-dynamodb
    └── tsconfig.json
```

**Lambda Function Details**:

1. **quiz-selector** (`lambdas/quiz-selector/index.ts`):

   - Queries DynamoDB Questions table by examType
   - Distributes questions evenly across domains
   - Shuffles questions for randomization
   - Returns question data WITHOUT correct answers (security)
   - Connected to AppSync resolver: `getQuizQuestions`

2. **score-calculator** (`lambdas/score-calculator/index.ts`):
   - Fetches questions with correct answers from DynamoDB
   - Calculates scores based on question type:
     - Single/True-False: 1 point if exact match
     - Multiple-choice: 1 point only if ALL correct selected AND NO incorrect selected
   - Stores QuizSession in DynamoDB
   - Updates UserProgress with domain-level analytics
   - Connected to AppSync resolver: `submitQuiz`

**Installing Lambda Dependencies** (required before Terraform deploy):

```powershell
cd lambdas/quiz-selector
npm install

cd ../score-calculator
npm install
```

**Important**: Terraform packages Lambda code into ZIP files. Dependencies must be installed locally before deployment.

### Question Generation Workflow (READY - Not Yet Executed)

**Setup**: Python script ready at `scripts/generate-questions.py`

1. EventBridge triggers weekly (Sunday 2 AM) OR admin manual trigger
2. Python Lambda calls Bedrock to generate 50 questions
3. Questions stored in DynamoDB with `status="pending-review"`
4. SNS notification sent to admin team
5. Admins review/approve via admin panel at `/admin/questions/pending`

**Manual Execution** (for seeding initial questions):

```powershell
cd scripts
pip install -r requirements.txt

# Generate 50 questions for Developer Associate exam
python generate-questions.py --exam-type Developer-Associate --count 50 --region us-east-1
```

**Important Configuration**:

- **Bedrock Model**: `anthropic.claude-3-5-sonnet-20241022-v2:0`
- **Max Tokens**: 4096
- **Temperature**: 1.0 (high creativity for question variety)
- **Cost Estimate**: ~$0.015 per question generated
- **Target**: 1,200 questions across 3 exam types ($18-20 one-time cost)

## Project-Specific Conventions

### Frontend (Next.js 16) - Current Implementation

- **App Router**: Use `app/` directory structure (not `pages/`)
- **Path Aliases**: `@/*` maps to project root (configured in `tsconfig.json`)
  - Example: `import { Button } from "@/components/ui/button"`
- **Styling**: Tailwind CSS 4 with custom CSS variables in `globals.css`
- **Color System**: AWS-branded theme (see `frontend/COLORS.md`)
  - Primary: AWS Orange (`oklch(0.72 0.17 50)`)
  - Secondary: AWS Blue (`oklch(0.55 0.15 250)`)
  - Use semantic tokens: `bg-primary`, `text-muted-foreground`
- **Fonts**: Geist Sans & Geist Mono loaded via `next/font/google` in `layout.tsx`
- **TypeScript**: Strict mode enabled, target ES2017
- **Component Pattern**: Use `cn()` utility from `lib/utils.ts` for className merging
  - Example: `cn("base-class", conditional && "conditional-class", className)`

### shadcn/ui Configuration

- **Style**: "new-york" variant
- **RSC**: Enabled (React Server Components)
- **Base Color**: Neutral
- **Icon Library**: lucide-react (tree-shakeable)
- **Config Location**: `frontend/components.json`

### Component Organization (Implemented)

```
components/
├── ui/          # shadcn/ui primitives (11 components installed)
├── quiz/        # Quiz-specific components
│   ├── QuizSelector.tsx       # Exam type + question count selector ✅
│   └── QuestionCard.tsx       # Individual question display ✅
├── admin/       # Admin dashboard components (empty - Phase 3)
└── auth/        # Authentication forms (empty - Phase 2)
```

When creating new components:

- UI primitives go in `ui/` (use shadcn/ui CLI)
- Feature components go in domain folders (`quiz/`, `admin/`, `auth/`)
- Prefer composition over prop drilling
- Use TypeScript interfaces for component props
- Mark client components with `"use client"` directive only when needed

### Route Structure (Implemented)

The app uses Next.js 16 route groups for logical organization:

```
app/
├── (auth)/                  # Login/signup pages (placeholders)
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/             # Quiz, progress, history (placeholders)
│   ├── quiz/page.tsx
│   ├── progress/page.tsx
│   └── history/page.tsx
└── admin/                   # Admin panel (Cognito Admins group only)
    ├── questions/page.tsx   # Question management (placeholder)
    ├── analytics/           # Question stats (Phase 3)
    ├── generation/          # Background jobs (Phase 3)
    └── questions/
        ├── [id]/            # Edit question (Phase 3)
        ├── new/             # Create question (Phase 3)
        └── pending/         # Review queue (Phase 3)
```

**Route Groups** (parentheses don't appear in URL):

- `(auth)` - Public auth pages, no shared layout yet
- `(dashboard)` - User-facing features, will share nav layout
- `admin` - Admin-only features, will require Cognito Admins group

**Current Pages**:

- `app/page.tsx` - Complete landing page with hero, features, tech stack sections
- All other pages show "Coming in Article X" placeholders

### Authentication & Authorization

- **User Creation**: Sign up via Cognito, default to `Users` group
- **Admin Promotion**: Use AWS CLI or Console to add users to `Admins` group
  ```powershell
  aws cognito-idp admin-add-user-to-group `
    --user-pool-id <POOL_ID> `
    --username <EMAIL> `
    --group-name Admins `
    --region us-east-1
  ```
- **AppSync Authorization**: Group-based rules (e.g., admin mutations require `Admins` group)

### Question Types & Scoring

1. **Single Choice** - One correct answer
2. **Multiple Choice** - Multiple correct answers (partial credit not awarded)
3. **True/False** - Boolean answer
4. **Scenario-Based** - Context + single/multiple choice

**Scoring Logic** (in `score-calculator` Lambda):

- Single/True-False: 1 point if correct, 0 otherwise
- Multiple choice: 1 point only if ALL correct answers selected and NO incorrect answers selected

### Type System (Implemented in `frontend/types/index.ts`)

The project uses comprehensive TypeScript types for type safety:

```typescript
// Core types defined and ready to use
QuestionType: "single-choice" |
  "multiple-choice" |
  "true-false" |
  "scenario-based";
QuestionStatus: "pending" | "approved" | "rejected" | "archived";
ExamType: "Developer-Associate" |
  "Solutions-Architect-Associate" |
  "SysOps-Administrator-Associate";

// Main interfaces
interface Question {
  id: string;
  examType: ExamType;
  domain: string;
  questionType: QuestionType;
  correctAnswers: string[]; // ["A"] or ["A", "C"]
  options: QuestionOption[];
  explanation: string;
  references: string[];
  status: QuestionStatus;
  // ... analytics and metadata fields
}

interface QuizSession {
  id: string;
  userId: string;
  questions: Question[];
  userAnswers: Record<string, string[]>; // questionId -> selected IDs
  // ... scoring fields
}
```

**Always import types from**: `@/types` (not inline definitions)
**Question IDs format**: `\${examType}#Q\${number}` (e.g., `Developer-Associate#Q001`)

### Cost Optimization Principles

- **Pre-generate questions**: Store in DynamoDB instead of real-time Bedrock calls (<100ms loads)
- **Lambda memory**: Right-size (512MB for CRUD, 2048MB for Bedrock)
- **DynamoDB**: On-demand pricing for dev, provisioned for production
- **Target**: $15-25/month for 500 active users (vs. $125+ for EC2+RDS)

## Key Files & Directories

### Configuration Files

- `frontend/next.config.ts` - Next.js configuration (currently minimal)
- `frontend/tsconfig.json` - TypeScript with strict mode, path aliases
- `frontend/package.json` - Dependencies: React 19.2, Next.js 16.0.1, Tailwind 4
- `infrastructure/terraform/main.tf` - Terraform entry point with phase control
- `infrastructure/terraform/schema.graphql` - AppSync GraphQL schema (4 resolvers)
- `infrastructure/terraform/outputs.json` - Live deployment outputs (Cognito, AppSync endpoints)
- `README.md` - Comprehensive project documentation
- `DEPLOYMENT.md` - Step-by-step deployment guide with AWS credential setup
- `DEPLOYMENT-FIXES.md` - Known issues and their resolutions

### Backend Implementation (Completed)

- **Terraform Modules**: Deployed to us-east-1 (35+ resources)
  - `cognito.tf` - User pools with Users/Admins groups
  - `dynamodb.tf` - Questions, QuizSessions, UserProgress tables
  - `lambda.tf` - quiz-selector and score-calculator functions
  - `appsync.tf` - GraphQL API with Cognito auth
- **Lambda Functions**: 2 functions implemented and deployed
  - `lambdas/quiz-selector/index.ts` - 220 lines, query + domain distribution
  - `lambdas/score-calculator/index.ts` - 373 lines, scoring + DynamoDB updates
- **GraphQL Schema**: Complete with @aws_cognito_user_pools directives
  - Queries: getQuizQuestions, getUserProgress, getQuizHistory
  - Mutations: submitQuiz
- **Python Scripts**: Ready for question generation
  - `scripts/generate-questions.py` - 403 lines, Bedrock integration
  - `scripts/seed-questions.py` - Batch upload to DynamoDB

## Testing Strategy (Planned)

### Unit Tests (Vitest)

```powershell
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### E2E Tests (Playwright)

```powershell
npx playwright install
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # UI mode
```

**Coverage Goals**: Quiz selection logic, scoring algorithms, admin approval workflow, auth flows, progress tracking.

## Common Pitfalls

1. **Lambda Dependencies**: Install `node_modules` locally before Terraform deployment (Terraform packages them into zip files)
2. **Bedrock Access**: Ensure AWS account has Bedrock enabled in `us-east-1` and model access granted for Claude 3.5 Sonnet
3. **Cognito Groups**: Users must be manually added to `Admins` group; group assignment is NOT automatic
4. **AppSync Caching**: Test authorization rules thoroughly; incorrect rules can expose admin operations
5. **DynamoDB Schema**: Question IDs must include exam type (e.g., `DEV-ASSOC#Q001`) for domain filtering
6. **Cost Monitoring**: Track Bedrock token usage during generation jobs (~$0.015 per question)

## AI Agent Guidance

When generating code for this project:

- **Frontend**: Use Next.js 16 App Router patterns, TypeScript strict mode, Tailwind utility classes
- **Infrastructure**: Generate Terraform with AWS Provider 5.x syntax, use modules for reusability
- **Lambda**: Node.js 20 for CRUD, Python 3.12 for Bedrock; include JSDoc/docstrings
- **GraphQL**: Define schema with AppSync-specific directives (`@auth`, `@aws_cognito_user_pools`)
- **Components**: When adding shadcn/ui, install via `npx shadcn@latest add <component>`
- **State Management**: Prefer React Context + TanStack Query over Redux for this scale
- **Forms**: Use React Hook Form + Zod for validation

Prioritize serverless best practices: idempotency, minimal cold starts, cost optimization, and security (least privilege IAM policies).

## Current Phase: MVP (Weeks 1-3)

**Completed**:

- ✅ Repository structure
- ✅ Next.js 16 frontend bootstrapped
- ✅ Documentation (README, roadmap, articles)
- ✅ Terraform infrastructure modules (Cognito, AppSync, DynamoDB, Lambda, EventBridge)
- ✅ 2 Lambda functions deployed (quiz-selector, score-calculator)
- ✅ GraphQL schema with 4 resolvers

**In Progress**:

- [ ] Frontend integration with AppSync (GraphQL client setup)
- [ ] Question seeding (generate-questions.py execution)
- [ ] Interactive quiz UI with real backend data

**Next Steps** (Phase 3):

- Build admin panel (weeks 7-9)
- Background question generation with Bedrock + EventBridge
- E2E testing & production deployment (week 10)
