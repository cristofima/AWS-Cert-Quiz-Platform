#!/usr/bin/env python3
"""
Seed Questions Script for AWS Certification Quiz Platform

This script loads sample questions into DynamoDB for testing and development.
In production, this would integrate with Amazon Bedrock for AI-generated questions.

Usage:
    python scripts/seed-questions.py --exam-type Developer-Associate --count 20 --region us-east-1

Requirements:
    pip install boto3
"""

import boto3
import json
import argparse
import sys
from datetime import datetime, timezone
from typing import List, Dict

# Sample questions for AWS Developer Associate
SAMPLE_QUESTIONS = [
    {
        "domain": "Development with AWS Services",
        "questionType": "single-choice",
        "difficulty": "medium",
        "questionText": "Which AWS service should you use to store session state data for a distributed web application?",
        "options": [
            {"id": "A", "text": "Amazon S3"},
            {"id": "B", "text": "Amazon DynamoDB"},
            {"id": "C", "text": "Amazon RDS"},
            {"id": "D", "text": "Amazon EFS"},
        ],
        "correctAnswers": ["B"],
        "explanation": "Amazon DynamoDB is a fully managed NoSQL database that provides fast and predictable performance with seamless scalability. It's ideal for storing session state data due to its low latency and high availability.",
        "references": ["https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/"],
    },
    {
        "domain": "Security",
        "questionType": "multiple-choice",
        "difficulty": "hard",
        "questionText": "Which of the following are best practices for securing your AWS Lambda functions? (Select TWO)",
        "options": [
            {"id": "A", "text": "Store sensitive data in environment variables without encryption"},
            {"id": "B", "text": "Use IAM roles with least privilege permissions"},
            {"id": "C", "text": "Enable VPC configuration for functions that access VPC resources"},
            {"id": "D", "text": "Use the root account credentials in Lambda code"},
        ],
        "correctAnswers": ["B", "C"],
        "explanation": "Best practices include using IAM roles with least privilege (B) and configuring VPC access when needed (C). Storing unencrypted sensitive data (A) and using root credentials (D) are security anti-patterns.",
        "references": [
            "https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html",
            "https://docs.aws.amazon.com/lambda/latest/dg/security-iam.html",
        ],
    },
    {
        "domain": "Deployment",
        "questionType": "single-choice",
        "difficulty": "medium",
        "questionText": "What is the maximum deployment package size for AWS Lambda?",
        "options": [
            {"id": "A", "text": "10 MB (compressed)"},
            {"id": "B", "text": "50 MB (compressed), 250 MB (uncompressed)"},
            {"id": "C", "text": "100 MB (compressed), 512 MB (uncompressed)"},
            {"id": "D", "text": "250 MB (compressed), 1 GB (uncompressed)"},
        ],
        "correctAnswers": ["B"],
        "explanation": "AWS Lambda deployment package size limits are 50 MB for compressed .zip file and 250 MB for uncompressed code plus dependencies.",
        "references": ["https://docs.aws.amazon.com/lambda/latest/dg/limits.html"],
    },
    {
        "domain": "Troubleshooting and Optimization",
        "questionType": "scenario-based",
        "difficulty": "hard",
        "questionText": "What is the MOST likely cause of this error?",
        "scenario": "Your Lambda function is returning a 'Task timed out after 3.00 seconds' error intermittently, even though the function typically completes in 1-2 seconds.",
        "options": [
            {"id": "A", "text": "The Lambda function memory is set too low"},
            {"id": "B", "text": "The function is experiencing cold starts"},
            {"id": "C", "text": "There's a network timeout connecting to external resources"},
            {"id": "D", "text": "The Lambda runtime is outdated"},
        ],
        "correctAnswers": ["C"],
        "explanation": "Intermittent timeouts with otherwise fast execution typically indicate network connectivity issues to external resources like databases or APIs. Cold starts (B) would cause consistent delays, not intermittent ones.",
        "references": [
            "https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-invocation.html",
            "https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html",
        ],
    },
    {
        "domain": "Development with AWS Services",
        "questionType": "true-false",
        "difficulty": "easy",
        "questionText": "AWS Lambda functions can be invoked synchronously and asynchronously.",
        "options": [
            {"id": "A", "text": "True"},
            {"id": "B", "text": "False"},
        ],
        "correctAnswers": ["A"],
        "explanation": "AWS Lambda supports both synchronous (RequestResponse) and asynchronous (Event) invocation types. Synchronous invocations wait for the function to complete, while asynchronous invocations queue the event and return immediately.",
        "references": ["https://docs.aws.amazon.com/lambda/latest/dg/invocation-sync.html"],
    },
]


def create_dynamodb_client(region: str):
    """Create DynamoDB client."""
    try:
        return boto3.client('dynamodb', region_name=region)
    except Exception as e:
        print(f"❌ Error creating DynamoDB client: {e}")
        sys.exit(1)


def generate_question_id(exam_type: str, index: int) -> str:
    """Generate unique question ID."""
    exam_prefix = {
        "Developer-Associate": "DEV",
        "Solutions-Architect-Associate": "SAA",
        "SysOps-Administrator-Associate": "SOA",
    }.get(exam_type, "DEV")
    
    return f"{exam_prefix}-{index:04d}"


def create_question_item(question_data: Dict, exam_type: str, index: int) -> Dict:
    """Create DynamoDB item from question data."""
    question_id = generate_question_id(exam_type, index)
    now = datetime.now(timezone.utc).isoformat()
    
    item = {
        "PK": {"S": f"EXAM#{exam_type}"},
        "SK": {"S": f"QUESTION#{question_id}"},
        "id": {"S": question_id},
        "examType": {"S": exam_type},
        "domain": {"S": question_data["domain"]},
        "questionType": {"S": question_data["questionType"]},
        "difficulty": {"S": question_data["difficulty"]},
        "questionText": {"S": question_data["questionText"]},
        "options": {
            "L": [
                {
                    "M": {
                        "id": {"S": opt["id"]},
                        "text": {"S": opt["text"]},
                    }
                }
                for opt in question_data["options"]
            ]
        },
        "correctAnswers": {"L": [{"S": ans} for ans in question_data["correctAnswers"]]},
        "explanation": {"S": question_data["explanation"]},
        "references": {"L": [{"S": ref} for ref in question_data["references"]]},
        "status": {"S": "approved"},
        "timesAnswered": {"N": "0"},
        "timesCorrect": {"N": "0"},
        "averageTimeSpent": {"N": "0"},
        "createdAt": {"S": now},
        "updatedAt": {"S": now},
        "createdBy": {"S": "seed-script"},
    }
    
    # Add optional fields
    if "scenario" in question_data:
        item["scenario"] = {"S": question_data["scenario"]}
    
    if "codeSnippet" in question_data:
        item["codeSnippet"] = {"S": question_data["codeSnippet"]}
    
    return item


def seed_questions(
    exam_type: str,
    count: int,
    region: str,
    table_name: str = "aws-cert-quiz-questions"
):
    """Seed questions into DynamoDB."""
    
    print(f"🚀 Starting seed process...")
    print(f"   Exam Type: {exam_type}")
    print(f"   Question Count: {count}")
    print(f"   Region: {region}")
    print(f"   Table: {table_name}\n")
    
    # Create DynamoDB client
    dynamodb = create_dynamodb_client(region)
    
    # Generate questions (cycle through sample questions)
    questions_to_insert = []
    for i in range(count):
        sample_index = i % len(SAMPLE_QUESTIONS)
        question_data = SAMPLE_QUESTIONS[sample_index].copy()
        item = create_question_item(question_data, exam_type, i + 1)
        questions_to_insert.append(item)
    
    # Insert questions in batches (DynamoDB BatchWriteItem limit: 25 items)
    batch_size = 25
    total_inserted = 0
    failed_items = []
    
    for i in range(0, len(questions_to_insert), batch_size):
        batch = questions_to_insert[i:i + batch_size]
        
        try:
            response = dynamodb.batch_write_item(
                RequestItems={
                    table_name: [
                        {"PutRequest": {"Item": item}}
                        for item in batch
                    ]
                }
            )
            
            # Check for unprocessed items
            unprocessed = response.get('UnprocessedItems', {})
            if unprocessed:
                failed_items.extend(unprocessed.get(table_name, []))
            
            total_inserted += len(batch) - len(unprocessed.get(table_name, []))
            
            print(f"✅ Inserted batch {i // batch_size + 1}: {len(batch)} questions")
            
        except Exception as e:
            print(f"❌ Error inserting batch {i // batch_size + 1}: {e}")
            failed_items.extend(batch)
    
    # Summary
    print(f"\n📊 Seed Summary:")
    print(f"   Total questions: {count}")
    print(f"   Successfully inserted: {total_inserted}")
    print(f"   Failed: {len(failed_items)}")
    
    if failed_items:
        print(f"\n⚠️  {len(failed_items)} items failed to insert.")
        print("   Retry with: --retry-failed")
    else:
        print(f"\n🎉 Successfully seeded {total_inserted} questions!")
        print(f"   You can now start the quiz at: http://localhost:3000/quiz")


def main():
    parser = argparse.ArgumentParser(
        description="Seed questions into DynamoDB for AWS Certification Quiz Platform"
    )
    
    parser.add_argument(
        "--exam-type",
        type=str,
        required=True,
        choices=["Developer-Associate", "Solutions-Architect-Associate", "SysOps-Administrator-Associate"],
        help="AWS certification exam type"
    )
    
    parser.add_argument(
        "--count",
        type=int,
        default=20,
        help="Number of questions to seed (default: 20, max: 1200)"
    )
    
    parser.add_argument(
        "--region",
        type=str,
        default="us-east-1",
        help="AWS region (default: us-east-1)"
    )
    
    parser.add_argument(
        "--table-name",
        type=str,
        default="cert-quiz-questions-dev",
        help="DynamoDB table name (default: cert-quiz-questions-dev)"
    )
    
    args = parser.parse_args()
    
    # Validate count
    if args.count < 1 or args.count > 1200:
        print("❌ Error: Count must be between 1 and 1200")
        sys.exit(1)
    
    # Run seed
    seed_questions(
        exam_type=args.exam_type,
        count=args.count,
        region=args.region,
        table_name=args.table_name
    )


if __name__ == "__main__":
    main()
