/**
 * Quiz Page - AWS Certification Practice Quiz
 *
 * Real exam simulator behavior:
 * - Navigate forward/backward through questions
 * - Change answers before final submission
 * - No immediate feedback - see results only after submitting entire exam
 * - 10 questions for testing (first option from dropdown)
 */

"use client";

import { useState } from "react";
import { QuizSelector } from "@/components/quiz/QuizSelector";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, RotateCcw, Home, CheckCircle2, XCircle } from "lucide-react";
import type { ExamType, Question } from "@/types";

// Mock questions for development (10 questions for Developer Associate)
const MOCK_QUESTIONS: Question[] = [
  {
    id: "DEV-001",
    examType: "Developer-Associate",
    domain: "Development with AWS Services",
    questionType: "single-choice",
    difficulty: "medium",
    questionText:
      "Which AWS service should you use to store session state data for a distributed web application?",
    options: [
      { id: "A", text: "Amazon S3" },
      { id: "B", text: "Amazon DynamoDB" },
      { id: "C", text: "Amazon RDS" },
      { id: "D", text: "Amazon EFS" },
    ],
    correctAnswers: ["B"],
    explanation:
      "Amazon DynamoDB is a fully managed NoSQL database that provides fast and predictable performance with seamless scalability. It's ideal for storing session state data due to its low latency and high availability.",
    references: [
      "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/",
    ],
    status: "approved",
    timesAnswered: 0,
    timesCorrect: 0,
    averageTimeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "DEV-002",
    examType: "Developer-Associate",
    domain: "Development with AWS Services",
    questionType: "multiple-choice",
    difficulty: "medium",
    questionText:
      "Which of the following are valid ways to trigger an AWS Lambda function? (Select TWO)",
    options: [
      { id: "A", text: "Amazon API Gateway" },
      { id: "B", text: "Amazon S3 events" },
      { id: "C", text: "Amazon RDS database queries" },
      { id: "D", text: "SSH connection" },
    ],
    correctAnswers: ["A", "B"],
    explanation:
      "Lambda functions can be triggered by API Gateway for HTTP requests and S3 events for object uploads/deletions. RDS doesn't directly trigger Lambda, and SSH connections are not a Lambda trigger mechanism.",
    references: [
      "https://docs.aws.amazon.com/lambda/latest/dg/lambda-invocation.html",
    ],
    status: "approved",
    timesAnswered: 0,
    timesCorrect: 0,
    averageTimeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "DEV-003",
    examType: "Developer-Associate",
    domain: "Deployment",
    questionType: "single-choice",
    difficulty: "easy",
    questionText:
      "What is the maximum timeout duration for an AWS Lambda function?",
    options: [
      { id: "A", text: "5 minutes" },
      { id: "B", text: "10 minutes" },
      { id: "C", text: "15 minutes" },
      { id: "D", text: "30 minutes" },
    ],
    correctAnswers: ["C"],
    explanation:
      "AWS Lambda functions have a maximum timeout of 15 minutes (900 seconds). If your function requires more time, consider using AWS Step Functions or EC2 instances.",
    references: [
      "https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html",
    ],
    status: "approved",
    timesAnswered: 0,
    timesCorrect: 0,
    averageTimeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "DEV-004",
    examType: "Developer-Associate",
    domain: "Monitoring and Troubleshooting",
    questionType: "single-choice",
    difficulty: "medium",
    questionText:
      "Which AWS service should you use to trace requests across multiple AWS services in a distributed application?",
    options: [
      { id: "A", text: "Amazon CloudWatch Logs" },
      { id: "B", text: "AWS X-Ray" },
      { id: "C", text: "AWS CloudTrail" },
      { id: "D", text: "Amazon EventBridge" },
    ],
    correctAnswers: ["B"],
    explanation:
      "AWS X-Ray helps developers analyze and debug distributed applications. It provides end-to-end request tracing across AWS services.",
    references: [
      "https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html",
    ],
    status: "approved",
    timesAnswered: 0,
    timesCorrect: 0,
    averageTimeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "DEV-005",
    examType: "Developer-Associate",
    domain: "Security and Compliance",
    questionType: "single-choice",
    difficulty: "medium",
    questionText:
      "Which service should you use to manage API keys and database passwords in AWS?",
    options: [
      { id: "A", text: "AWS Systems Manager Parameter Store" },
      { id: "B", text: "AWS Secrets Manager" },
      { id: "C", text: "Amazon S3" },
      { id: "D", text: "AWS IAM" },
    ],
    correctAnswers: ["B"],
    explanation:
      "AWS Secrets Manager is specifically designed for managing secrets like API keys, passwords, and database credentials with automatic rotation capabilities.",
    references: [
      "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html",
    ],
    status: "approved",
    timesAnswered: 0,
    timesCorrect: 0,
    averageTimeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "DEV-006",
    examType: "Developer-Associate",
    domain: "Development with AWS Services",
    questionType: "single-choice",
    difficulty: "hard",
    questionText:
      "You need to process large files uploaded to S3 without provisioning servers. Which combination of services is most appropriate?",
    options: [
      { id: "A", text: "S3 + EC2 Auto Scaling" },
      { id: "B", text: "S3 + Lambda + SQS" },
      { id: "C", text: "S3 + ECS Fargate" },
      { id: "D", text: "S3 + Elastic Beanstalk" },
    ],
    correctAnswers: ["B"],
    explanation:
      "S3 can trigger Lambda functions, and SQS can be used as a buffer for processing large files asynchronously without provisioning servers.",
    references: [
      "https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html",
    ],
    status: "approved",
    timesAnswered: 0,
    timesCorrect: 0,
    averageTimeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "DEV-007",
    examType: "Developer-Associate",
    domain: "Deployment",
    questionType: "multiple-choice",
    difficulty: "medium",
    questionText:
      "Which deployment strategies are supported by AWS CodeDeploy? (Select TWO)",
    options: [
      { id: "A", text: "Blue/Green deployment" },
      { id: "B", text: "Canary deployment" },
      { id: "C", text: "Multi-region deployment" },
      { id: "D", text: "Database migration" },
    ],
    correctAnswers: ["A", "B"],
    explanation:
      "AWS CodeDeploy supports Blue/Green and Canary deployment strategies for minimizing downtime and risk during application updates.",
    references: [
      "https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html",
    ],
    status: "approved",
    timesAnswered: 0,
    timesCorrect: 0,
    averageTimeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "DEV-008",
    examType: "Developer-Associate",
    domain: "Monitoring and Troubleshooting",
    questionType: "single-choice",
    difficulty: "easy",
    questionText: "What is the default retention period for CloudWatch Logs?",
    options: [
      { id: "A", text: "1 day" },
      { id: "B", text: "7 days" },
      { id: "C", text: "Never expires" },
      { id: "D", text: "30 days" },
    ],
    correctAnswers: ["C"],
    explanation:
      "CloudWatch Logs retains log data indefinitely by default. You can configure retention periods from 1 day to 10 years.",
    references: [
      "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html",
    ],
    status: "approved",
    timesAnswered: 0,
    timesCorrect: 0,
    averageTimeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "DEV-009",
    examType: "Developer-Associate",
    domain: "Security and Compliance",
    questionType: "single-choice",
    difficulty: "medium",
    questionText:
      "Which IAM policy type is used to define permissions for AWS services to access other AWS services?",
    options: [
      { id: "A", text: "Identity-based policy" },
      { id: "B", text: "Resource-based policy" },
      { id: "C", text: "Service control policy" },
      { id: "D", text: "Trust policy" },
    ],
    correctAnswers: ["D"],
    explanation:
      "Trust policies (assume role policies) define which entities can assume a role, enabling AWS services to access other services.",
    references: [
      "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_terms-and-concepts.html",
    ],
    status: "approved",
    timesAnswered: 0,
    timesCorrect: 0,
    averageTimeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "DEV-010",
    examType: "Developer-Associate",
    domain: "Development with AWS Services",
    questionType: "single-choice",
    difficulty: "medium",
    questionText:
      "What is the minimum amount of memory you can allocate to an AWS Lambda function?",
    options: [
      { id: "A", text: "64 MB" },
      { id: "B", text: "128 MB" },
      { id: "C", text: "256 MB" },
      { id: "D", text: "512 MB" },
    ],
    correctAnswers: ["B"],
    explanation:
      "AWS Lambda allows memory allocation from 128 MB to 10,240 MB (10 GB) in 1 MB increments. CPU and network resources scale proportionally with memory.",
    references: [
      "https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html",
    ],
    status: "approved",
    timesAnswered: 0,
    timesCorrect: 0,
    averageTimeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
];

type QuizState = "selection" | "in-progress" | "completed";

export default function QuizPage() {
  const [quizState, setQuizState] = useState<QuizState>("selection");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleStartQuiz = async (selectedExam: ExamType) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use first 10 questions
      const mockQuestions = MOCK_QUESTIONS.filter(
        (q) => q.examType === selectedExam
      ).slice(0, 10);

      setQuestions(mockQuestions);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setQuizState("in-progress");
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Failed to load questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (selectedAnswers: string[]) => {
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedAnswers,
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmitExam = () => {
    setQuizState("completed");
  };

  const handleRestart = () => {
    setQuizState("selection");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
  };

  const answeredCount = Object.keys(userAnswers).length;
  const allAnswered = answeredCount === questions.length;

  // Calculate score
  const score = questions.filter((question) => {
    const userAnswer = userAnswers[question.id] || [];
    return (
      userAnswer.length === question.correctAnswers.length &&
      userAnswer.every((ans) => question.correctAnswers.includes(ans))
    );
  }).length;

  const percentage =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // Quiz Selection State
  if (quizState === "selection") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <QuizSelector onStartQuiz={handleStartQuiz} isLoading={isLoading} />
      </div>
    );
  }

  // Quiz Completed State - Show Results with Answer Review
  if (quizState === "completed") {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Score Summary Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Trophy
                  className={`h-16 w-16 ${
                    percentage >= 70
                      ? "text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <CardTitle className="text-3xl">Exam Completed!</CardTitle>
              <CardDescription>
                {percentage >= 70
                  ? "Congratulations! You passed!"
                  : "Keep studying and try again!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score */}
              <div className="text-center space-y-2">
                <div className="text-6xl font-bold text-primary">
                  {percentage}%
                </div>
                <p className="text-muted-foreground">
                  {score} out of {questions.length} correct
                </p>
                <Badge
                  variant={percentage >= 70 ? "default" : "secondary"}
                  className="text-lg px-4 py-1"
                >
                  {percentage >= 70 ? "Pass (≥70%)" : "Fail (<70%)"}
                </Badge>
              </div>

              {/* Domain Performance */}
              <div className="space-y-2">
                <h3 className="font-semibold text-center">
                  Performance by Domain:
                </h3>
                {Object.entries(
                  questions.reduce((acc, question) => {
                    const domain = question.domain;
                    if (!acc[domain]) {
                      acc[domain] = { correct: 0, total: 0 };
                    }
                    acc[domain].total++;

                    const userAnswer = userAnswers[question.id] || [];
                    const isCorrect =
                      userAnswer.length === question.correctAnswers.length &&
                      userAnswer.every((ans) =>
                        question.correctAnswers.includes(ans)
                      );

                    if (isCorrect) {
                      acc[domain].correct++;
                    }
                    return acc;
                  }, {} as Record<string, { correct: number; total: number }>)
                ).map(([domain, stats]) => (
                  <div
                    key={domain}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="text-sm font-medium">{domain}</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.correct}/{stats.total} (
                      {Math.round((stats.correct / stats.total) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Answer Review Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">
              Review Your Answers
            </h2>
            {questions.map((question, index) => {
              const userAnswer = userAnswers[question.id] || [];
              const isCorrect =
                userAnswer.length === question.correctAnswers.length &&
                userAnswer.every((ans) =>
                  question.correctAnswers.includes(ans)
                );

              return (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader
                    className={`${
                      isCorrect
                        ? "bg-green-50 dark:bg-green-950"
                        : "bg-red-50 dark:bg-red-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        Question {index + 1} of {questions.length}
                      </CardTitle>
                      <Badge variant="outline">{question.domain}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <QuestionCard
                      question={question}
                      questionNumber={index + 1}
                      totalQuestions={questions.length}
                      onSubmitAnswer={() => {}}
                      onNext={() => {}}
                      showExplanation={true}
                      isCorrect={isCorrect}
                      selectedAnswers={userAnswer}
                      disabled={true}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Quiz In-Progress State - Real Exam Experience
  if (quizState === "in-progress" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestion.id] || [];

    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress Bar */}
          <Card>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length} |
                  Answered: {answeredCount}/{questions.length}
                </span>
              </div>
              <Progress
                value={(answeredCount / questions.length) * 100}
                className="h-2"
              />
            </div>
          </Card>

          {/* Alert if not all answered */}
          {!allAnswered && (
            <Alert>
              <AlertDescription>
                You have {questions.length - answeredCount} unanswered
                question(s). You can navigate between questions and change your
                answers before submitting.
              </AlertDescription>
            </Alert>
          )}

          {/* Question Card - No Immediate Feedback */}
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onSubmitAnswer={handleAnswerChange}
            onNext={handleNextQuestion}
            showExplanation={false}
            isCorrect={undefined}
            selectedAnswers={currentAnswer}
            disabled={false}
          />

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </Button>

            <div className="flex gap-3">
              {allAnswered && (
                <Button
                  onClick={handleSubmitExam}
                  className="bg-primary hover:bg-primary/90"
                >
                  Submit Exam
                </Button>
              )}

              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
