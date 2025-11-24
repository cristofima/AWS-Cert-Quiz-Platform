/**
 * Progress Page - Phase 1
 * Coming Soon placeholder for domain-level analytics
 * Phase 2 will show detailed performance tracking from DynamoDB
 */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  Target,
  BarChart3,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProgressPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
        <p className="text-muted-foreground mt-2">
          Detailed analytics and performance insights
        </p>
      </div>

      {/* Coming Soon Alert */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Phase 2 Feature:</strong> Domain-level analytics and
          performance tracking will be available soon!
        </AlertDescription>
      </Alert>

      {/* Feature Preview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Performance Analytics</CardTitle>
            <CardDescription>Track your score trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Average score by exam type</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Performance trends and improvement graphs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Best and worst performing areas</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Target className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Domain Breakdown</CardTitle>
            <CardDescription>
              Identify strengths and weaknesses by domain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Accuracy per knowledge domain</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Total questions answered by topic</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Personalized recommendations</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Study Insights</CardTitle>
            <CardDescription>
              Get AI-powered study recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Suggested areas to focus on</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Learning path recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Readiness indicators for certification</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <Clock className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Meanwhile...</CardTitle>
            <CardDescription>
              Keep practicing to build your quiz history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The more quizzes you take, the better insights you&apos;ll get in
              Phase 2!
            </p>
            <div className="flex gap-2">
              <Link href="/portal/quiz" className="flex-1">
                <Button className="w-full">Take Quiz</Button>
              </Link>
              <Link href="/portal/history" className="flex-1">
                <Button variant="outline" className="w-full">
                  View History
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">What to expect in Phase 2:</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once Phase 2 is deployed, this page will display:
          </p>
          <div className="grid gap-3 md:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Performance Metrics</strong>
              <ul className="mt-1 space-y-1 ml-4 list-disc">
                <li>Overall accuracy by exam type</li>
                <li>Score progression over time</li>
                <li>Question difficulty analysis</li>
              </ul>
            </div>
            <div>
              <strong className="text-foreground">Domain Analytics</strong>
              <ul className="mt-1 space-y-1 ml-4 list-disc">
                <li>Correct/incorrect by domain</li>
                <li>Weak areas identification</li>
                <li>Study recommendations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
