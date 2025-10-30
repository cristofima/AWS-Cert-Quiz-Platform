/**
 * Shared TypeScript types for the AWS Certification Quiz Platform
 */

// Question Types
export type QuestionType = "single-choice" | "multiple-choice" | "true-false" | "scenario-based";
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionStatus = "pending" | "approved" | "rejected" | "archived";

// Exam Types
export type ExamType =
    | "Developer-Associate"
    | "Solutions-Architect-Associate"
    | "SysOps-Administrator-Associate";

// Domain for Developer Associate
export type DeveloperDomain =
    | "Development with AWS Services"
    | "Security"
    | "Deployment"
    | "Troubleshooting and Optimization";

export interface Question {
    id: string;
    examType: ExamType;
    domain: string;
    questionType: QuestionType;
    difficulty: QuestionDifficulty;
    questionText: string;
    codeSnippet?: string;
    options: QuestionOption[];
    correctAnswers: string[]; // Array of option IDs (e.g., ["A"] or ["A", "C"])
    explanation: string;
    references: string[]; // AWS documentation URLs
    status: QuestionStatus;

    // Analytics
    timesAnswered: number;
    timesCorrect: number;
    averageTimeSpent: number; // seconds

    // Metadata
    createdAt: string;
    updatedAt: string;
    createdBy: "bedrock" | "admin";
}

export interface QuestionOption {
    id: string; // "A", "B", "C", "D"
    text: string;
}

export interface QuizSession {
    id: string;
    userId: string;
    examType: ExamType;
    questions: Question[];
    userAnswers: Record<string, string[]>; // questionId -> selected option IDs
    score?: number;
    percentage?: number;
    startedAt: string;
    completedAt?: string;
    timeSpent?: number; // seconds
}

export interface UserProgress {
    userId: string;
    examType: ExamType;
    domain: string;
    questionsAttempted: number;
    questionsCorrect: number;
    averageScore: number;
    lastAttemptAt: string;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    role: "user" | "admin";
    createdAt: string;
    lastLoginAt: string;
}

// API Response types
export interface QuizResponse {
    sessionId: string;
    questions: Question[];
    examType: ExamType;
    questionCount: number;
}

export interface SubmitQuizResponse {
    sessionId: string;
    score: number;
    percentage: number;
    totalQuestions: number;
    correctAnswers: number;
    results: QuestionResult[];
    domainPerformance: DomainPerformance[];
}

export interface QuestionResult {
    questionId: string;
    isCorrect: boolean;
    userAnswers: string[];
    correctAnswers: string[];
    question: Question;
}

export interface DomainPerformance {
    domain: string;
    questionsAttempted: number;
    questionsCorrect: number;
    percentage: number;
}

// Admin types
export interface BackgroundJob {
    id: string;
    type: "question-generation";
    status: "pending" | "running" | "completed" | "failed";
    examType: ExamType;
    domain?: string;
    questionCount: number;
    generatedCount?: number;
    startedAt: string;
    completedAt?: string;
    triggeredBy: "eventbridge" | "admin-manual";
    adminUserId?: string;
    errorMessage?: string;
}

export interface QuestionReview {
    questionId: string;
    reviewerId: string;
    action: "approve" | "reject" | "request-changes";
    comment?: string;
    reviewedAt: string;
}
