/**
 * Quiz Selector Lambda Function
 * 
 * Selects random questions from DynamoDB based on exam type and count.
 * Ensures no duplicate questions and distributes questions across domains.
 * 
 * @handler handler
 * @runtime Node.js 20.x
 * @memory 512 MB
 * @timeout 30s
 */

import {
    DynamoDBClient,
    QueryCommand,
    QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// Types
interface QuizSelectorEvent {
    examType: string;
    questionCount: number;
    domains?: string[]; // Optional: filter by specific domains
}

interface Question {
    id: string;
    examType: string;
    domain: string;
    questionType: 'single-choice' | 'multiple-choice' | 'true-false' | 'scenario-based';
    questionText: string;
    options: QuestionOption[];
    correctAnswers: string[];
    explanation: string;
    references: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
}

interface QuestionOption {
    id: string;
    text: string;
}

interface QuizSelectorResponse {
    statusCode: number;
    body: string;
}

// Environment variables
const QUESTIONS_TABLE_NAME = process.env.QUESTIONS_TABLE_NAME!;
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
export const handler = async (event: QuizSelectorEvent): Promise<QuizSelectorResponse> => {
    logger.info('Quiz selector invoked', { event });

    try {
        // Validate input
        const { examType, questionCount, domains } = event;

        if (!examType || !questionCount) {
            return createResponse(400, {
                error: 'Missing required parameters: examType and questionCount',
            });
        }

        if (questionCount < 1 || questionCount > 65) {
            return createResponse(400, {
                error: 'Question count must be between 1 and 65',
            });
        }

        // Query questions from DynamoDB
        const questions = await queryQuestions(examType, domains);

        if (questions.length === 0) {
            return createResponse(404, {
                error: `No questions found for exam type: ${examType}`,
            });
        }

        if (questions.length < questionCount) {
            logger.info(`Requested ${questionCount} questions but only ${questions.length} available`);
        }

        // Randomly select questions
        const selectedQuestions = selectRandomQuestions(questions, questionCount);

        logger.info('Questions selected successfully', {
            examType,
            requestedCount: questionCount,
            selectedCount: selectedQuestions.length,
        });

        // Remove correct answers from response (security)
        const sanitizedQuestions = selectedQuestions.map((q) => ({
            ...q,
            correctAnswers: undefined, // Don't send correct answers to client
            explanation: undefined, // Don't send explanation until after submission
        }));

        return createResponse(200, {
            examType,
            questionCount: sanitizedQuestions.length,
            questions: sanitizedQuestions,
        });
    } catch (error) {
        logger.error('Error selecting questions', error);

        return createResponse(500, {
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * Query questions from DynamoDB by exam type
 */
async function queryQuestions(
    examType: string,
    domains?: string[]
): Promise<Question[]> {
    const questions: Question[] = [];

    try {
        // Query by partition key (examType)
        const params: QueryCommandInput = {
            TableName: QUESTIONS_TABLE_NAME,
            KeyConditionExpression: 'PK = :examType',
            ExpressionAttributeValues: marshall({
                ':examType': examType,
                ':approved': 'approved',
            }),
            FilterExpression: '#status = :approved',
            ExpressionAttributeNames: {
                '#status': 'status',
            },
        };

        const command = new QueryCommand(params);
        const result = await dynamodbClient.send(command);

        if (result.Items) {
            const allQuestions = result.Items.map((item) => unmarshall(item) as Question);

            // Filter by domains if specified
            if (domains && domains.length > 0) {
                questions.push(...allQuestions.filter((q) => domains.includes(q.domain)));
            } else {
                questions.push(...allQuestions);
            }
        }

        logger.debug('Questions queried', {
            examType,
            totalQuestions: questions.length,
        });

        return questions;
    } catch (error) {
        logger.error('Error querying DynamoDB', error);
        throw new Error('Failed to query questions from database');
    }
}

/**
 * Randomly select N questions from array
 * Uses Fisher-Yates shuffle algorithm
 */
function selectRandomQuestions(questions: Question[], count: number): Question[] {
    const shuffled = [...questions];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Create HTTP response
 */
function createResponse(statusCode: number, body: any): QuizSelectorResponse {
    return {
        statusCode,
        body: JSON.stringify(body),
    };
}
