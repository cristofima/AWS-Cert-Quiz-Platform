#!/usr/bin/env python3
"""
AI Question Generator for AWS Certification Quiz Platform

This script uses Amazon Bedrock (Claude 3.5 Sonnet v2) to generate high-quality
AWS certification exam questions and stores them directly in DynamoDB.

Usage:
    python scripts/generate-questions.py --exam-type Developer-Associate --count 50 --region us-east-1

Requirements:
    pip install boto3
"""

import boto3
import json
import argparse
import sys
from datetime import datetime, timezone
from typing import List, Dict
import time

# Bedrock Model Configuration
BEDROCK_MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0"
BEDROCK_MAX_TOKENS = 4096
BEDROCK_TEMPERATURE = 1.0

# Question generation prompt template
GENERATION_PROMPT_TEMPLATE = """You are an expert AWS certification exam question writer. Generate {count} high-quality practice questions for the {exam_type} exam, focusing on the "{domain}" domain.

Requirements:
1. Each question must test real AWS knowledge required for the certification
2. Include 4 answer options (A, B, C, D) for single/multiple choice
3. Include 2 options (True, False) for true/false questions
4. For scenario-based questions, provide a realistic scenario context
5. Mark correct answers clearly
6. Provide detailed explanations (2-3 sentences) explaining why the answer is correct
7. Include at least one AWS documentation URL as reference
8. Mix question types: 40% single-choice, 30% multiple-choice, 20% scenario-based, 10% true/false
9. Vary difficulty: 30% easy, 50% medium, 20% hard

Return your response as a JSON array with this exact structure:
[
  {{
    "domain": "{domain}",
    "questionType": "single-choice" | "multiple-choice" | "true-false" | "scenario-based",
    "difficulty": "easy" | "medium" | "hard",
    "questionText": "The actual question text",
    "scenario": "Optional scenario context (only for scenario-based questions)",
    "options": [
      {{"id": "A", "text": "First option"}},
      {{"id": "B", "text": "Second option"}},
      {{"id": "C", "text": "Third option"}},
      {{"id": "D", "text": "Fourth option"}}
    ],
    "correctAnswers": ["A"] or ["A", "C"] for multiple correct,
    "explanation": "Detailed explanation why this answer is correct",
    "references": ["https://docs.aws.amazon.com/..."]
  }}
]

Generate exactly {count} questions. Ensure they are unique, relevant, and test practical AWS knowledge."""


def create_bedrock_client(region: str):
    """Create Bedrock Runtime client."""
    try:
        return boto3.client('bedrock-runtime', region_name=region)
    except Exception as e:
        print(f"❌ Error creating Bedrock client: {e}")
        print("   Make sure Bedrock is enabled in your AWS account and you have access to Claude 3.5 Sonnet v2")
        sys.exit(1)


def create_dynamodb_client(region: str):
    """Create DynamoDB client."""
    try:
        return boto3.client('dynamodb', region_name=region)
    except Exception as e:
        print(f"❌ Error creating DynamoDB client: {e}")
        sys.exit(1)


def generate_questions_with_bedrock(
    bedrock_client,
    exam_type: str,
    domain: str,
    count: int
) -> List[Dict]:
    """Generate questions using Amazon Bedrock."""
    
    print(f"🤖 Generating {count} questions with Claude 3.5 Sonnet v2...")
    
    prompt = GENERATION_PROMPT_TEMPLATE.format(
        count=count,
        exam_type=exam_type,
        domain=domain
    )
    
    try:
        # Call Bedrock
        response = bedrock_client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": BEDROCK_MAX_TOKENS,
                "temperature": BEDROCK_TEMPERATURE,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        generated_text = response_body['content'][0]['text']
        
        # Extract JSON array from response (Claude might add markdown formatting)
        json_start = generated_text.find('[')
        json_end = generated_text.rfind(']') + 1
        
        if json_start == -1 or json_end == 0:
            raise ValueError("No JSON array found in Bedrock response")
        
        questions_json = generated_text[json_start:json_end]
        questions = json.loads(questions_json)
        
        print(f"✅ Successfully generated {len(questions)} questions")
        
        # Calculate cost estimate
        input_tokens = response_body.get('usage', {}).get('input_tokens', 0)
        output_tokens = response_body.get('usage', {}).get('output_tokens', 0)
        cost = (input_tokens * 0.003 / 1000) + (output_tokens * 0.015 / 1000)
        print(f"   Tokens: {input_tokens} input + {output_tokens} output")
        print(f"   Estimated cost: ${cost:.4f}")
        
        return questions
        
    except Exception as e:
        print(f"❌ Error generating questions with Bedrock: {e}")
        sys.exit(1)


def generate_question_id(exam_type: str, index: int) -> str:
    """Generate unique question ID."""
    exam_prefix = {
        "Developer-Associate": "DEV",
        "Solutions-Architect-Associate": "SAA",
        "SysOps-Administrator-Associate": "SOA",
    }.get(exam_type, "DEV")
    
    timestamp = int(time.time())
    return f"{exam_prefix}-{timestamp}-{index:04d}"


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
        "status": {"S": "approved"},  # AI-generated questions are auto-approved in Article 1
        "timesAnswered": {"N": "0"},
        "timesCorrect": {"N": "0"},
        "averageTimeSpent": {"N": "0"},
        "createdAt": {"S": now},
        "updatedAt": {"S": now},
        "createdBy": {"S": "bedrock-ai"},
    }
    
    # Add optional fields
    if "scenario" in question_data and question_data["scenario"]:
        item["scenario"] = {"S": question_data["scenario"]}
    
    return item


def insert_questions_to_dynamodb(
    dynamodb_client,
    questions: List[Dict],
    exam_type: str,
    table_name: str
):
    """Insert questions into DynamoDB in batches."""
    
    print(f"\n📦 Inserting {len(questions)} questions into DynamoDB...")
    
    # Convert to DynamoDB items
    items = [create_question_item(q, exam_type, i + 1) for i, q in enumerate(questions)]
    
    # Insert in batches (25 items per batch)
    batch_size = 25
    total_inserted = 0
    failed_items = []
    
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        
        try:
            response = dynamodb_client.batch_write_item(
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
    
    return total_inserted, failed_items


def get_domains_for_exam(exam_type: str) -> List[str]:
    """Get domain list for specific exam type."""
    domains = {
        "Developer-Associate": [
            "Development with AWS Services",
            "Security",
            "Deployment",
            "Troubleshooting and Optimization",
            "Monitoring and Logging"
        ],
        "Solutions-Architect-Associate": [
            "Design Resilient Architectures",
            "Design High-Performing Architectures",
            "Design Secure Applications and Architectures",
            "Design Cost-Optimized Architectures"
        ],
        "SysOps-Administrator-Associate": [
            "Monitoring and Reporting",
            "High Availability",
            "Deployment and Provisioning",
            "Storage and Data Management",
            "Security and Compliance",
            "Networking"
        ]
    }
    
    return domains.get(exam_type, [])


def main():
    parser = argparse.ArgumentParser(
        description="Generate AWS certification questions using Amazon Bedrock AI"
    )
    
    parser.add_argument(
        "--exam-type",
        type=str,
        required=True,
        choices=["Developer-Associate", "Solutions-Architect-Associate", "SysOps-Administrator-Associate"],
        help="AWS certification exam type"
    )
    
    parser.add_argument(
        "--domain",
        type=str,
        default=None,
        help="Specific domain to generate questions for (optional, generates for all domains if not specified)"
    )
    
    parser.add_argument(
        "--count",
        type=int,
        default=50,
        help="Number of questions to generate per domain (default: 50)"
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
    if args.count < 1 or args.count > 200:
        print("❌ Error: Count must be between 1 and 200 (to avoid excessive costs)")
        sys.exit(1)
    
    print("=" * 80)
    print("🚀 AWS Certification Question Generator (Powered by Amazon Bedrock)")
    print("=" * 80)
    print(f"   Exam Type: {args.exam_type}")
    print(f"   Count per domain: {args.count}")
    print(f"   Region: {args.region}")
    print(f"   Table: {args.table_name}\n")
    
    # Create clients
    bedrock_client = create_bedrock_client(args.region)
    dynamodb_client = create_dynamodb_client(args.region)
    
    # Get domains to generate for
    if args.domain:
        domains = [args.domain]
    else:
        domains = get_domains_for_exam(args.exam_type)
    
    print(f"📚 Generating questions for {len(domains)} domain(s):\n")
    for i, domain in enumerate(domains, 1):
        print(f"   {i}. {domain}")
    print()
    
    # Generate and insert questions for each domain
    total_generated = 0
    total_inserted = 0
    total_cost = 0.0
    
    for domain in domains:
        print(f"\n{'=' * 80}")
        print(f"📖 Domain: {domain}")
        print(f"{'=' * 80}")
        
        # Generate questions
        questions = generate_questions_with_bedrock(
            bedrock_client,
            args.exam_type,
            domain,
            args.count
        )
        
        total_generated += len(questions)
        
        # Insert to DynamoDB
        inserted, failed = insert_questions_to_dynamodb(
            dynamodb_client,
            questions,
            args.exam_type,
            args.table_name
        )
        
        total_inserted += inserted
        
        if failed:
            print(f"   ⚠️  {len(failed)} items failed to insert")
        
        # Wait briefly between domains to avoid rate limiting
        if domain != domains[-1]:
            print("\n⏳ Waiting 2 seconds before next domain...")
            time.sleep(2)
    
    # Final summary
    print(f"\n{'=' * 80}")
    print("📊 Generation Summary")
    print(f"{'=' * 80}")
    print(f"   Total domains: {len(domains)}")
    print(f"   Total questions generated: {total_generated}")
    print(f"   Successfully inserted: {total_inserted}")
    print(f"   Failed: {total_generated - total_inserted}")
    print(f"\n🎉 Question generation complete!")
    print(f"   You can now start the quiz at your Amplify URL")
    print(f"{'=' * 80}\n")


if __name__ == "__main__":
    main()
