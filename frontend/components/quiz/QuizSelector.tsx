/**
 * QuizSelector Component
 *
 * Allows users to configure their quiz session by selecting:
 * - Exam type (Developer Associate, Solutions Architect, SysOps)
 * - Number of questions (20, 30, 45, 65 - based on real AWS exam specs)
 *
 * Question counts match official AWS certification exam patterns:
 * - All Associate exams have 65 questions in the real exam
 * - Practice options: 20 (quick), 30 (standard), 45 (extended), 65 (full simulation)
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
import {
  EXAM_CONFIGS,
  calculateEstimatedTime,
  getExamConfig,
} from "@/lib/exam-config";

interface QuizSelectorProps {
  onStartQuiz: (examType: ExamType, questionCount: number) => void;
  isLoading?: boolean;
}

export function QuizSelector({
  onStartQuiz,
  isLoading = false,
}: QuizSelectorProps) {
  const [selectedExam, setSelectedExam] = useState<ExamType | "">("");
  const [selectedCount, setSelectedCount] = useState<number>(30); // Default to 30 questions

  const handleStartQuiz = () => {
    if (selectedExam) {
      onStartQuiz(selectedExam, selectedCount);
    }
  };

  const selectedExamConfig = selectedExam ? getExamConfig(selectedExam) : null;
  const estimatedTime = calculateEstimatedTime(selectedCount);

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
              {Object.values(EXAM_CONFIGS).map((examConfig) => (
                <SelectItem
                  key={examConfig.id}
                  value={examConfig.id}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{examConfig.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {examConfig.domains.length} domains
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedExamConfig && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Selected: {selectedExamConfig.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Official exam: {selectedExamConfig.questionCount}{" "}
                questions, {selectedExamConfig.duration} minutes
              </p>
            </div>
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
            disabled={!selectedExam}
          >
            <SelectTrigger id="question-count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50, selectedExamConfig?.questionCount].filter(Boolean).map((count) => (
                <SelectItem key={count} value={count!.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{count} questions</span>
                    {count === 20 && (
                      <Badge variant="outline">Recommended</Badge>
                    )}
                    {count === selectedExamConfig?.questionCount && (
                      <Badge variant="default">Full Exam</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Estimated time: ~{estimatedTime} minutes
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
            <li>Practice with different question counts to build confidence</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
