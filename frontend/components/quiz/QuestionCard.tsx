/**
 * QuestionCard Component
 *
 * Displays a single quiz question with multiple answer options.
 * Supports:
 * - Single-choice questions (radio buttons)
 * - Multiple-choice questions (checkboxes)
 * - True/False questions (radio buttons)
 * - Scenario-based questions (with context)
 *
 * Shows correct/incorrect feedback after answer submission.
 */

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (selectedAnswers: string[]) => void;
  onNext: () => void;
  showExplanation: boolean;
  isCorrect?: boolean;
  selectedAnswers?: string[]; // External state for exam mode
  disabled?: boolean; // For read-only review mode
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
  onNext,
  showExplanation,
  isCorrect,
  selectedAnswers: externalSelectedAnswers,
  disabled = false,
}: QuestionCardProps) {
  // Use external state if provided (exam mode), otherwise internal state
  const [internalSelectedAnswers, setInternalSelectedAnswers] = useState<
    string[]
  >([]);
  const selectedAnswers =
    externalSelectedAnswers !== undefined
      ? externalSelectedAnswers
      : internalSelectedAnswers;
  const setSelectedAnswers =
    externalSelectedAnswers !== undefined
      ? (answers: string[] | ((prev: string[]) => string[])) => {
          const newAnswers =
            typeof answers === "function" ? answers(selectedAnswers) : answers;
          onSubmitAnswer(newAnswers);
        }
      : setInternalSelectedAnswers;

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isMultipleChoice = question.questionType === "multiple-choice";
  const isSingleChoice =
    question.questionType === "single-choice" ||
    question.questionType === "true-false";

  const handleAnswerChange = (optionId: string) => {
    if (hasSubmitted || disabled) return; // Prevent changes after submission or in review mode

    if (isMultipleChoice) {
      // Toggle checkbox
      setSelectedAnswers((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      // Single selection (radio)
      setSelectedAnswers([optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return;
    setHasSubmitted(true);
    onSubmitAnswer(selectedAnswers);
  };

  const handleNext = () => {
    setSelectedAnswers([]);
    setHasSubmitted(false);
    onNext();
  };

  const getOptionClassName = (optionId: string) => {
    if (!showExplanation) return "";

    const isSelected = selectedAnswers.includes(optionId);
    const isCorrectAnswer = question.correctAnswers.includes(optionId);

    if (isCorrectAnswer) {
      return "border-green-500 bg-green-50 dark:bg-green-950";
    }

    if (isSelected && !isCorrectAnswer) {
      return "border-red-500 bg-red-50 dark:bg-red-950";
    }

    return "";
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">
            Question {questionNumber} of {totalQuestions}
          </Badge>
          <Badge variant="secondary">{question.domain}</Badge>
        </div>
        <CardTitle className="text-xl leading-relaxed">
          {question.questionText}
        </CardTitle>
        {question.scenario && (
          <CardDescription className="mt-4 p-4 bg-muted rounded-lg text-sm">
            <strong>Scenario:</strong> {question.scenario}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Type Indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>
            {isMultipleChoice
              ? "Select all that apply (multiple answers)"
              : "Select one answer"}
          </span>
        </div>

        {/* Answer Options */}
        {isSingleChoice ? (
          <RadioGroup
            value={selectedAnswers[0] || ""}
            onValueChange={handleAnswerChange}
            disabled={hasSubmitted}
          >
            <div className="space-y-3">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-4 border rounded-lg transition-colors cursor-pointer hover:bg-muted",
                    getOptionClassName(option.id),
                    hasSubmitted && "cursor-not-allowed"
                  )}
                  onClick={() => !hasSubmitted && handleAnswerChange(option.id)}
                >
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    disabled={hasSubmitted}
                  />
                  <label
                    htmlFor={option.id}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    <span className="font-medium">{option.id}.</span>{" "}
                    {option.text}
                  </label>
                  {showExplanation &&
                    question.correctAnswers.includes(option.id) && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  {showExplanation &&
                    selectedAnswers.includes(option.id) &&
                    !question.correctAnswers.includes(option.id) && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                </div>
              ))}
            </div>
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "flex items-center space-x-3 p-4 border rounded-lg transition-colors cursor-pointer hover:bg-muted",
                  getOptionClassName(option.id),
                  hasSubmitted && "cursor-not-allowed"
                )}
                onClick={() => !hasSubmitted && handleAnswerChange(option.id)}
              >
                <Checkbox
                  id={option.id}
                  checked={selectedAnswers.includes(option.id)}
                  onCheckedChange={() => handleAnswerChange(option.id)}
                  disabled={hasSubmitted}
                />
                <label
                  htmlFor={option.id}
                  className="flex-1 text-sm cursor-pointer"
                >
                  <span className="font-medium">{option.id}.</span>{" "}
                  {option.text}
                </label>
                {showExplanation &&
                  question.correctAnswers.includes(option.id) && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                {showExplanation &&
                  selectedAnswers.includes(option.id) &&
                  !question.correctAnswers.includes(option.id) && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Feedback and Explanation */}
        {showExplanation && (
          <div className="space-y-4 mt-6">
            <Alert variant={isCorrect ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <AlertDescription className="whitespace-nowrap">
                      Correct! Well done.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 flex-shrink-0" />
                    <AlertDescription className="whitespace-nowrap">
                      Incorrect. Review the explanation below.
                    </AlertDescription>
                  </>
                )}
              </div>
            </Alert>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="font-medium text-sm">Explanation:</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>

              {question.references && question.references.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium text-sm mb-2">References:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {question.references.map((ref, index) => (
                      <li key={index}>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Hide footer when in exam mode (external state) or review mode (disabled) */}
      {externalSelectedAnswers === undefined && !disabled && (
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            disabled={questionNumber === 1}
            onClick={() => {
              /* Handle previous question if needed */
            }}
          >
            Previous
          </Button>

          {!hasSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswers.length === 0}
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {questionNumber === totalQuestions
                ? "Finish Quiz"
                : "Next Question"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
