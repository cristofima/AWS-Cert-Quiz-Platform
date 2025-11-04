/**
 * QuizSelector Component
 *
 * Allows users to configure their quiz session by selecting:
 * - Exam type (Developer Associate, Solutions Architect, SysOps)
 * - Number of questions (10, 20, 30, 50)
 *
 * This component is used at the start of a quiz session.
 */

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ExamType } from "@/types";

interface QuizSelectorProps {
  onStartQuiz: (examType: ExamType, questionCount: number) => void;
  isLoading?: boolean;
}

const EXAM_TYPES: { value: ExamType; label: string; domains: number }[] = [
  {
    value: "Developer-Associate",
    label: "AWS Developer Associate",
    domains: 5,
  },
  {
    value: "Solutions-Architect-Associate",
    label: "AWS Solutions Architect Associate",
    domains: 4,
  },
  {
    value: "SysOps-Administrator-Associate",
    label: "AWS SysOps Administrator Associate",
    domains: 6,
  },
];

const QUESTION_COUNTS = [10, 20, 30, 50];

export function QuizSelector({
  onStartQuiz,
  isLoading = false,
}: QuizSelectorProps) {
  const [selectedExam, setSelectedExam] = useState<ExamType | "">("");
  const [selectedCount, setSelectedCount] = useState<number>(20);

  const handleStartQuiz = () => {
    if (selectedExam) {
      onStartQuiz(selectedExam, selectedCount);
    }
  };

  const selectedExamData = EXAM_TYPES.find(
    (exam) => exam.value === selectedExam
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Start a Quiz</CardTitle>
        <CardDescription>
          Select your certification exam and the number of questions you want to
          practice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exam Type Selection */}
        <div className="space-y-2">
          <label
            htmlFor="exam-type"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Certification Exam
          </label>
          <Select
            value={selectedExam}
            onValueChange={(value) => setSelectedExam(value as ExamType)}
          >
            <SelectTrigger id="exam-type">
              <SelectValue placeholder="Select an exam" />
            </SelectTrigger>
            <SelectContent>
              {EXAM_TYPES.map((exam) => (
                <SelectItem key={exam.value} value={exam.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{exam.label}</span>
                    <Badge variant="secondary" className="ml-2">
                      {exam.domains} domains
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedExamData && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedExamData.label} ({selectedExamData.domains}{" "}
              knowledge domains)
            </p>
          )}
        </div>

        {/* Question Count Selection */}
        <div className="space-y-2">
          <label
            htmlFor="question-count"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Number of Questions
          </label>
          <Select
            value={selectedCount.toString()}
            onValueChange={(value) => setSelectedCount(parseInt(value))}
          >
            <SelectTrigger id="question-count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_COUNTS.map((count) => (
                <SelectItem key={count} value={count.toString()}>
                  {count} questions
                  {count === 20 && (
                    <Badge variant="outline" className="ml-2">
                      Recommended
                    </Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Estimated time: {Math.ceil(selectedCount * 1.5)} -{" "}
            {selectedCount * 2} minutes
          </p>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStartQuiz}
          disabled={!selectedExam || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Loading Questions..." : "Start Quiz"}
        </Button>

        {/* Info Box */}
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-1">💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Questions are randomly selected from the database</li>
            <li>Your progress is saved automatically</li>
            <li>You can review explanations after each question</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
