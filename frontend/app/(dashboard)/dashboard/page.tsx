/**
 * Dashboard Overview Page - Phase 1
 * Simple welcome page with quick actions
 * Phase 2 will add statistics and recent quizzes from DynamoDB
 */
"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Target, ArrowRight, History, Clock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || user?.username || "User"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Ready to practice for your AWS certification exam?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Start New Quiz</CardTitle>
            <CardDescription>
              Practice with a new set of questions to improve your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/quiz">
              <Button className="w-full" size="lg">
                <Target className="mr-2 h-5 w-5" />
                Take Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View History</CardTitle>
            <CardDescription>
              Review your past quiz sessions and track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/history">
              <Button variant="outline" className="w-full" size="lg">
                <History className="mr-2 h-5 w-5" />
                View History
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Banner - Phase 2 Features */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                More Features Coming Soon! 🚀
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                In Phase 2, this dashboard will show:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>📊 Your quiz statistics (total taken, average score)</li>
                <li>📈 Performance trends and progress tracking</li>
                <li>📋 Recent quiz sessions with quick access</li>
                <li>🎯 Personalized recommendations</li>
                <li>📉 Domain-level analytics and weak areas</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                For now, focus on taking quizzes and reviewing your history!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Practice Modes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Choose from 20, 30, 45, or 65 questions per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exam Types</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Developer Associate, Solutions Architect, and SysOps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Track Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>View your complete quiz history anytime</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
