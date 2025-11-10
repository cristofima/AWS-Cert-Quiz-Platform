# 🔌 GraphQL Integration Guide

## Overview

This guide provides step-by-step instructions for connecting the dashboard UI to the AWS AppSync GraphQL backend.

## 📋 Prerequisites

- ✅ DynamoDB tables deployed (questions, quiz-sessions, user-progress)
- ✅ AppSync API configured with resolvers
- ✅ Lambda functions deployed (quiz-selector, score-calculator)
- ✅ Frontend environment variables set (`.env.local`)

---

## 🔗 Integration Steps

### Step 1: Add GraphQL Queries to `lib/graphql/queries.ts`

```typescript
// Add these queries to the existing file

export const GET_QUIZ_HISTORY = `
  query GetQuizHistory($limit: Int, $nextToken: String) {
    getQuizHistory(limit: $limit, nextToken: $nextToken) {
      sessions {
        sessionId
        examType
        totalQuestions
        correctAnswers
        scorePercentage
        completedAt
      }
      nextToken
    }
  }
`;

export const GET_USER_PROGRESS = `
  query GetUserProgress($examType: String!) {
    getUserProgress(examType: $examType) {
      userId
      examType
      quizzesTaken
      averageScore
      lastScore
      domainScores {
        domain
        correct
        total
        percentage
      }
      lastUpdated
    }
  }
`;
```

---

### Step 2: Update History Page (`app/(dashboard)/history/page.tsx`)

**Replace this section (lines ~48-96):**

```typescript
// BEFORE (Mock data)
const mockSessions: QuizSession[] = [
  {
    sessionId: "session-1",
    examType: "Developer-Associate",
    // ... more mock data
  },
];

setSessions(mockSessions);
```

**With this (Real data):**

```typescript
// AFTER (Real data from GraphQL)
import { graphqlRequest } from "@/lib/graphql/client";
import { GET_QUIZ_HISTORY } from "@/lib/graphql/queries";

const fetchHistory = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await graphqlRequest({
      query: GET_QUIZ_HISTORY,
      variables: { limit: 50 },
    });

    if (response.getQuizHistory) {
      setSessions(response.getQuizHistory.sessions);
    } else {
      setSessions([]);
    }
  } catch (err) {
    console.error("Error fetching history:", err);
    setError("Failed to load quiz history. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
```

**Add imports at top:**

```typescript
import { graphqlRequest } from "@/lib/graphql/client";
import { GET_QUIZ_HISTORY } from "@/lib/graphql/queries";
```

---

### Step 3: Update Progress Page (`app/(dashboard)/progress/page.tsx`)

**Replace this section (lines ~59-134):**

```typescript
// BEFORE (Mock data)
const mockProgress: Record<string, UserProgress> = {
  "Developer-Associate": {
    userId: "user-123",
    examType: "Developer-Associate",
    // ... more mock data
  },
};

setProgressData(mockProgress);
```

**With this (Real data):**

```typescript
// AFTER (Real data from GraphQL)
import { graphqlRequest } from "@/lib/graphql/client";
import { GET_USER_PROGRESS } from "@/lib/graphql/queries";

const fetchProgress = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const progressResults: Record<string, UserProgress> = {};

    // Fetch progress for each exam type
    await Promise.all(
      EXAM_TYPES.map(async (examType) => {
        try {
          const response = await graphqlRequest({
            query: GET_USER_PROGRESS,
            variables: { examType },
          });

          if (response.getUserProgress) {
            progressResults[examType] = response.getUserProgress;
          }
        } catch (err) {
          console.log(`No progress data for ${examType}`);
          // Don't throw error, just skip this exam type
        }
      })
    );

    setProgressData(progressResults);
  } catch (err) {
    console.error("Error fetching progress:", err);
    setError("Failed to load progress data. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
```

**Add imports at top:**

```typescript
import { graphqlRequest } from "@/lib/graphql/client";
import { GET_USER_PROGRESS } from "@/lib/graphql/queries";
```

---

### Step 4: Update Dashboard Page (`app/(dashboard)/dashboard/page.tsx`)

**Replace mock stats (lines ~23-32):**

```typescript
// BEFORE (Mock data)
const stats = {
  quizzesTaken: 12,
  averageScore: 78,
  lastScore: 85,
  totalQuestionsAnswered: 360,
};

const recentQuizzes = [
  {
    id: "1",
    examType: "Developer-Associate",
    // ... mock data
  },
];
```

**With this (Real data):**

```typescript
// AFTER (Real data from GraphQL)
import { useEffect, useState } from "react";
import { graphqlRequest } from "@/lib/graphql/client";
import { GET_QUIZ_HISTORY } from "@/lib/graphql/queries";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
    lastScore: 0,
    totalQuestionsAnswered: 0,
  });
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await graphqlRequest({
        query: GET_QUIZ_HISTORY,
        variables: { limit: 3 }, // Only last 3 for dashboard
      });

      if (response.getQuizHistory) {
        const sessions = response.getQuizHistory.sessions;

        // Calculate stats
        const quizzesTaken = sessions.length;
        const averageScore =
          quizzesTaken > 0
            ? Math.round(
                sessions.reduce(
                  (sum: number, s: any) => sum + s.scorePercentage,
                  0
                ) / quizzesTaken
              )
            : 0;
        const lastScore = quizzesTaken > 0 ? sessions[0].scorePercentage : 0;
        const totalQuestionsAnswered = sessions.reduce(
          (sum: number, s: any) => sum + s.totalQuestions,
          0
        );

        setStats({
          quizzesTaken,
          averageScore,
          lastScore,
          totalQuestionsAnswered,
        });
        setRecentQuizzes(sessions);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // ... rest of component
}
```

**Add imports at top:**

```typescript
import { useEffect, useState } from "react";
import { graphqlRequest } from "@/lib/graphql/client";
import { GET_QUIZ_HISTORY } from "@/lib/graphql/queries";
```

---

## 🧪 Testing Integration

### Test 1: History Page

1. Take at least 2 quizzes using the quiz page
2. Navigate to History page
3. ✅ Should show real quiz sessions from DynamoDB
4. ✅ Stats should calculate correctly (total, average, best)

### Test 2: Progress Page

1. Take quizzes for different exam types
2. Navigate to Progress page
3. Switch between exam type tabs
4. ✅ Should show real domain scores
5. ✅ Recommendations should appear for weak domains

### Test 3: Dashboard Page

1. Login and navigate to dashboard
2. ✅ Stats should reflect real quiz data
3. ✅ Recent quizzes should show last 3 sessions
4. ✅ Empty state for new users who haven't taken quizzes

---

## 🐛 Troubleshooting

### Issue 1: "Cannot read property 'sessions' of undefined"

**Cause:** GraphQL query returned null or error

**Solution:**

```typescript
// Add null checks
if (response && response.getQuizHistory && response.getQuizHistory.sessions) {
  setSessions(response.getQuizHistory.sessions);
} else {
  setSessions([]);
}
```

### Issue 2: "Unauthorized" error

**Cause:** JWT token not included in request

**Solution:**

- Check that `configureAmplify()` is called
- Verify user is logged in: `const { user } = useAuth()`
- Check `.env.local` has correct Cognito credentials

### Issue 3: Empty data despite taking quizzes

**Cause 1:** Quiz submission didn't save to DynamoDB

**Check:** Lambda logs in CloudWatch

```bash
aws logs tail /aws/lambda/cert-quiz-score-calculator --follow
```

**Cause 2:** Wrong user ID in query

**Check:** User ID matches between Cognito and DynamoDB

```typescript
console.log("User ID:", user?.userId);
```

### Issue 4: Score calculations incorrect

**Cause:** Domain scores aggregation logic

**Solution:** Check Lambda `score-calculator` function:

```typescript
// Ensure domainScores are being updated correctly
domainScores[domain] = {
  correct: correctInDomain,
  total: totalInDomain,
  percentage: Math.round((correctInDomain / totalInDomain) * 100),
};
```

---

## 🚀 Performance Optimizations

### Optimization 1: Caching with SWR

**Install SWR:**

```bash
npm install swr
```

**Update History page:**

```typescript
import useSWR from "swr";

const fetcher = (query: string) =>
  graphqlRequest({ query }).then((res) => res.getQuizHistory.sessions);

export default function HistoryPage() {
  const {
    data: sessions,
    error,
    isLoading,
  } = useSWR(GET_QUIZ_HISTORY, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every 60 seconds
  });

  // No need for useEffect, SWR handles fetching
}
```

### Optimization 2: Pagination for History

**Add "Load More" button:**

```typescript
const [nextToken, setNextToken] = useState<string | null>(null);

const loadMore = async () => {
  const response = await graphqlRequest({
    query: GET_QUIZ_HISTORY,
    variables: { limit: 20, nextToken },
  });

  if (response.getQuizHistory) {
    setSessions((prev) => [...prev, ...response.getQuizHistory.sessions]);
    setNextToken(response.getQuizHistory.nextToken);
  }
};

// In JSX
{
  nextToken && <Button onClick={loadMore}>Load More</Button>;
}
```

### Optimization 3: Debounce Dashboard Updates

**Install lodash:**

```bash
npm install lodash
npm install --save-dev @types/lodash
```

**Add debounce:**

```typescript
import { debounce } from "lodash";

const fetchDashboardData = debounce(async () => {
  // Fetch logic
}, 500);
```

---

## 📊 Sample GraphQL Responses

### getQuizHistory Response

```json
{
  "data": {
    "getQuizHistory": {
      "sessions": [
        {
          "sessionId": "user-123#SESSION#1705320600000",
          "examType": "Developer-Associate",
          "totalQuestions": 30,
          "correctAnswers": 26,
          "scorePercentage": 87,
          "completedAt": "2024-01-15T10:30:00Z"
        }
      ],
      "nextToken": null
    }
  }
}
```

### getUserProgress Response

```json
{
  "data": {
    "getUserProgress": {
      "userId": "user-123",
      "examType": "Developer-Associate",
      "quizzesTaken": 8,
      "averageScore": 82,
      "lastScore": 87,
      "domainScores": [
        {
          "domain": "Deployment",
          "correct": 18,
          "total": 20,
          "percentage": 90
        },
        {
          "domain": "Security",
          "correct": 15,
          "total": 20,
          "percentage": 75
        }
      ],
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## ✅ Integration Checklist

- [ ] Add GET_QUIZ_HISTORY query to `queries.ts`
- [ ] Add GET_USER_PROGRESS query to `queries.ts`
- [ ] Update History page to use real data
- [ ] Update Progress page to use real data
- [ ] Update Dashboard page to use real data
- [ ] Test with real quiz submissions
- [ ] Verify stats calculations are correct
- [ ] Check empty states work for new users
- [ ] Test error handling (disconnect internet)
- [ ] Verify loading states display correctly
- [ ] Check responsive design on mobile
- [ ] Test navigation between pages
- [ ] Verify logout clears data correctly

---

## 🎯 Next Features to Implement

1. **Export Data**

   - CSV export for history
   - PDF report for progress

2. **Filters & Sorting**

   - Filter by exam type
   - Sort by date/score
   - Date range picker

3. **Notifications**

   - Email reminders
   - Achievement alerts
   - Study streak notifications

4. **Social Features**
   - Share results on social media
   - Leaderboard
   - Study groups

---

**Last Updated:** January 2025  
**Status:** Ready for implementation  
**Estimated Time:** 2-3 hours
