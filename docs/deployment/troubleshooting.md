# 🔧 Troubleshooting Guide

Common issues and solutions for the AWS Certification Quiz Platform.

## 🚨 Deployment Issues

### Issue: Terraform apply fails with "AccessDenied"

**Error:**

```
Error: Error creating Cognito User Pool: AccessDeniedException: User: arn:aws:iam::123456789012:user/YourUser is not authorized
```

**Solution:**

1. **Verify AWS credentials:**

```powershell
aws sts get-caller-identity
```

2. **Check IAM permissions:**

```powershell
aws iam list-attached-user-policies --user-name YourUsername
```

3. **Add required permissions:**

```powershell
aws iam attach-user-policy `
  --user-name YourUsername `
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

### Issue: Cognito domain error - "Domain cannot contain reserved word: aws"

**Error:**

```
Error: Error creating Cognito User Pool Domain: InvalidParameterException: Domain cannot contain reserved word: aws
```

**Solution:**

This is already fixed in the current codebase. The `project_name` variable is set to `"cert-quiz"` (not `"aws-cert-quiz"`).

If you see this error, update `infrastructure/terraform/variables.tf`:

```hcl
variable "project_name" {
  default = "cert-quiz"  # ✅ Correct
  # NOT "aws-cert-quiz"  # ❌ Wrong
}
```

### Issue: CloudWatch Alarms permission denied

**Error:**

```
Error: User lacks cloudwatch:PutMetricAlarm permission
```

**Solution:**

CloudWatch alarms are commented out by default. To enable them:

1. **Add IAM permissions:**

```powershell
aws iam attach-user-policy `
  --user-name YourUsername `
  --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess
```

2. **Uncomment alarm resources in:**

- `infrastructure/terraform/dynamodb.tf` (lines 205-248)
- `infrastructure/terraform/lambda.tf` (lines 245-289)

3. **Reapply:**

```powershell
terraform apply -auto-approve
```

### Issue: Lambda deployment fails - "node_modules not found"

**Error:**

```
Error: Error creating Lambda Function: InvalidParameterValueException: Could not find node_modules
```

**Solution:**

Install Lambda dependencies BEFORE running Terraform:

```powershell
cd lambdas/quiz-selector
npm install
cd ../score-calculator
npm install
cd ../..
```

Then retry:

```powershell
cd infrastructure/terraform
terraform apply -auto-approve
```

## 🤖 Bedrock Issues

### Issue: AccessDeniedException when generating questions

**Error:**

```
botocore.exceptions.ClientError: An error occurred (AccessDeniedException) when calling the InvokeModel operation
```

**Solution:**

1. **Add Bedrock IAM permissions:**

```powershell
aws iam attach-user-policy `
  --user-name YourUsername `
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
```

2. **Verify model access:**

```powershell
aws bedrock list-foundation-models --region us-east-1 `
  --query "modelSummaries[?contains(modelId, 'claude-3-5-sonnet')]"
```

### Issue: ThrottlingException - Rate limit exceeded

**Error:**

```
botocore.exceptions.ClientError: An error occurred (ThrottlingException) when calling the InvokeModel operation: Rate exceeded
```

**Solution:**

Bedrock has rate limits (10 requests/minute for Claude 3.5 Sonnet).

**Options:**

1. **Add delay between requests** (already implemented in `generate-questions.py`)
2. **Generate fewer questions at once**
3. **Request quota increase** in AWS Console

### Issue: ValidationException - Use case details required

**Error:**

```
ValidationException: Use case details are required for first-time access to Anthropic models
```

**Solution:**

1. Open [Bedrock Console](https://console.aws.amazon.com/bedrock)
2. Navigate to Model catalog
3. Select "Claude 3.5 Sonnet"
4. Click "Open in Playground"
5. Submit your use case details when prompted

## 🗄️ DynamoDB Issues

### Issue: ResourceNotFoundException - Table not found

**Error:**

```
ResourceNotFoundException: Requested resource not found: Table: cert-quiz-questions not found
```

**Solution:**

1. **Verify table exists:**

```powershell
aws dynamodb list-tables --region us-east-1
```

2. **Check table name in Terraform outputs:**

```powershell
cd infrastructure/terraform
terraform output dynamodb_questions_table
```

3. **If missing, redeploy:**

```powershell
terraform apply -auto-approve
```

### Issue: Seed script fails - "Failed to insert questions"

**Error:**

```
ERROR: Failed to insert questions: ClientError: ValidationException: One or more parameter values were invalid
```

**Solution:**

Check question data structure matches DynamoDB schema:

```python
# Correct structure:
{
    "PK": f"EXAM#{exam_type}",
    "SK": f"QUESTION#{question_id}",
    "examType": exam_type,
    "questionId": question_id,
    "questionText": "...",
    "options": [...],
    "correctAnswers": [...],
    # ... other fields
}
```

## 🖥️ Frontend Issues

### Issue: "Network error" when calling GraphQL

**Error:**

```
Error: Network error: Failed to fetch
```

**Solutions:**

1. **Verify environment variables:**

```powershell
cat .env.local
```

2. **Check AppSync endpoint is accessible:**

```powershell
curl https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
```

3. **Verify Cognito credentials:**

```powershell
cd infrastructure/terraform
terraform output cognito_user_pool_id
terraform output cognito_client_id
```

4. **Ensure user is authenticated:**

- Check browser console for JWT token
- Try logging out and back in

### Issue: "Unauthorized" error in API calls

**Error:**

```
{
  "errors": [{
    "errorType": "Unauthorized",
    "message": "Not Authorized to access getQuizQuestions on type Query"
  }]
}
```

**Solutions:**

1. **Verify user is logged in:**

```typescript
const { user } = useAuth();
console.log("User:", user);
```

2. **Check JWT token is included:**

```typescript
// In lib/graphql/client.ts
const token = session.tokens?.idToken?.toString();
console.log("Token:", token ? "Present" : "Missing");
```

3. **Verify Cognito User Pool allows API access:**

```powershell
aws cognito-idp describe-user-pool --user-pool-id us-east-1_XXXXXXXXX
```

### Issue: Quiz shows no questions

**Error:**
No questions appear when starting quiz, or empty state persists.

**Solutions:**

1. **Verify questions exist in DynamoDB:**

```powershell
aws dynamodb scan `
  --table-name cert-quiz-questions `
  --max-items 5 `
  --region us-east-1
```

2. **Check Lambda function logs:**

```powershell
aws logs tail /aws/lambda/cert-quiz-quiz-selector --follow --region us-east-1
```

3. **Test Lambda directly:**

```powershell
aws lambda invoke `
  --function-name cert-quiz-quiz-selector `
  --payload '{"examType":"Developer-Associate","questionCount":10}' `
  --region us-east-1 `
  response.json

cat response.json
```

### Issue: Hot reload causes session loss

**Error:**
User is logged out after saving file changes during development.

**Solution:**

This is a known Next.js behavior. Session is stored in localStorage and should persist.

**Workaround:**

- Session is automatically restored from localStorage
- Check `lib/auth/auth-context.tsx` - it validates session on mount
- If issues persist, clear browser cache and re-login

## 📧 Email Template Issues

### Issue: Email verification not received

**Solutions:**

1. **Check email is valid:**

```powershell
aws cognito-idp admin-get-user `
  --user-pool-id us-east-1_XXXXXXXXX `
  --username user@example.com `
  --region us-east-1
```

2. **Check SES sending limits:**

```powershell
aws ses get-send-quota --region us-east-1
```

3. **Verify email in spam folder**

4. **Resend verification code:**

```typescript
await resendSignUpCode({ username: email });
```

### Issue: Password reset email not customized

**Known Limitation:**

The password reset email cannot be customized via Terraform. It uses AWS Cognito's default template.

**Solutions:**

1. **Manual customization** in AWS Console (Cognito → Messaging → Message customizations)
2. **Implement CustomMessage Lambda trigger** (see `infrastructure/terraform/email-templates/README.md`)

## 🔐 Authentication Issues

### Issue: "User does not exist" error

**Error:**

```
UserNotFoundException: User does not exist
```

**Solutions:**

1. **Verify user was created:**

```powershell
aws cognito-idp list-users `
  --user-pool-id us-east-1_XXXXXXXXX `
  --region us-east-1
```

2. **Check email is verified:**

```powershell
aws cognito-idp admin-get-user `
  --user-pool-id us-east-1_XXXXXXXXX `
  --username user@example.com
```

3. **Verify using correct User Pool ID:**

```powershell
cat .env.local | Select-String "COGNITO_USER_POOL_ID"
```

### Issue: Admin operations fail - "User is not authorized"

**Error:**
User cannot access admin routes despite being logged in.

**Solution:**

Add user to Admins group:

```powershell
aws cognito-idp admin-add-user-to-group `
  --user-pool-id us-east-1_XXXXXXXXX `
  --username admin@example.com `
  --group-name Admins `
  --region us-east-1
```

Verify group membership:

```powershell
aws cognito-idp admin-list-groups-for-user `
  --user-pool-id us-east-1_XXXXXXXXX `
  --username admin@example.com `
  --region us-east-1
```

## 🐛 Lambda Function Issues

### Issue: Lambda timeout

**Error:**

```
Task timed out after 30.00 seconds
```

**Solutions:**

1. **Check CloudWatch logs:**

```powershell
aws logs tail /aws/lambda/cert-quiz-score-calculator --follow
```

2. **Increase timeout** in `infrastructure/terraform/lambda.tf`:

```hcl
resource "aws_lambda_function" "score_calculator" {
  timeout = 60  # Increase from 30 to 60 seconds
}
```

3. **Optimize Lambda function:**

- Reduce DynamoDB query complexity
- Add pagination for large datasets
- Cache frequently accessed data

### Issue: Lambda cold start latency

**Symptom:**
First quiz load is slow (~5 seconds), subsequent loads are fast.

**Solutions:**

1. **Add provisioned concurrency** (costs more):

```hcl
resource "aws_lambda_provisioned_concurrency_config" "quiz_selector" {
  function_name                     = aws_lambda_function.quiz_selector.function_name
  provisioned_concurrent_executions = 1
}
```

2. **Increase memory** (faster CPU):

```hcl
memory_size = 1024  # Increase from 512 to 1024 MB
```

3. **Accept cold starts** (cheapest option, 2-5s delay is acceptable for this use case)

## 📊 Monitoring & Debugging

### Enable Debug Logging

**Lambda:**
Set `LOG_LEVEL=DEBUG` environment variable in Terraform:

```hcl
environment {
  variables = {
    LOG_LEVEL = "DEBUG"
  }
}
```

**Frontend:**
Add to `.env.local`:

```bash
NEXT_PUBLIC_DEBUG=true
```

### View Lambda Logs

```powershell
# Quiz Selector logs
aws logs tail /aws/lambda/cert-quiz-quiz-selector --follow --region us-east-1

# Score Calculator logs
aws logs tail /aws/lambda/cert-quiz-score-calculator --follow --region us-east-1
```

### Check DynamoDB Metrics

```powershell
aws cloudwatch get-metric-statistics `
  --namespace AWS/DynamoDB `
  --metric-name ConsumedReadCapacityUnits `
  --dimensions Name=TableName,Value=cert-quiz-questions `
  --statistics Sum `
  --start-time 2025-11-10T00:00:00Z `
  --end-time 2025-11-10T23:59:59Z `
  --period 3600
```

## 🆘 Getting More Help

### 1. Check Documentation

- [Deployment Guide](./README.md)
- [System Architecture](../architecture/system-overview.md)
- [Development Guide](../development/frontend-guide.md)

### 2. Enable Verbose Logging

- Set `LOG_LEVEL=DEBUG` in Lambda environment variables
- Check browser console (F12) for frontend errors
- Review CloudWatch logs for backend errors

### 3. Community Support

- [GitHub Issues](https://github.com/cristofima/AWS-Cert-Quiz-Platform/issues)
- [AWS Forums](https://forums.aws.amazon.com/)

### 4. AWS Support

- [AWS Support Center](https://console.aws.amazon.com/support/)
- [Terraform AWS Provider Issues](https://github.com/hashicorp/terraform-provider-aws/issues)
