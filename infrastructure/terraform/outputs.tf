# Terraform Outputs for AWS Certification Quiz Platform
# These values are used by the Next.js frontend and deployment scripts

# AWS Account Information
output "aws_account_id" {
  description = "AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  description = "AWS Region"
  value       = data.aws_region.current.name
}

# Cognito Outputs
output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.main.arn
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.web.id
}

output "cognito_user_pool_endpoint" {
  description = "Cognito User Pool Endpoint"
  value       = aws_cognito_user_pool.main.endpoint
}

# DynamoDB Outputs (Article 1+)
output "dynamodb_questions_table_name" {
  description = "DynamoDB Questions Table Name"
  value       = local.deploy_article_1 ? aws_dynamodb_table.questions[0].name : null
}

output "dynamodb_quiz_sessions_table_name" {
  description = "DynamoDB Quiz Sessions Table Name"
  value       = local.deploy_article_1 ? aws_dynamodb_table.quiz_sessions[0].name : null
}

output "dynamodb_user_progress_table_name" {
  description = "DynamoDB User Progress Table Name"
  value       = local.deploy_article_1 ? aws_dynamodb_table.user_progress[0].name : null
}

# Lambda Outputs (Article 1+)
output "lambda_quiz_selector_arn" {
  description = "Quiz Selector Lambda Function ARN"
  value       = local.deploy_article_1 ? aws_lambda_function.quiz_selector[0].arn : null
}

output "lambda_quiz_selector_name" {
  description = "Quiz Selector Lambda Function Name"
  value       = local.deploy_article_1 ? aws_lambda_function.quiz_selector[0].function_name : null
}

output "lambda_score_calculator_arn" {
  description = "Score Calculator Lambda Function ARN"
  value       = local.deploy_article_1 ? aws_lambda_function.score_calculator[0].arn : null
}

output "lambda_score_calculator_name" {
  description = "Score Calculator Lambda Function Name"
  value       = local.deploy_article_1 ? aws_lambda_function.score_calculator[0].function_name : null
}

# AppSync Outputs (Article 1+)
output "appsync_graphql_url" {
  description = "AppSync GraphQL API URL"
  value       = local.deploy_article_1 ? aws_appsync_graphql_api.main[0].uris["GRAPHQL"] : null
}

output "appsync_api_id" {
  description = "AppSync API ID"
  value       = local.deploy_article_1 ? aws_appsync_graphql_api.main[0].id : null
}

output "appsync_api_key" {
  description = "AppSync API Key (for development only)"
  value       = local.deploy_article_1 ? aws_appsync_api_key.dev[0].key : null
  sensitive   = true
}

# Environment Configuration for Next.js (Article 1+)
output "next_env_variables" {
  description = "Environment variables for Next.js .env.local file"
  value = local.deploy_article_1 ? {
    NEXT_PUBLIC_AWS_REGION               = data.aws_region.current.name
    NEXT_PUBLIC_COGNITO_USER_POOL_ID     = aws_cognito_user_pool.main.id
    NEXT_PUBLIC_COGNITO_CLIENT_ID        = aws_cognito_user_pool_client.web.id
    NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT = aws_appsync_graphql_api.main[0].uris["GRAPHQL"]
    NEXT_PUBLIC_APPSYNC_API_KEY          = aws_appsync_api_key.dev[0].key
    AMPLIFY_APP_URL                      = local.deploy_article_1 && var.github_repository_url != "" ? "https://main.${aws_amplify_app.frontend[0].default_domain}" : "Not deployed - set github_repository_url"
  } : null
  sensitive = true
}

# Deployment Instructions
output "deployment_instructions" {
  description = "Next steps after Terraform deployment"
  value       = local.deploy_article_1 && var.github_repository_url != "" ? "✅ Infrastructure deployed with Amplify! Check AWS Console for AppSync URL and update Amplify environment variables." : "✅ Infrastructure deployed (without Amplify). Set github_repository_url to deploy frontend hosting."
}
