# 🏗️ System Architecture

Complete system design for the AWS Certification Quiz Platform.

## 🎯 Architecture Overview

The platform follows a **serverless, microservices architecture** leveraging AWS managed services for scalability, security, and cost-efficiency.

```
┌─────────────┐
│   Browser   │
│  (Next.js)  │
└──────┬──────┘
       │ HTTPS
       │ JWT Auth
       ▼
┌─────────────────┐
│  AWS Amplify    │◄──── Cognito User Pool
│  Authentication │      (Email/Password)
└────────┬────────┘
         │ GraphQL
         │ + JWT Token
         ▼
┌─────────────────────────────────┐
│       AWS AppSync               │
│    (GraphQL API Gateway)        │
│  ┌──────────────────────────┐   │
│  │ 4 GraphQL Resolvers:     │   │
│  │ • getQuizQuestions       │   │
│  │ • submitQuiz             │   │
│  │ • getQuizHistory         │   │
│  │ • getUserProgress        │   │
│  └───────┬──────────────────┘   │
└──────────┼──────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌──────────┐
│ Lambda  │  │ Lambda   │
│  Quiz   │  │  Score   │
│Selector │  │Calculator│
└────┬────┘  └────┬─────┘
     │            │
     │     ┌──────┴──────┐
     │     │             │
     ▼     ▼             ▼
┌────────────┐  ┌──────────┐  ┌──────────┐
│ Questions  │  │   Quiz   │  │   User   │
│   Table    │  │ Sessions │  │ Progress │
│ (DynamoDB) │  │  Table   │  │  Table   │
└────────────┘  └──────────┘  └──────────┘
     ▲
     │ Bedrock AI
     │ (Question Generation)
     │
┌────────────────┐
│ Claude 3.5     │
│ Sonnet v2      │
└────────────────┘
```

## 🔐 Security Architecture

### Authentication Flow

```
1. User Signup
   ├─► Cognito User Pool (email verification)
   ├─► Verification code sent via email
   └─► Account confirmed

2. User Login
   ├─► Cognito authentication
   ├─► JWT tokens issued (Access, ID, Refresh)
   └─► Tokens stored in localStorage

3. API Request
   ├─► Next.js sends JWT in Authorization header
   ├─► AppSync validates JWT with Cognito
   └─► Lambda executes with user context
```

### Security-First Design

**Critical Security Rule**: Questions NEVER include `correctAnswers` on client-side.

```typescript
// Lambda: quiz-selector (Client-facing)
const clientQuestion = {
  questionId: q.questionId,
  questionText: q.questionText,
  questionType: q.questionType,
  options: q.options,
  domain: q.domain,
  // ❌ correctAnswers NOT included
};

// Lambda: score-calculator (Server-side only)
const fullQuestion = await getQuestionFromDB(questionId);
// ✅ correctAnswers used for scoring server-side
```

### Authorization Layers

1. **AppSync Level**: JWT validation via `@aws_cognito_user_pools` directive
2. **Lambda Level**: User context passed via `event.requestContext.authorizer.claims`
3. **DynamoDB Level**: IAM roles with least-privilege access

## 📊 Data Models

### DynamoDB Tables

#### 1. Questions Table

**Purpose**: Stores AI-generated certification questions

**Schema**:

```
PK: EXAM#{examType}
SK: QUESTION#{questionId}

Attributes:
- questionId: String (e.g., "Developer-Associate#Q001")
- examType: String (e.g., "Developer-Associate")
- questionText: String
- questionType: String (single-choice | multiple-choice | true-false | scenario-based)
- options: List<{id: String, text: String}>
- correctAnswers: List<String> (e.g., ["A"], ["A","C"])
- explanation: String
- references: List<String> (AWS documentation URLs)
- domain: String (e.g., "Development with AWS Services")
- difficulty: String (easy | medium | hard)
- status: String (pending | approved | rejected | archived)
- tags: List<String>
- createdAt: ISO 8601 String
- updatedAt: ISO 8601 String
```

**Global Secondary Index**:

```
DomainIndex:
  PK: EXAM#{examType}#DOMAIN#{domain}
  SK: QUESTION#{questionId}
  Purpose: Filter questions by domain for targeted practice
```

**Access Patterns**:

- Get random N questions for exam type
- Get questions by domain
- Get questions by difficulty
- Batch write AI-generated questions

#### 2. QuizSessions Table

**Purpose**: Tracks every quiz attempt for history and analytics

**Schema**:

```
PK: USER#{userId}
SK: SESSION#{timestamp}

Attributes:
- sessionId: String (UUID)
- userId: String (Cognito sub)
- examType: String
- questionCount: Number
- questions: List<{questionId: String, userAnswers: List<String>}>
- correctAnswers: Number
- incorrectAnswers: Number
- scorePercentage: Number
- domainScores: Map<domain, {correct: Number, total: Number, percentage: Number}>
- timeSpent: Number (seconds)
- completedAt: ISO 8601 String
```

**Access Patterns**:

- Get user's quiz history (last 50 sessions)
- Calculate average score per exam type
- Track progress over time

#### 3. UserProgress Table

**Purpose**: Domain-level analytics per user

**Schema**:

```
PK: USER#{userId}
SK: EXAM#{examType}

Attributes:
- userId: String
- examType: String
- totalQuizzes: Number
- averageScore: Number
- bestScore: Number
- domainScores: List<{
    domain: String,
    correct: Number,
    total: Number,
    percentage: Number
  }>
- lastAttempt: ISO 8601 String
- createdAt: ISO 8601 String
- updatedAt: ISO 8601 String
```

**Access Patterns**:

- Get user performance by exam type
- Identify weak domains
- Calculate overall progress

### GraphQL Schema

See full schema in `infrastructure/terraform/schema.graphql`

**Key Types**:

```graphql
type Question {
  questionId: String!
  questionText: String!
  questionType: QuestionType!
  options: [QuestionOption!]!
  domain: String!
  # correctAnswers NOT exposed to client
}

type QuizSession {
  sessionId: String!
  examType: String!
  scorePercentage: Float!
  domainScores: [DomainScore!]!
  completedAt: String!
}

type UserProgress {
  examType: String!
  totalQuizzes: Int!
  averageScore: Float!
  domainScores: [DomainScore!]!
}
```

## ⚙️ AWS Services

### Amazon Cognito

**Configuration**:

- User Pool: `cert-quiz-dev`
- Email verification required
- Password policy: 8+ chars, uppercase, lowercase, number, special char
- MFA: Optional (user-configurable)
- User Groups: `Users` (default), `Admins` (manual assignment)

**OAuth Flows**:

- Authorization Code Grant (Next.js SSR)
- Implicit Grant (disabled for security)
- Client Credentials (for server-to-server)

**Custom Attributes**:

- `email` (required)
- `name` (optional)

### AWS AppSync

**Type**: GraphQL API
**Authorization**: Cognito User Pools JWT
**Resolvers**: 4 Lambda functions

**Request Flow**:

```
Client → AppSync → Lambda → DynamoDB → Lambda → AppSync → Client
         ↓ Validates JWT
         ↓ Authorizes request
         ↓ Invokes Lambda
```

### AWS Lambda

#### quiz-selector Function

**Purpose**: Fetch random questions for quiz
**Runtime**: Node.js 20
**Memory**: 512 MB
**Timeout**: 30 seconds

**Logic**:

1. Validate `examType` and `questionCount`
2. Query DynamoDB by exam type
3. Distribute questions across domains (weighted by exam blueprint)
4. Shuffle questions randomly
5. **Strip `correctAnswers`** before returning to client

**Environment Variables**:

- `QUESTIONS_TABLE_NAME`
- `LOG_LEVEL`
- `AWS_REGION`

#### score-calculator Function

**Purpose**: Score quiz, save session, update progress
**Runtime**: Node.js 20
**Memory**: 512 MB
**Timeout**: 30 seconds

**Logic**:

1. Receive user answers
2. Fetch **full questions** (with `correctAnswers`) from DynamoDB
3. Calculate score (no partial credit for multiple-choice)
4. Calculate domain-level scores
5. Save quiz session to `QuizSessions` table
6. Update user progress in `UserProgress` table
7. Return results to client

**Scoring Rules**:

- Single-choice: 1 point if correct
- Multiple-choice: 1 point only if ALL correct answers selected (no partial credit)
- True/False: 1 point if correct

### Amazon DynamoDB

**Billing Mode**: On-Demand (pay-per-request)
**Encryption**: AWS-managed KMS key
**Point-in-Time Recovery**: Enabled
**Backup**: AWS Backup (daily snapshots)

**Capacity**:

- Read: Auto-scales (no throttling)
- Write: Auto-scales (no throttling)

### Amazon Bedrock

**Model**: Claude 3.5 Sonnet v2 (`anthropic.claude-3-5-sonnet-20241022-v2:0`)
**Region**: us-east-1
**Usage**: AI-powered question generation

**Configuration**:

```python
{
  "modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "max_tokens": 4096,
  "temperature": 1.0,
  "top_p": 0.9
}
```

**Cost**: ~$0.015 per question

**Rate Limits**: 10 requests/minute

## 🔄 Key User Flows

### 1. Take Quiz Flow

```
User → Select Exam Type + Question Count
     → Click "Start Quiz"
     → AppSync: getQuizQuestions
     → Lambda: quiz-selector
       ├─► Query DynamoDB
       ├─► Filter by exam type
       ├─► Distribute across domains
       ├─► Shuffle randomly
       └─► Strip correctAnswers ✅
     → Return questions to client
     → User answers questions
     → User submits quiz
     → AppSync: submitQuiz
     → Lambda: score-calculator
       ├─► Fetch full questions (with correctAnswers)
       ├─► Calculate score
       ├─► Save session to QuizSessions
       ├─► Update UserProgress
       └─► Return results
     → Display score + explanations
```

### 2. View History Flow

```
User → Navigate to /history
     → AppSync: getQuizHistory
     → Lambda: Scan QuizSessions table
       └─► Filter by userId
     → Return sessions
     → Display table with:
       - Exam type
       - Score
       - Date
       - Domain breakdown
```

### 3. View Progress Flow

```
User → Navigate to /progress
     → Select exam type tab
     → AppSync: getUserProgress
     → Lambda: Query UserProgress table
       └─► PK: USER#{userId}, SK: EXAM#{examType}
     → Return progress data
     → Display:
       - Overall stats (total quizzes, avg score)
       - Domain performance (progress bars)
       - Recommendations (weak domains)
```

## 📈 Scalability

### Auto-Scaling

- **Lambda**: Concurrent executions up to 1,000 (default account limit)
- **DynamoDB**: On-demand scaling (no throttling)
- **AppSync**: Handles 100,000+ requests/second
- **Cognito**: 50+ MAU free tier, scales infinitely

### Performance Optimizations

1. **DynamoDB Query Optimization**:

   - Use GSI for domain filtering
   - Batch write operations (25 items/batch)
   - Consistent reads only when necessary

2. **Lambda Cold Start Mitigation**:

   - Package size <10 MB
   - Single-purpose functions (no monolithic Lambdas)
   - Provisioned concurrency for critical functions (if needed)

3. **GraphQL Caching**:
   - AppSync caching (TTL: 5 minutes)
   - Client-side caching with SWR/TanStack Query

### Cost Optimization

- **DynamoDB On-Demand**: Pay only for what you use (no wasted provisioned capacity)
- **Lambda**: 1M free requests/month
- **AppSync**: 250k free queries/month
- **Cognito**: 50 free MAU/month

**Estimated Monthly Cost** (100 active users):

- DynamoDB: $0.50
- Lambda: $0.20
- AppSync: $0.10
- Cognito: Free
- **Total**: **~$0.80/month**

## 🔗 External Integrations

### AWS Amplify (Frontend Auth)

**Purpose**: Client-side auth management
**Features**:

- Auto token refresh
- Session persistence (localStorage)
- SSR compatibility

### Next.js (Frontend Framework)

**Version**: 16.x
**Rendering**:

- Server Components (default)
- Client Components (for interactivity)
- Static Site Generation (for landing page)

**Key Features**:

- App Router (file-based routing)
- Server Actions (for mutations)
- Middleware (for auth checks)

## 📚 Related Documentation

- [Data Models](./data-models.md)
- [Authentication Flow](./authentication.md)
- [Deployment Guide](../deployment/README.md)
- [Frontend Development](../development/frontend-guide.md)
