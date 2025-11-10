# 🚀 Deployment Guide

Complete guide to deploying the AWS Certification Quiz Platform infrastructure.

## 📋 Prerequisites

Ensure you have the following installed and configured:

- ✅ **AWS Account** with administrative permissions
- ✅ **AWS CLI** ([Download](https://aws.amazon.com/cli/))
- ✅ **Terraform** 1.9+ ([Download](https://www.terraform.io/downloads))
- ✅ **Node.js** 20.x+ ([Download](https://nodejs.org/))
- ✅ **Python** 3.9+ ([Download](https://www.python.org/downloads/))

## 🔐 AWS Credentials Setup

### Method 1: AWS CLI Configure (Recommended for Development)

```powershell
aws configure
```

Enter your credentials:

```
AWS Access Key ID: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region: us-east-1
Default output format: json
```

Verify configuration:

```powershell
aws sts get-caller-identity
```

### Method 2: Environment Variables (CI/CD)

```powershell
$env:AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
$env:AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"
$env:AWS_DEFAULT_REGION="us-east-1"
```

### Method 3: Named Profiles (Multiple Accounts)

```powershell
aws configure --profile aws-quiz-dev
$env:AWS_PROFILE="aws-quiz-dev"
```

## 🏗️ Infrastructure Deployment

### 1. Install Lambda Dependencies

**⚠️ CRITICAL:** Install dependencies BEFORE running Terraform (it packages them into deployment ZIPs).

```powershell
cd lambdas/quiz-selector
npm install
cd ../score-calculator
npm install
cd ../..
```

### 2. Initialize Terraform

```powershell
cd infrastructure/terraform
terraform init
```

### 3. Review Deployment Plan

```powershell
terraform plan -var="article_phase=article-2"
```

This creates:

- Amazon Cognito User Pool + Client
- 3 DynamoDB tables (Questions, QuizSessions, UserProgress)
- 2 Lambda functions (quiz-selector, score-calculator)
- AWS AppSync GraphQL API
- IAM roles and policies

### 4. Deploy Infrastructure

```powershell
terraform apply -var="article_phase=article-2" -auto-approve
```

**Deployment time:** ~3-5 minutes

### 5. Save Outputs

```powershell
terraform output -json > outputs.json
```

## 🤖 Amazon Bedrock Setup

### Verify Model Access

AWS automatically enables serverless foundation models. Verify Claude 3.5 Sonnet is available:

```powershell
aws bedrock list-foundation-models --region us-east-1 `
  --query "modelSummaries[?contains(modelId, 'claude-3-5-sonnet')].{ModelId:modelId,Status:modelLifecycle.status}"
```

### Add IAM Permissions

```powershell
aws iam attach-user-policy `
  --user-name YourIAMUsername `
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
```

## 🌱 Seed Questions Database

### Generate AI Questions

```powershell
cd scripts
pip install -r requirements.txt

python generate-questions.py `
  --exam-type Developer-Associate `
  --count 50 `
  --region us-east-1
```

**Options:**

- `--exam-type`: `Developer-Associate`, `Solutions-Architect-Associate`, `SysOps-Administrator-Associate`
- `--count`: Number of questions (1-1200)
- `--region`: AWS region (default: us-east-1)

**Cost:** ~$0.015 per question (~$0.75 for 50 questions)

### Verify Questions

```powershell
aws dynamodb scan `
  --table-name cert-quiz-questions `
  --max-items 5 `
  --region us-east-1
```

## ⚙️ Frontend Configuration

### 1. Install Dependencies

```powershell
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local` from Terraform outputs:

```bash
# From: terraform output cognito_user_pool_id
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XNLodSkoE

# From: terraform output cognito_client_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=3eiuep4c75cccvm1vrielhl799

# From: terraform output appsync_graphql_url
NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT=https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql

# Other required variables
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Quick fill helper:**

```powershell
cd ../infrastructure/terraform
$outputs = terraform output -json | ConvertFrom-Json
Write-Host "NEXT_PUBLIC_COGNITO_USER_POOL_ID=$($outputs.cognito_user_pool_id.value)"
Write-Host "NEXT_PUBLIC_COGNITO_CLIENT_ID=$($outputs.cognito_client_id.value)"
Write-Host "NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT=$($outputs.appsync_graphql_url.value)"
```

### 3. Start Development Server

```powershell
cd ../../frontend
npm run dev
```

Open: http://localhost:3000

## ✅ Testing

### 1. Test Authentication

1. Navigate to http://localhost:3000/signup
2. Create account with email/password
3. Verify email with code
4. Login at http://localhost:3000/login

### 2. Test Quiz Flow

1. Go to http://localhost:3000/quiz
2. Select exam type and question count
3. Take quiz
4. Review scores and explanations

### 3. Test History

1. Complete multiple quizzes
2. Navigate to http://localhost:3000/history
3. Verify sessions appear

## 💰 Cost Breakdown

| Service              | Usage              | Cost/Month       |
| -------------------- | ------------------ | ---------------- |
| **Cognito**          | <50 MAU            | **Free**         |
| **AppSync**          | <250k requests     | **Free**         |
| **Lambda**           | <1M invocations    | **Free**         |
| **DynamoDB**         | <25 GB, <200M reqs | **Free**         |
| **CloudWatch Logs**  | ~100 MB            | **~$0.50**       |
| **Bedrock**          | Per question       | **$0.015/q**     |
| **Total (50 users)** |                    | **~$0.50/month** |

## 🔍 Troubleshooting

See [Troubleshooting Guide](./troubleshooting.md) for common issues and solutions.

### Quick Fixes

**Terraform apply fails:**

```powershell
# Verify credentials
aws sts get-caller-identity
```

**Frontend shows network error:**

```powershell
# Verify .env.local values match Terraform outputs
cat .env.local
terraform output
```

**No questions in quiz:**

```powershell
# Check DynamoDB for questions
aws dynamodb scan --table-name cert-quiz-questions --max-items 1
```

## 🧹 Cleanup

To destroy all resources:

```powershell
cd infrastructure/terraform
terraform destroy -var="article_phase=article-2" -auto-approve
```

**Note:** DynamoDB tables with data require manual deletion in AWS Console first.

## 📚 Next Steps

- [Environment Variables Reference](./environment-variables.md)
- [Email Templates Configuration](./email-templates.md)
- [Infrastructure Details](./infrastructure.md)
- [Troubleshooting Guide](./troubleshooting.md)

## 🆘 Need Help?

- Check [Troubleshooting Guide](./troubleshooting.md)
- Review [GitHub Issues](https://github.com/cristofima/AWS-Cert-Quiz-Platform/issues)
- Read [System Architecture](../architecture/system-overview.md)
