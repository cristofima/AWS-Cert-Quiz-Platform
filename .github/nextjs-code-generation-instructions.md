# GitHub Copilot Custom Instructions - Next.js Code Generation

These instructions guide GitHub Copilot in generating clean, maintainable, scalable, and type-safe code for Next.js projects following industry best practices and SOLID principles.

---

## I. Core Design Principles

### 1. DRY (Don't Repeat Yourself)

- **Avoid duplicating code**: Extract repeated logic into reusable functions, components, or hooks
- **Centralize logic**: Keep business logic in dedicated service files or custom hooks
- **Reusable components**: Create generic UI components that accept props for customization
- **Shared utilities**: Store common functions in `lib/` or `utils/` directory

**Examples:**

```typescript
// ❌ BAD - Repeated logic
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then(setUser);
  }, []); // Duplicated fetch logic
  // ... render user
}

function UserSettings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then(setUser);
  }, []); // Same duplicated fetch logic
  // ... render settings
}

// ✅ GOOD - Centralized logic in custom hook
// hooks/useUser.ts
export function useUser() {
  return useSWR("/api/user", fetcher);
}

// components/UserProfile.tsx
function UserProfile() {
  const { data: user } = useUser(); // Reusing hook
  // ... render user
}

// components/UserSettings.tsx
function UserSettings() {
  const { data: user } = useUser(); // Reusing same hook
  // ... render settings
}
```

### 2. KISS (Keep It Simple, Stupid)

- **Aim for simplicity**: Write straightforward solutions that are easy to understand
- **Avoid over-engineering**: Don't add unnecessary abstractions or layers
- **Question complexity**: If code requires extensive comments to explain, simplify it
- **Prefer clarity over cleverness**: Readable code is better than "clever" code

**Examples:**

```typescript
// ❌ BAD - Over-engineered
class QuestionFilterStrategyFactory {
  createStrategy(type: string): IFilterStrategy {
    switch (type) {
      case "domain":
        return new DomainFilterStrategy();
      case "difficulty":
        return new DifficultyFilterStrategy();
      default:
        throw new Error("Unknown strategy");
    }
  }
}

// ✅ GOOD - Simple and direct
function filterQuestions(questions: Question[], filters: Filters) {
  return questions.filter(
    (q) =>
      (!filters.domain || q.domain === filters.domain) &&
      (!filters.difficulty || q.difficulty === filters.difficulty)
  );
}
```

### 3. YAGNI (You Aren't Gonna Need It)

- **Build only what you need today**: Don't implement features for hypothetical future use
- **Avoid premature optimization**: Don't optimize for performance problems you don't have yet
  - Exception: Use Next.js built-in optimizations by default (Image component, code splitting)
- **No speculative abstractions**: Don't create frameworks for "future flexibility"
- **Iterative development**: Add complexity only when requirements demand it

**What to optimize from the start:**

- ✅ Use Next.js `<Image>` component (built-in optimization, no extra work)
- ✅ Use Server Components by default (framework default, better performance)
- ✅ Dynamic imports for heavy admin components (simple `dynamic()` call)

**What NOT to optimize prematurely:**

- ❌ Complex caching strategies before measuring slow queries
- ❌ Micro-optimizations (e.g., for-loop vs forEach) without benchmarks
- ❌ Over-engineering state management before knowing requirements

**Examples:**

```typescript
// ❌ BAD - Hypothetical features
interface Question {
  id: string;
  text: string;
  // Future features that may never be used:
  aiGeneratedVariants?: string[];
  voiceRecordingUrl?: string;
  vrSupport?: boolean;
  blockchainHash?: string;
}

// ✅ GOOD - Current requirements only
interface Question {
  id: string;
  questionText: string;
  options: QuestionOption[];
  correctAnswers: string[];
  explanation: string;
}
```

### 4. LOD (Law of Demeter / Principle of Least Knowledge)

- **Talk only to immediate neighbors**: Avoid chaining multiple method calls
- **Reduce coupling**: Components shouldn't know internal structure of objects they use
- **Use dependency injection**: Pass dependencies explicitly rather than reaching through objects
- **Limit method chaining**: Maximum 2 levels (e.g., `user.profile.name` is OK, `user.profile.settings.theme.color` is not)

**Examples:**

```typescript
// ❌ BAD - Violates Law of Demeter
function QuizCard({ session }) {
  const userName = session.user.profile.personalInfo.name; // Too deep
  const score = session.quiz.results.score.percentage; // Too deep
}

// ✅ GOOD - Respects Law of Demeter
function QuizCard({ userName, scorePercentage }) {
  // Props are direct dependencies
  return (
    <Card>
      {userName} scored {scorePercentage}%
    </Card>
  );
}
```

### 5. SRP (Single Responsibility Principle)

- **One responsibility per class/function**: Each module should have only one reason to change
- **Focused components**: Components should do one thing well
- **Separate concerns**: Keep data fetching, business logic, and presentation separate
- **Small, cohesive modules**: Functions/components should be under 100 lines when possible

**Examples:**

```typescript
// ❌ BAD - Multiple responsibilities
function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);

  // Data fetching
  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then(setQuestions);
  }, []);

  // Score calculation
  const calculateScore = () => {
    /* complex logic */
  };

  // Rendering + styling + event handling
  return <div>{/* 200 lines of JSX */}</div>;
}

// ✅ GOOD - Single responsibilities
// hooks/useQuestions.ts
export function useQuestions(examType: string) {
  return useSWR(`/api/questions/${examType}`, fetcher);
}

// lib/quiz-scorer.ts
export function calculateQuizScore(answers: Answer[], questions: Question[]) {
  // Scoring logic only
}

// components/QuizPage.tsx
export function QuizPage({ examType }: QuizPageProps) {
  const { data: questions } = useQuestions(examType);
  const score = calculateQuizScore(answers, questions);
  return <QuizView questions={questions} score={score} />;
}
```

### 6. OCP (Open/Closed Principle)

- **Open for extension, closed for modification**: Use composition and interfaces
- **Extend via props**: Allow behavior customization through component props
- **Plugin architecture**: Design for extensibility without modifying core code
- **Use TypeScript generics**: Make components work with multiple types

**Examples:**

```typescript
// ❌ BAD - Must modify for new button types
function Button({ variant }) {
  if (variant === "primary")
    return <button className="bg-blue-500">...</button>;
  if (variant === "secondary")
    return <button className="bg-gray-500">...</button>;
  if (variant === "danger") return <button className="bg-red-500">...</button>;
  // Must edit this file for every new variant
}

// ✅ GOOD - Open for extension via className prop
function Button({ className, ...props }: ButtonProps) {
  return <button className={cn("base-styles", className)} {...props} />;
}

// Extend without modifying Button component
<Button className="bg-purple-500">Custom</Button>;
```

### 7. LSP (Liskov Substitution Principle)

- **Subtypes must be substitutable**: Child components should work wherever parent works
- **Consistent interfaces**: Don't break expected behavior in derived components
- **Honor contracts**: Subclasses shouldn't weaken preconditions or strengthen postconditions
- **Polymorphic components**: Use composition over inheritance in React

**Examples:**

```typescript
// ❌ BAD - Violates LSP
interface BaseButton {
  onClick: () => void;
  label: string;
}

// SubmitButton requires additional data that BaseButton doesn't have
function SubmitButton({
  onClick,
  label,
  formData,
}: BaseButton & { formData: any }) {
  if (!formData) throw new Error("formData required"); // Breaks substitution
}

// ✅ GOOD - Respects LSP through composition
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// SubmitButton can wrap Button without breaking its contract
function SubmitButton({
  onSubmit,
  children,
}: {
  onSubmit: (data: FormData) => void;
}) {
  const handleClick = () => {
    const data = collectFormData();
    onSubmit(data);
  };
  return <Button onClick={handleClick}>{children}</Button>;
}
```

### 8. ISP (Interface Segregation Principle)

- **Many small interfaces over one large interface**: Don't force clients to depend on unused methods
- **Focused prop types**: Components should only receive props they actually use
- **Split large interfaces**: Break down complex types into smaller, composable ones
- **Optional props carefully**: Prefer multiple specific interfaces over optional props

**Examples:**

```typescript
// ❌ BAD - Fat interface with unused props
interface QuestionCardProps {
  question: Question;
  showAnswer: boolean;
  onEdit: () => void; // Only used in admin
  onDelete: () => void; // Only used in admin
  onReport: () => void; // Only used by users
  onBookmark: () => void; // Only used by users
  isAdminMode: boolean;
}

// ✅ GOOD - Segregated interfaces
interface QuestionDisplayProps {
  question: Question;
  showAnswer: boolean;
}

interface AdminActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

interface UserActionsProps {
  onReport: () => void;
  onBookmark: () => void;
}

// Compose as needed
function AdminQuestionCard(props: QuestionDisplayProps & AdminActionsProps) {}
function UserQuestionCard(props: QuestionDisplayProps & UserActionsProps) {}
```

### 9. DIP (Dependency Inversion Principle)

- **Depend on abstractions, not concretions**: High-level modules shouldn't depend on low-level details
- **Inject dependencies**: Pass services/clients as props or context rather than importing directly
- **Abstract external services**: Wrap third-party APIs behind your own interfaces
- **Use interfaces**: Define contracts, not implementations

**Examples:**

```typescript
// ❌ BAD - Direct dependency on implementation
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

function QuizService() {
  const db = new DynamoDBClient({ region: "us-east-1" }); // Tightly coupled

  async function getQuestions() {
    return db.scan({ TableName: "Questions" }); // Implementation detail leaked
  }
}

// ✅ GOOD - Dependency on abstraction
interface QuestionRepository {
  getQuestions(examType: string): Promise<Question[]>;
  saveQuestion(question: Question): Promise<void>;
}

// Implementation can be swapped without changing consumers
class DynamoQuestionRepository implements QuestionRepository {
  constructor(private client: DynamoDBClient) {}

  async getQuestions(examType: string): Promise<Question[]> {
    // DynamoDB implementation details hidden
  }
}

// High-level component depends on interface, not concrete class
function QuizPage({ repository }: { repository: QuestionRepository }) {
  const questions = await repository.getQuestions("Developer-Associate");
}
```

---

## II. Next.js Best Practices

### 1. TypeScript: Mandatory for Type Safety

**Always use TypeScript** for all Next.js projects:

- ✅ Catches errors at compile time, not runtime
- ✅ Enables better IDE autocomplete and refactoring
- ✅ Self-documenting code through type annotations
- ✅ Safer refactoring across large codebases

**Configuration:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true, // Enable all strict type checks
    "noUncheckedIndexedAccess": true, // Safer array/object access
    "noImplicitAny": true, // No implicit any types
    "strictNullChecks": true, // Explicit null handling
    "target": "ES2017"
  }
}
```

**Examples:**

```typescript
// ✅ GOOD - Explicit types
interface QuizSessionProps {
  examType: ExamType;
  questionCount: number;
  onComplete: (score: number) => void;
}

export function QuizSession({
  examType,
  questionCount,
  onComplete,
}: QuizSessionProps) {
  // TypeScript prevents runtime errors
}

// ❌ BAD - Implicit any
export function QuizSession(props) {
  // No type safety
}
```

### 2. Server Components vs Client Components

**Default to Server Components** (React Server Components):

- ✅ Faster initial page loads (less JavaScript sent to client)
- ✅ Direct database/API access without exposing credentials
- ✅ Better SEO (fully rendered HTML)
- ✅ Reduced bundle size

**Only use Client Components (`"use client"`) when you need:**

- Event handlers (`onClick`, `onChange`, etc.)
- React hooks (`useState`, `useEffect`, `useContext`)
- Browser APIs (`window`, `localStorage`, `navigator`)
- Third-party libraries that depend on client-side features

**Examples:**

```typescript
// ✅ GOOD - Server Component (default)
// app/quiz/page.tsx
export default async function QuizPage() {
  const questions = await fetchQuestionsFromDB(); // Direct DB access
  return <QuizList questions={questions} />;
}

// ✅ GOOD - Client Component (when needed)
// components/QuizTimer.tsx
("use client");

export function QuizTimer({ duration }: { duration: number }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return <div>Time left: {timeLeft}s</div>;
}

// ❌ BAD - Unnecessary Client Component
("use client"); // Not needed!

export function QuestionCard({ question }: { question: Question }) {
  return <div>{question.text}</div>; // No interactivity
}
```

### 3. Data Fetching Strategies

Choose the right rendering method based on data requirements:

#### Static Site Generation (SSG) - `generateStaticParams` + async components

**Use for:** Pages with data that rarely changes

- Blog posts, documentation, marketing pages
- Questions bank (generate at build time)

```typescript
// ✅ GOOD - Pre-render at build time
export async function generateStaticParams() {
  const exams = ["Developer-Associate", "Solutions-Architect-Associate"];
  return exams.map((exam) => ({ examType: exam }));
}

export default async function ExamPage({
  params,
}: {
  params: { examType: string };
}) {
  const questions = await getQuestions(params.examType);
  return <QuizView questions={questions} />;
}
```

#### Server-Side Rendering (SSR) - async Server Components

**Use for:** Pages requiring fresh data on every request

- User dashboards, personalized content
- Real-time data, authenticated pages

```typescript
// ✅ GOOD - Fresh data on every request
export default async function DashboardPage() {
  const session = await getServerSession();
  const userProgress = await getUserProgress(session.userId);

  return <Dashboard progress={userProgress} />;
}
```

#### Client-Side Fetching - SWR or TanStack Query

**Use for:** Data that changes frequently or requires user interaction

- Real-time updates, polling
- Mutations (create, update, delete)

```typescript
// ✅ GOOD - Client-side data fetching with SWR
"use client";

import useSWR from "swr";

export function LiveScoreboard() {
  const { data, error } = useSWR("/api/leaderboard", fetcher, {
    refreshInterval: 5000, // Poll every 5 seconds
  });

  if (error) return <ErrorState />;
  if (!data) return <LoadingState />;

  return <Scoreboard data={data} />;
}
```

### 4. Folder Structure and Organization

**Recommended structure for scalability:**

```
app/                          # App Router (Next.js 13+)
├── (auth)/                   # Route groups (URL not affected)
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx            # Shared layout for dashboard routes
│   ├── quiz/
│   │   └── page.tsx
│   └── progress/
│       └── page.tsx
├── admin/                    # Admin-only routes
│   ├── questions/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   └── layout.tsx
├── api/                      # API routes
│   ├── questions/
│   │   └── route.ts
│   └── quiz/
│       └── [id]/
│           └── route.ts
├── globals.css
├── layout.tsx                # Root layout
└── page.tsx                  # Home page

components/                   # Reusable components
├── ui/                       # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   └── dialog.tsx
├── quiz/                     # Quiz-specific components
│   ├── QuestionCard.tsx
│   ├── QuizTimer.tsx
│   └── AnswerSelector.tsx
├── admin/                    # Admin-specific components
│   └── QuestionEditor.tsx
└── layout/                   # Layout components
    ├── Header.tsx
    └── Footer.tsx

lib/                          # Utilities and configurations
├── utils.ts                  # Helper functions
├── constants.ts              # App constants
├── validations.ts            # Zod schemas
└── graphql/                  # GraphQL queries/mutations
    ├── client.ts
    └── queries.ts

hooks/                        # Custom React hooks
├── useQuizSession.ts
├── useAuth.ts
└── useQuestions.ts

types/                        # TypeScript type definitions
├── index.ts                  # Shared types
├── quiz.ts
└── user.ts

services/                     # Business logic / API clients
├── quiz-service.ts
├── question-service.ts
└── auth-service.ts

public/                       # Static assets
├── images/
└── fonts/
```

**Key principles:**

- **Co-locate related files**: Keep components, styles, and tests together
- **Domain-driven structure**: Group by feature (quiz, admin) not by type (components, hooks)
- **Shallow hierarchies**: Avoid deep nesting (max 3-4 levels)
- **Consistent naming**: Use PascalCase for components, camelCase for utilities

### 5. Component Design Patterns

#### A. Composition over Inheritance

React components should compose smaller components, not extend classes.

```typescript
// ❌ BAD - Inheritance (avoid in React)
class BaseCard extends React.Component {
  render() {
    return <div className="card">{this.props.children}</div>;
  }
}

class QuestionCard extends BaseCard {
  render() {
    return (
      <div className="question-card">
        {super.render()}
        {/* Additional content */}
      </div>
    );
  }
}

// ✅ GOOD - Composition
function Card({ children, className }: CardProps) {
  return <div className={cn("card", className)}>{children}</div>;
}

function QuestionCard({ question }: { question: Question }) {
  return (
    <Card className="question-card">
      <QuestionHeader title={question.text} />
      <QuestionOptions options={question.options} />
    </Card>
  );
}
```

#### B. Prop Drilling vs Context vs State Management

**Prop drilling** (passing props through multiple levels):

- ✅ Use for 1-2 levels depth
- ✅ Explicit and easy to trace
- ❌ Avoid for deep component trees

**Context API**:

- ✅ Use for global state (auth, theme)
- ✅ Low-frequency updates
- ❌ Avoid for frequently changing data (performance issues)

**State Management Libraries** (Zustand, Redux):

- ✅ Use for complex global state
- ✅ Frequent updates across many components
- ❌ Avoid for simple apps (over-engineering)

```typescript
// ✅ GOOD - Context for global auth state
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ GOOD - Zustand for complex state
import { create } from "zustand";

interface QuizStore {
  currentQuestion: number;
  answers: Record<string, string[]>;
  setAnswer: (questionId: string, answer: string[]) => void;
  nextQuestion: () => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  currentQuestion: 0,
  answers: {},
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
  nextQuestion: () =>
    set((state) => ({ currentQuestion: state.currentQuestion + 1 })),
}));
```

### 6. Performance Optimization

#### A. Code Splitting and Lazy Loading

```typescript
// ✅ GOOD - Dynamic imports for heavy components
import dynamic from "next/dynamic";

const AdminPanel = dynamic(() => import("@/components/admin/AdminPanel"), {
  loading: () => <LoadingSkeleton />,
  ssr: false, // Disable SSR for client-only components
});

export function AdminPage() {
  return <AdminPanel />;
}
```

#### B. Image Optimization

```typescript
// ✅ GOOD - Use Next.js Image component
import Image from "next/image";

export function QuestionImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={600}
      height={400}
      placeholder="blur"
      blurDataURL="/placeholder.png"
      priority={false} // Lazy load by default
    />
  );
}

// ❌ BAD - Using <img> tag directly
<img src={src} alt={alt} />; // No optimization
```

#### C. Memoization

```typescript
// ✅ GOOD - Memoize expensive calculations
"use client";

import { useMemo } from "react";

export function QuizResults({ answers, questions }: QuizResultsProps) {
  const score = useMemo(() => {
    return calculateScore(answers, questions); // Expensive calculation
  }, [answers, questions]);

  return <div>Your score: {score}%</div>;
}

// ✅ GOOD - Memoize components that render often
import { memo } from "react";

export const QuestionCard = memo(function QuestionCard({ question }: Props) {
  return <Card>{question.text}</Card>;
});
```

### 7. Error Handling and Loading States

#### A. Error Boundaries (Next.js 13+)

```typescript
// app/error.tsx - Handles errors in route segments
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// app/global-error.tsx - Handles root layout errors
("use client");

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Global Error!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

#### B. Loading States

```typescript
// app/quiz/loading.tsx - Automatic loading UI
export default function Loading() {
  return <QuizSkeleton />;
}

// Or use Suspense boundaries
import { Suspense } from "react";

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <QuizContent />
    </Suspense>
  );
}
```

### 8. API Routes Best Practices

```typescript
// ✅ GOOD - Proper error handling and status codes
// app/api/questions/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

const questionSchema = z.object({
  examType: z.enum(["Developer-Associate", "Solutions-Architect-Associate"]),
  domain: z.string(),
  questionText: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validated = questionSchema.parse(body);

    // Business logic
    const question = await createQuestion(validated);

    // Return success
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Question creation failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ GOOD - Middleware for authentication
// app/api/admin/questions/route.ts
import { getServerSession } from "next-auth";

export async function DELETE(request: Request) {
  const session = await getServerSession();

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Admin logic here
}
```

### 9. Form Handling and Validation

```typescript
// ✅ GOOD - React Hook Form + Zod validation
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const questionSchema = z.object({
  questionText: z.string().min(10, "Question must be at least 10 characters"),
  options: z.array(z.string()).min(2).max(6),
  correctAnswers: z.array(z.string()).min(1),
});

type QuestionFormData = z.infer<typeof questionSchema>;

export function QuestionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
  });

  const onSubmit = async (data: QuestionFormData) => {
    const response = await fetch("/api/questions", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("questionText")} />
      {errors.questionText && <span>{errors.questionText.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### 10. SEO Optimization

```typescript
// ✅ GOOD - Metadata API (Next.js 13+)
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AWS Certification Quiz - Developer Associate",
  description:
    "Practice AWS Developer Associate exam questions with detailed explanations",
  openGraph: {
    title: "AWS Certification Quiz Platform",
    description: "Prepare for AWS certification exams",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AWS Certification Quiz",
    description: "Exam preparation platform",
  },
};

// ✅ GOOD - Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const exam = await getExam(params.id);

  return {
    title: `${exam.name} - AWS Certification Quiz`,
    description: exam.description,
  };
}
```

---

## III. Code Quality Standards

### 1. Naming Conventions

```typescript
// ✅ GOOD Naming Patterns

// Components: PascalCase
function QuestionCard() {}
function UserProfile() {}

// Functions/Variables: camelCase
const calculateScore = () => {};
const userProgress = getUserProgress();

// Constants: SCREAMING_SNAKE_CASE
const MAX_QUESTIONS = 50;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types/Interfaces: PascalCase
interface QuizSession {}
type ExamType = "Developer-Associate" | "Solutions-Architect-Associate";

// Files:
// - Components: PascalCase.tsx (QuestionCard.tsx)
// - Utilities: kebab-case.ts (quiz-scorer.ts)
// - Hooks: camelCase.ts (useQuizSession.ts)
```

### 2. Comments and Documentation

```typescript
// ✅ GOOD - JSDoc for public APIs
/**
 * Calculates the quiz score based on user answers.
 *
 * @param answers - User's selected answers for each question
 * @param questions - The quiz questions with correct answers
 * @returns The score as a percentage (0-100)
 *
 * @example
 * const score = calculateQuizScore(
 *   { 'q1': ['A'], 'q2': ['B', 'C'] },
 *   [question1, question2]
 * );
 */
export function calculateQuizScore(
  answers: Record<string, string[]>,
  questions: Question[]
): number {
  // Implementation
}

// ✅ GOOD - Self-documenting code (minimize comments)
const unansweredQuestions = questions.filter((q) => !answers[q.id]);

// ❌ BAD - Obvious comments
// Loop through questions
for (const question of questions) {
  // Check if answered
  if (answers[question.id]) {
    // Increment count
    count++;
  }
}
```

### 3. Testing Strategy

```typescript
// ✅ GOOD - Unit tests for utilities
// lib/__tests__/quiz-scorer.test.ts
import { describe, it, expect } from "vitest";
import { calculateQuizScore } from "../quiz-scorer";

describe("calculateQuizScore", () => {
  it("returns 100 for all correct answers", () => {
    const answers = { q1: ["A"], q2: ["B"] };
    const questions = [
      { id: "q1", correctAnswers: ["A"] },
      { id: "q2", correctAnswers: ["B"] },
    ];

    expect(calculateQuizScore(answers, questions)).toBe(100);
  });

  it("returns 0 for all incorrect answers", () => {
    const answers = { q1: ["B"], q2: ["A"] };
    const questions = [
      { id: "q1", correctAnswers: ["A"] },
      { id: "q2", correctAnswers: ["B"] },
    ];

    expect(calculateQuizScore(answers, questions)).toBe(0);
  });
});

// ✅ GOOD - Component tests with React Testing Library
// components/__tests__/QuestionCard.test.tsx
import { render, screen } from "@testing-library/react";
import { QuestionCard } from "../QuestionCard";

describe("QuestionCard", () => {
  const mockQuestion = {
    id: "q1",
    questionText: "What is AWS Lambda?",
    options: [
      { id: "A", text: "Serverless compute" },
      { id: "B", text: "Container service" },
    ],
  };

  it("renders question text", () => {
    render(<QuestionCard question={mockQuestion} />);
    expect(screen.getByText("What is AWS Lambda?")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(<QuestionCard question={mockQuestion} />);
    expect(screen.getByText("Serverless compute")).toBeInTheDocument();
    expect(screen.getByText("Container service")).toBeInTheDocument();
  });
});
```

### 4. Linting and Formatting

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## IV. Security Best Practices

### 1. Input Validation and Sanitization

```typescript
// ✅ GOOD - Always validate user input
import { z } from "zod";

const userInputSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.array(z.string()).max(6),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = userInputSchema.parse(body); // Throws if invalid

  // Safe to use validated data
}

// ❌ BAD - No validation
export async function POST(request: Request) {
  const body = await request.json();
  // Directly using user input (SQL injection, XSS risk)
  await db.query(`SELECT * FROM questions WHERE id = ${body.id}`);
}
```

### 2. Authentication and Authorization

```typescript
// ✅ GOOD - Server-side auth checks
import { getServerSession } from "next-auth";

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session || !session.user.isAdmin) {
    redirect("/login");
  }

  // Admin content here
}

// ❌ BAD - Client-side only auth check
("use client");

export default function AdminPage() {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <div>Access denied</div>; // Can be bypassed!
  }

  // Admin content still sent to client
}
```

### 3. Environment Variables

```typescript
// ✅ GOOD - Type-safe environment variables
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

// ❌ BAD - Unvalidated env variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Could be undefined!
```

---

## V. Accessibility (a11y)

```typescript
// ✅ GOOD - Semantic HTML and ARIA labels
export function QuestionCard({ question }: Props) {
  return (
    <article aria-labelledby="question-title">
      <h2 id="question-title">{question.text}</h2>

      <fieldset>
        <legend className="sr-only">Select your answer</legend>
        {question.options.map((option) => (
          <label key={option.id}>
            <input
              type="radio"
              name="answer"
              value={option.id}
              aria-describedby={`option-${option.id}`}
            />
            <span id={`option-${option.id}`}>{option.text}</span>
          </label>
        ))}
      </fieldset>
    </article>
  );
}

// ✅ GOOD - Keyboard navigation
export function QuizNavigation({
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
}: Props) {
  return (
    <nav aria-label="Quiz navigation">
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Previous question"
      >
        Previous
      </button>

      <button onClick={onNext} disabled={!canGoNext} aria-label="Next question">
        Next
      </button>
    </nav>
  );
}
```

---

## VI. Summary Checklist

Before committing code, verify:

- [ ] **TypeScript**: All code uses TypeScript with strict mode
- [ ] **Server Components**: Used by default unless interactivity needed
- [ ] **DRY**: No duplicated logic; extracted to functions/hooks
- [ ] **KISS**: Simple, readable solutions; no over-engineering
- [ ] **YAGNI**: Only implemented current requirements
- [ ] **SOLID**: Single responsibility, proper abstractions
- [ ] **Performance**: Images optimized, code split, memoized when needed
- [ ] **Error Handling**: Try-catch blocks, error boundaries, loading states
- [ ] **Security**: Input validation, auth checks, env variables secured
- [ ] **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- [ ] **Testing**: Unit tests for utilities, component tests for UI
- [ ] **Linting**: No ESLint errors, Prettier formatted
- [ ] **Documentation**: JSDoc for public APIs, README updated

---

## VII. Common Anti-Patterns to Avoid

### ❌ DON'T: Use Client Components Everywhere

```typescript
// ❌ BAD
"use client"; // Unnecessary!

export function StaticContent({ text }: { text: string }) {
  return <div>{text}</div>; // No interactivity
}
```

### ❌ DON'T: Fetch Data in useEffect

```typescript
// ❌ BAD
"use client";

export function Questions() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then(setQuestions);
  }, []); // Race conditions, no error handling
}

// ✅ GOOD - Use SWR or Server Component
("use client");

export function Questions() {
  const { data, error } = useSWR("/api/questions", fetcher);
  // Handles caching, revalidation, errors
}
```

### ❌ DON'T: Use `any` Type

```typescript
// ❌ BAD
function processData(data: any) {
  return data.map((item: any) => item.value); // No type safety
}

// ✅ GOOD
interface DataItem {
  id: string;
  value: number;
}

function processData(data: DataItem[]) {
  return data.map((item) => item.value); // Type-safe
}
```

### ❌ DON'T: Ignore Error Handling

```typescript
// ❌ BAD
async function saveQuestion(question: Question) {
  await fetch("/api/questions", {
    method: "POST",
    body: JSON.stringify(question),
  }); // What if it fails?
}

// ✅ GOOD
async function saveQuestion(question: Question) {
  try {
    const response = await fetch("/api/questions", {
      method: "POST",
      body: JSON.stringify(question),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save question");
    }

    return await response.json();
  } catch (error) {
    console.error("Save failed:", error);
    throw error; // Re-throw for caller to handle
  }
}
```

### ❌ DON'T: Over-Complicate State Management

```typescript
// ❌ BAD - Redux/Zustand for simple LOCAL component state
const store = configureStore({
  reducer: {
    quiz: quizReducer,
    questions: questionsReducer,
    answers: answersReducer,
  },
});

function QuizPage() {
  const dispatch = useDispatch();
  const currentQuestion = useSelector((state) => state.quiz.currentQuestion);
  // Over-engineered for local state
}

// ✅ GOOD - React state for simple LOCAL state
function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  // Simple and sufficient for component-only state
}

// ✅ ALSO GOOD - Zustand for SHARED global state (as shown in section 5.B)
// When state is shared across multiple unrelated components
export const useQuizStore = create<QuizStore>((set) => ({
  currentQuestion: 0,
  answers: {},
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
}));

// Rule of thumb:
// - Local state (one component) → useState
// - Shared state (multiple components) → Context API or Zustand
// - Complex global state (many features) → Redux or Zustand
```

---

## VIII. Resources and Learning

- **Official Next.js Documentation**: https://nextjs.org/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/
- **React Server Components**: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID
- **Clean Code by Robert C. Martin**: Book on writing maintainable code
- **Next.js Best Practices**: https://nextjs.org/docs/app/building-your-application/optimizing

---

**Remember**: Clean code is not just about making it work—it's about making it maintainable, testable, and scalable for future developers (including future you!).
