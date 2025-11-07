# AWS AppSync GraphQL API Configuration
# Manages the GraphQL API with Cognito authentication and Lambda resolvers
# Only deployed in Article 1+

#------------------------------------------------------------------------------
# AppSync GraphQL API
#------------------------------------------------------------------------------

resource "aws_appsync_graphql_api" "main" {
  count = local.deploy_article_1 ? 1 : 0

  name                = "${var.project_name}-api-${var.environment}"
  authentication_type = "AMAZON_COGNITO_USER_POOLS"

  # GraphQL Schema
  schema = file("${path.module}/schema.graphql")

  user_pool_config {
    default_action      = "ALLOW"
    user_pool_id        = aws_cognito_user_pool.main.id
    aws_region          = var.aws_region
    app_id_client_regex = aws_cognito_user_pool_client.web.id
  }

  # Additional authentication providers
  additional_authentication_provider {
    authentication_type = "API_KEY"
  }

  # Logging configuration
  log_config {
    cloudwatch_logs_role_arn = aws_iam_role.appsync_logs[0].arn
    field_log_level          = var.appsync_log_level
    exclude_verbose_content  = true
  }

  # X-Ray tracing
  xray_enabled = true

  tags = {
    Name = "${var.project_name}-graphql-api-${var.environment}"
  }
}

# API Key for development (expires in 365 days)
resource "aws_appsync_api_key" "dev" {
  count = local.deploy_article_1 ? 1 : 0

  api_id  = aws_appsync_graphql_api.main[0].id
  expires = timeadd(timestamp(), "8760h") # 365 days
}

#------------------------------------------------------------------------------
# IAM Role for AppSync CloudWatch Logs
#------------------------------------------------------------------------------

resource "aws_iam_role" "appsync_logs" {
  count = local.deploy_article_1 ? 1 : 0

  name = "${var.project_name}-appsync-logs-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "appsync.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-appsync-logs-role-${var.environment}"
  }
}

resource "aws_iam_role_policy" "appsync_logs" {
  count = local.deploy_article_1 ? 1 : 0

  name = "${var.project_name}-appsync-logs-policy-${var.environment}"
  role = aws_iam_role.appsync_logs[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
      }
    ]
  })
}

#------------------------------------------------------------------------------
# Lambda Data Sources
#------------------------------------------------------------------------------

# Quiz Selector Data Source
resource "aws_appsync_datasource" "quiz_selector" {
  count = local.deploy_article_1 ? 1 : 0

  api_id           = aws_appsync_graphql_api.main[0].id
  name             = "QuizSelectorDataSource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda_invoke[0].arn

  lambda_config {
    function_arn = aws_lambda_function.quiz_selector[0].arn
  }
}

# Score Calculator Data Source
resource "aws_appsync_datasource" "score_calculator" {
  count = local.deploy_article_1 ? 1 : 0

  api_id           = aws_appsync_graphql_api.main[0].id
  name             = "ScoreCalculatorDataSource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda_invoke[0].arn

  lambda_config {
    function_arn = aws_lambda_function.score_calculator[0].arn
  }
}

# DynamoDB Data Sources (for direct access)
resource "aws_appsync_datasource" "user_progress" {
  count = local.deploy_article_1 ? 1 : 0

  api_id           = aws_appsync_graphql_api.main[0].id
  name             = "UserProgressDataSource"
  type             = "AMAZON_DYNAMODB"
  service_role_arn = aws_iam_role.appsync_dynamodb[0].arn

  dynamodb_config {
    table_name = aws_dynamodb_table.user_progress[0].name
  }
}

resource "aws_appsync_datasource" "quiz_sessions" {
  count = local.deploy_article_1 ? 1 : 0

  api_id           = aws_appsync_graphql_api.main[0].id
  name             = "QuizSessionsDataSource"
  type             = "AMAZON_DYNAMODB"
  service_role_arn = aws_iam_role.appsync_dynamodb[0].arn

  dynamodb_config {
    table_name = aws_dynamodb_table.quiz_sessions[0].name
  }
}

#------------------------------------------------------------------------------
# IAM Roles for AppSync Data Sources
#------------------------------------------------------------------------------

# Lambda Invoke Role
resource "aws_iam_role" "appsync_lambda_invoke" {
  count = local.deploy_article_1 ? 1 : 0

  name = "${var.project_name}-appsync-lambda-invoke-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "appsync.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-appsync-lambda-invoke-${var.environment}"
  }
}

resource "aws_iam_role_policy" "appsync_lambda_invoke" {
  count = local.deploy_article_1 ? 1 : 0

  name = "${var.project_name}-appsync-lambda-invoke-policy-${var.environment}"
  role = aws_iam_role.appsync_lambda_invoke[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.quiz_selector[0].arn,
          aws_lambda_function.score_calculator[0].arn
        ]
      }
    ]
  })
}

# DynamoDB Access Role
resource "aws_iam_role" "appsync_dynamodb" {
  count = local.deploy_article_1 ? 1 : 0

  name = "${var.project_name}-appsync-dynamodb-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "appsync.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-appsync-dynamodb-${var.environment}"
  }
}

resource "aws_iam_role_policy" "appsync_dynamodb" {
  count = local.deploy_article_1 ? 1 : 0

  name = "${var.project_name}-appsync-dynamodb-policy-${var.environment}"
  role = aws_iam_role.appsync_dynamodb[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.user_progress[0].arn,
          aws_dynamodb_table.quiz_sessions[0].arn,
          "${aws_dynamodb_table.user_progress[0].arn}/index/*",
          "${aws_dynamodb_table.quiz_sessions[0].arn}/index/*"
        ]
      }
    ]
  })
}

#------------------------------------------------------------------------------
# Resolvers
#------------------------------------------------------------------------------

# Query: getQuizQuestions
resource "aws_appsync_resolver" "get_quiz_questions" {
  count = local.deploy_article_1 ? 1 : 0

  api_id      = aws_appsync_graphql_api.main[0].id
  type        = "Query"
  field       = "getQuizQuestions"
  data_source = aws_appsync_datasource.quiz_selector[0].name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {
    "examType": $util.toJson($context.arguments.input.examType),
    "questionCount": $util.toJson($context.arguments.input.questionCount),
    "domains": $util.toJson($context.arguments.input.domains)
  }
}
EOF

  response_template = <<EOF
$util.toJson($context.result)
EOF
}

# Mutation: submitQuiz
resource "aws_appsync_resolver" "submit_quiz" {
  count = local.deploy_article_1 ? 1 : 0

  api_id      = aws_appsync_graphql_api.main[0].id
  type        = "Mutation"
  field       = "submitQuiz"
  data_source = aws_appsync_datasource.score_calculator[0].name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {
    "userId": "$context.identity.sub",
    "examType": $util.toJson($context.arguments.input.examType),
    "questionIds": $util.toJson($context.arguments.input.questionIds),
    "userAnswers": $util.toJson($context.arguments.input.userAnswers)
  }
}
EOF

  response_template = <<EOF
$util.toJson($context.result)
EOF
}

# Query: getUserProgress
resource "aws_appsync_resolver" "get_user_progress" {
  count = local.deploy_article_1 ? 1 : 0

  api_id      = aws_appsync_graphql_api.main[0].id
  type        = "Query"
  field       = "getUserProgress"
  data_source = aws_appsync_datasource.user_progress[0].name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "GetItem",
  "key": {
    "PK": $util.dynamodb.toDynamoDBJson("$context.identity.sub"),
    "SK": $util.dynamodb.toDynamoDBJson("PROGRESS#$context.arguments.examType")
  }
}
EOF

  response_template = <<EOF
$util.toJson($context.result)
EOF
}

# Query: getQuizHistory
resource "aws_appsync_resolver" "get_quiz_history" {
  count = local.deploy_article_1 ? 1 : 0

  api_id      = aws_appsync_graphql_api.main[0].id
  type        = "Query"
  field       = "getQuizHistory"
  data_source = aws_appsync_datasource.quiz_sessions[0].name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "Query",
  "query": {
    "expression": "PK = :userId",
    "expressionValues": {
      ":userId": $util.dynamodb.toDynamoDBJson("$context.identity.sub")
    }
  },
  "limit": $util.defaultIfNull($context.arguments.limit, 20),
  "nextToken": $util.toJson($context.arguments.nextToken),
  "scanIndexForward": false
}
EOF

  response_template = <<EOF
{
  "sessions": $util.toJson($context.result.items),
  "nextToken": $util.toJson($context.result.nextToken)
}
EOF
}

#------------------------------------------------------------------------------
# CloudWatch Log Group for AppSync
#------------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "appsync" {
  count = local.deploy_article_1 ? 1 : 0

  name              = "/aws/appsync/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-appsync-logs-${var.environment}"
  }
}
