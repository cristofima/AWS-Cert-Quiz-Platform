/**
 * Quiz History Page
 * Shows all past quiz sessions with scores, dates, and exam types
 * Uses GraphQL query: getQuizHistory
 */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface QuizSession {
  sessionId: string;
  examType: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  completedAt: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with real GraphQL query
      // const { sessions } = await graphqlRequest({
      //   query: GET_QUIZ_HISTORY,
      //   variables: { limit: 50 }
      // });

      // Mock data for now
      const mockSessions: QuizSession[] = [
        {
          sessionId: "session-1",
          examType: "Developer-Associate",
          totalQuestions: 30,
          correctAnswers: 26,
          scorePercentage: 87,
          completedAt: "2024-01-15T10:30:00Z",
        },
        {
          sessionId: "session-2",
          examType: "Solutions-Architect-Associate",
          totalQuestions: 30,
          correctAnswers: 22,
          scorePercentage: 73,
          completedAt: "2024-01-14T14:20:00Z",
        },
        {
          sessionId: "session-3",
          examType: "Developer-Associate",
          totalQuestions: 30,
          correctAnswers: 24,
          scorePercentage: 80,
          completedAt: "2024-01-13T09:15:00Z",
        },
        {
          sessionId: "session-4",
          examType: "SysOps-Administrator-Associate",
          totalQuestions: 30,
          correctAnswers: 18,
          scorePercentage: 60,
          completedAt: "2024-01-12T16:45:00Z",
        },
        {
          sessionId: "session-5",
          examType: "Developer-Associate",
          totalQuestions: 30,
          correctAnswers: 27,
          scorePercentage: 90,
          completedAt: "2024-01-11T11:00:00Z",
        },
      ];

      setSessions(mockSessions);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load quiz history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getScoreBadgeVariant = (
    score: number
  ): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getTrendIcon = (score: number) => {
    if (score >= 80)
      return (
        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
      );
    if (score >= 60)
      return <Minus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
  };

  const calculateStats = () => {
    if (sessions.length === 0)
      return { totalQuizzes: 0, avgScore: 0, bestScore: 0 };

    const totalQuizzes = sessions.length;
    const avgScore = Math.round(
      sessions.reduce((sum, s) => sum + s.scorePercentage, 0) / totalQuizzes
    );
    const bestScore = Math.max(...sessions.map((s) => s.scorePercentage));

    return { totalQuizzes, avgScore, bestScore };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz History</h1>
          <p className="text-muted-foreground mt-2">
            Review all your past quiz sessions
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quiz History</h1>
        <p className="text-muted-foreground mt-2">
          Review all your past quiz sessions and track your progress over time
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.bestScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Personal best</p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quiz Sessions</CardTitle>
          <CardDescription>
            Complete history of your practice sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No quizzes yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Start taking quizzes to see your history here
              </p>
              <Button className="mt-4" asChild>
                <a href="/quiz">Take Your First Quiz</a>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Type</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Correct</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.sessionId}>
                      <TableCell className="font-medium">
                        {session.examType}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={getScoreBadgeVariant(
                            session.scorePercentage
                          )}
                        >
                          {session.scorePercentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {session.correctAnswers}
                      </TableCell>
                      <TableCell className="text-center">
                        {session.totalQuestions}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.completedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {getTrendIcon(session.scorePercentage)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
