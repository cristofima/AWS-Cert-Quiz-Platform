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
import { fetchQuizQuestions } from "@/lib/graphql/quiz-service";
import { ProtectedRoute } from "@/lib/auth/protected-route";

type QuizState = "selection" | "in-progress" | "completed";

export default function QuizPage() {
  const [quizState, setQuizState] = useState<QuizState>("selection");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleStartQuiz = async (
    selectedExam: ExamType,
    count: number = 10
  ) => {
    setIsLoading(true);

    try {
      // Fetch real questions from AppSync GraphQL API
      const fetchedQuestions = await fetchQuizQuestions({
        examType: selectedExam,
        questionCount: count,
      });

      if (fetchedQuestions.length === 0) {
        throw new Error(
          `No questions found for ${selectedExam}. Please seed questions first using: python scripts/seed-questions.py --exam-type ${selectedExam} --count 60`
        );
      }

      setQuestions(fetchedQuestions);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setQuizState("in-progress");
    } catch (error) {
      console.error("Error fetching questions:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load questions. Please try again.";
      alert(errorMessage);
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
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center p-4">
          <QuizSelector onStartQuiz={handleStartQuiz} isLoading={isLoading} />
        </div>
      </ProtectedRoute>
    );
  }

  // Quiz Completed State - Show Results with Answer Review
  if (quizState === "completed") {
    return (
      <ProtectedRoute>
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
      </ProtectedRoute>
    );
  }

  // Quiz In-Progress State - Real Exam Experience
  if (quizState === "in-progress" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestion.id] || [];

    return (
      <ProtectedRoute>
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
                  question(s). You can navigate between questions and change
                  your answers before submitting.
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
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div>Loading...</div>
    </ProtectedRoute>
  );
}
