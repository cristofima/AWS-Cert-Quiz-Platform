/**
 * Score Calculator Lambda Function
 * 
 * Calculates quiz scores based on user answers and correct answers.
 * Supports single-choice, multiple-choice, true/false, and scenario-based questions.
 * Stores quiz session and updates user progress in DynamoDB.
 * 
 * @handler handler
 * @runtime Node.js 20.x
 * @memory 512 MB
 * @timeout 30s
 */

import {
    DynamoDBClient,
    BatchGetItemCommand,
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// Types
interface ScoreCalculatorEvent {
    userId: string;
    examType: string;
    questionIds: string[];
    userAnswers: Record<string, string[]>; // questionId -> selected answer IDs
}

interface Question {
    id: string;
    examType: string;
    domain: string;
    questionType: 'single-choice' | 'multiple-choice' | 'true-false' | 'scenario-based';
    questionText: string;
    correctAnswers: string[];
    explanation: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}

interface QuestionResult {
    questionId: string;
    domain: string;
    isCorrect: boolean;
    userAnswers: string[];
    correctAnswers: string[];
    explanation: string;
}

interface ScoreCalculatorResponse {
    statusCode: number;
    body: string;
}

// Environment variables
const QUESTIONS_TABLE_NAME = process.env.QUESTIONS_TABLE_NAME!;
const QUIZ_SESSIONS_TABLE_NAME = process.env.QUIZ_SESSIONS_TABLE_NAME!;
const USER_PROGRESS_TABLE_NAME = process.env.USER_PROGRESS_TABLE_NAME!;
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

// Initialize DynamoDB client
const dynamodbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
});

/**
 * Logger utility
 */
const logger = {
    info: (message: string, data?: any) => {
        if (LOG_LEVEL === 'INFO' || LOG_LEVEL === 'DEBUG') {
            console.log(JSON.stringify({ level: 'INFO', message, data }));
        }
    },
    error: (message: string, error?: any) => {
        console.error(JSON.stringify({ level: 'ERROR', message, error }));
    },
    debug: (message: string, data?: any) => {
        if (LOG_LEVEL === 'DEBUG') {
            console.log(JSON.stringify({ level: 'DEBUG', message, data }));
        }
    },
};

/**
 * Main Lambda handler
 */
export const handler = async (event: ScoreCalculatorEvent): Promise<ScoreCalculatorResponse> => {
    logger.info('Score calculator invoked', { event });

    try {
        // Validate input
        const { userId, examType, questionIds, userAnswers } = event;

        if (!userId || !examType || !questionIds || !userAnswers) {
            return createResponse(400, {
                error: 'Missing required parameters',
            });
        }

        // Fetch questions from DynamoDB
        const questions = await fetchQuestions(examType, questionIds);

        if (questions.length !== questionIds.length) {
            return createResponse(404, {
                error: 'Some questions not found',
            });
        }

        // Calculate scores
        const results = calculateScores(questions, userAnswers);

        const totalQuestions = results.length;
        const correctAnswers = results.filter((r) => r.isCorrect).length;
        const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

        // Calculate domain breakdown
        const domainScores = calculateDomainScores(results);

        // Store quiz session
        const sessionId = await storeQuizSession(userId, examType, results, scorePercentage);

        // Update user progress
        await updateUserProgress(userId, examType, scorePercentage, domainScores);

        logger.info('Score calculated successfully', {
            userId,
            examType,
            totalQuestions,
            correctAnswers,
            scorePercentage,
        });

        return createResponse(200, {
            sessionId,
            examType,
            totalQuestions,
            correctAnswers,
            scorePercentage,
            domainScores,
            results,
        });
    } catch (error) {
        logger.error('Error calculating score', error);

        return createResponse(500, {
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Fetch questions from DynamoDB by IDs
 */
async function fetchQuestions(examType: string, questionIds: string[]): Promise<Question[]> {
    try {
        const keys = questionIds.map((id) => ({
            PK: { S: examType },
            SK: { S: `Q#${id}` },
        }));

        const command = new BatchGetItemCommand({
            RequestItems: {
                [QUESTIONS_TABLE_NAME]: {
                    Keys: keys,
                },
            },
        });

        const result = await dynamodbClient.send(command);

        if (!result.Responses || !result.Responses[QUESTIONS_TABLE_NAME]) {
            return [];
        }

        return result.Responses[QUESTIONS_TABLE_NAME].map(
            (item) => unmarshall(item) as Question
        );
    } catch (error) {
        logger.error('Error fetching questions', error);
        throw new Error('Failed to fetch questions from database');
    }
}

/**
 * Calculate scores for all questions
 */
function calculateScores(
    questions: Question[],
    userAnswers: Record<string, string[]>
): QuestionResult[] {
    return questions.map((question) => {
        const userAnswer = userAnswers[question.id] || [];
        const correctAnswer = question.correctAnswers;

        // Determine if answer is correct
        let isCorrect = false;

        if (question.questionType === 'single-choice' || question.questionType === 'true-false') {
            // Single-choice: exactly one correct answer
            isCorrect =
                userAnswer.length === 1 &&
                correctAnswer.length === 1 &&
                userAnswer[0] === correctAnswer[0];
        } else if (question.questionType === 'multiple-choice' || question.questionType === 'scenario-based') {
            // Multiple-choice: ALL correct answers must be selected, NO incorrect answers
            const userSet = new Set(userAnswer);
            const correctSet = new Set(correctAnswer);

            isCorrect =
                userSet.size === correctSet.size &&
                [...userSet].every((ans) => correctSet.has(ans));
        }

        return {
            questionId: question.id,
            domain: question.domain,
            isCorrect,
            userAnswers: userAnswer,
            correctAnswers: correctAnswer,
            explanation: question.explanation,
        };
    });
}

/**
 * Calculate domain-level scores
 */
function calculateDomainScores(
    results: QuestionResult[]
): Record<string, { correct: number; total: number; percentage: number }> {
    const domainScores: Record<string, { correct: number; total: number }> = {};

    results.forEach((result) => {
        if (!domainScores[result.domain]) {
            domainScores[result.domain] = { correct: 0, total: 0 };
        }

        domainScores[result.domain].total++;
        if (result.isCorrect) {
            domainScores[result.domain].correct++;
        }
    });

    // Calculate percentages
    const domainScoresWithPercentage: Record<
        string,
        { correct: number; total: number; percentage: number }
    > = {};

    Object.keys(domainScores).forEach((domain) => {
        const { correct, total } = domainScores[domain];
        domainScoresWithPercentage[domain] = {
            correct,
            total,
            percentage: Math.round((correct / total) * 100),
        };
    });

    return domainScoresWithPercentage;
}

/**
 * Store quiz session in DynamoDB
 */
async function storeQuizSession(
    userId: string,
    examType: string,
    results: QuestionResult[],
    scorePercentage: number
): Promise<string> {
    try {
        const timestamp = new Date().toISOString();
        const sessionId = `${userId}-${Date.now()}`;

        const command = new PutItemCommand({
            TableName: QUIZ_SESSIONS_TABLE_NAME,
            Item: marshall({
                PK: userId,
                SK: `SESSION#${timestamp}`,
                sessionId,
                examType,
                results,
                scorePercentage,
                totalQuestions: results.length,
                correctAnswers: results.filter((r) => r.isCorrect).length,
                completedAt: timestamp,
                ttl: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // 90 days TTL
            }),
        });

        await dynamodbClient.send(command);

        logger.debug('Quiz session stored', { sessionId, userId });

        return sessionId;
    } catch (error) {
        logger.error('Error storing quiz session', error);
        throw new Error('Failed to store quiz session');
    }
}

/**
 * Update user progress in DynamoDB
 */
async function updateUserProgress(
    userId: string,
    examType: string,
    scorePercentage: number,
    domainScores: Record<string, { correct: number; total: number; percentage: number }>
): Promise<void> {
    try {
        const timestamp = new Date().toISOString();

        // First, get existing progress
        const getCommand = new GetItemCommand({
            TableName: USER_PROGRESS_TABLE_NAME,
            Key: marshall({
                PK: userId,
                SK: `PROGRESS#${examType}`,
            }),
        });

        const existingProgress = await dynamodbClient.send(getCommand);
        const currentProgress = existingProgress.Item
            ? (unmarshall(existingProgress.Item) as any)
            : null;

        // Calculate new averages
        const quizzesTaken = (currentProgress?.quizzesTaken || 0) + 1;
        const averageScore = currentProgress
            ? Math.round(
                (currentProgress.averageScore * currentProgress.quizzesTaken + scorePercentage) /
                quizzesTaken
            )
            : scorePercentage;

        // Update progress
        const updateCommand = new PutItemCommand({
            TableName: USER_PROGRESS_TABLE_NAME,
            Item: marshall({
                PK: userId,
                SK: `PROGRESS#${examType}`,
                examType,
                quizzesTaken,
                averageScore,
                lastScore: scorePercentage,
                domainScores,
                lastUpdated: timestamp,
            }),
        });

        await dynamodbClient.send(updateCommand);

        logger.debug('User progress updated', { userId, examType, quizzesTaken, averageScore });
    } catch (error) {
        logger.error('Error updating user progress', error);
        throw new Error('Failed to update user progress');
    }
}

/**
 * Create HTTP response
 */
function createResponse(statusCode: number, body: any): ScoreCalculatorResponse {
    return {
        statusCode,
        body: JSON.stringify(body),
    };
}
