# AWS Lambda Functions Configuration
# Manages quiz question selection and score calculation
# Only deployed in Article 1+

#------------------------------------------------------------------------------
# IAM Role for Lambda Functions
#------------------------------------------------------------------------------

# Quiz Selector Lambda IAM Role
resource "aws_iam_role" "quiz_selector_lambda" {
  count = local.deploy_article_1 ? 1 : 0

  name = "${var.project_name}-quiz-selector-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-quiz-selector-role-${var.environment}"
  }
}

# Score Calculator Lambda IAM Role
resource "aws_iam_role" "score_calculator_lambda" {
  count = local.deploy_article_1 ? 1 : 0

  name = "${var.project_name}-score-calculator-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-score-calculator-role-${var.environment}"
  }
}

#------------------------------------------------------------------------------
# IAM Policies
#------------------------------------------------------------------------------

# Basic Lambda execution policy (CloudWatch Logs)
resource "aws_iam_role_policy_attachment" "quiz_selector_basic" {
  count = local.deploy_article_1 ? 1 : 0

  role       = aws_iam_role.quiz_selector_lambda[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "score_calculator_basic" {
  count = local.deploy_article_1 ? 1 : 0

  role       = aws_iam_role.score_calculator_lambda[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB access policy for Quiz Selector
resource "aws_iam_role_policy" "quiz_selector_dynamodb" {
  count = local.deploy_article_1 ? 1 : 0

  name = "${var.project_name}-quiz-selector-dynamodb-${var.environment}"
  role = aws_iam_role.quiz_selector_lambda[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem"
        ]
        Resource = [
          aws_dynamodb_table.questions[0].arn,
          "${aws_dynamodb_table.questions[0].arn}/index/*"
        ]
      }
    ]
  })
}

# DynamoDB access policy for Score Calculator
resource "aws_iam_role_policy" "score_calculator_dynamodb" {
  count = local.deploy_article_1 ? 1 : 0

  name = "${var.project_name}-score-calculator-dynamodb-${var.environment}"
  role = aws_iam_role.score_calculator_lambda[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.quiz_sessions[0].arn,
          aws_dynamodb_table.user_progress[0].arn,
          "${aws_dynamodb_table.quiz_sessions[0].arn}/index/*",
          "${aws_dynamodb_table.user_progress[0].arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:BatchGetItem"
        ]
        Resource = [
          aws_dynamodb_table.questions[0].arn
        ]
      }
    ]
  })
}

#------------------------------------------------------------------------------
# Lambda Functions
#------------------------------------------------------------------------------

# Archive Lambda source code (placeholder - will be replaced with actual code)
data "archive_file" "quiz_selector" {
  type        = "zip"
  source_dir  = "${path.module}/../../lambdas/quiz-selector"
  output_path = "${path.module}/../../.terraform/lambda/quiz-selector.zip"
}

data "archive_file" "score_calculator" {
  type        = "zip"
  source_dir  = "${path.module}/../../lambdas/score-calculator"
  output_path = "${path.module}/../../.terraform/lambda/score-calculator.zip"
}

# Quiz Selector Lambda Function
resource "aws_lambda_function" "quiz_selector" {
  count = local.deploy_article_1 ? 1 : 0

  filename         = data.archive_file.quiz_selector.output_path
  function_name    = "${var.project_name}-quiz-selector-${var.environment}"
  role             = aws_iam_role.quiz_selector_lambda[0].arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.quiz_selector.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory_size

  environment {
    variables = {
      QUESTIONS_TABLE_NAME                = aws_dynamodb_table.questions[0].name
      AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
      LOG_LEVEL                           = "INFO"
    }
  }

  tracing_config {
    mode = "Active"
  }

  tags = {
    Name = "${var.project_name}-quiz-selector-${var.environment}"
  }
}

# Score Calculator Lambda Function
resource "aws_lambda_function" "score_calculator" {
  count = local.deploy_article_1 ? 1 : 0

  filename         = data.archive_file.score_calculator.output_path
  function_name    = "${var.project_name}-score-calculator-${var.environment}"
  role             = aws_iam_role.score_calculator_lambda[0].arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.score_calculator.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory_size

  environment {
    variables = {
      QUESTIONS_TABLE_NAME                = aws_dynamodb_table.questions[0].name
      QUIZ_SESSIONS_TABLE_NAME            = aws_dynamodb_table.quiz_sessions[0].name
      USER_PROGRESS_TABLE_NAME            = aws_dynamodb_table.user_progress[0].name
      AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
      LOG_LEVEL                           = "INFO"
    }
  }

  tracing_config {
    mode = "Active"
  }

  tags = {
    Name = "${var.project_name}-score-calculator-${var.environment}"
  }
}

#------------------------------------------------------------------------------
# CloudWatch Log Groups for Lambda Functions
#------------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "quiz_selector" {
  count = local.deploy_article_1 ? 1 : 0

  name              = "/aws/lambda/${aws_lambda_function.quiz_selector[0].function_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-quiz-selector-logs-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "score_calculator" {
  count = local.deploy_article_1 ? 1 : 0

  name              = "/aws/lambda/${aws_lambda_function.score_calculator[0].function_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-score-calculator-logs-${var.environment}"
  }
}

#------------------------------------------------------------------------------
# CloudWatch Alarms for Lambda Functions
#------------------------------------------------------------------------------
# NOTE: Commented out - requires cloudwatch:PutMetricAlarm IAM permission
#       Uncomment after adding permission to IAM user

# # Quiz Selector Lambda Errors
# resource "aws_cloudwatch_metric_alarm" "quiz_selector_errors" {
#   count = local.deploy_article_1 ? 1 : 0
#
#   alarm_name          = "${var.project_name}-quiz-selector-errors-${var.environment}"
#   comparison_operator = "GreaterThanThreshold"
#   evaluation_periods  = 2
#   metric_name         = "Errors"
#   namespace           = "AWS/Lambda"
#   period              = 300
#   statistic           = "Sum"
#   threshold           = 5
#   alarm_description   = "Quiz selector Lambda function errors"
#   treat_missing_data  = "notBreaching"
#
#   dimensions = {
#     FunctionName = aws_lambda_function.quiz_selector[0].function_name
#   }
# }

# # Score Calculator Lambda Errors
# resource "aws_cloudwatch_metric_alarm" "score_calculator_errors" {
#   count = local.deploy_article_1 ? 1 : 0
#
#   alarm_name          = "${var.project_name}-score-calculator-errors-${var.environment}"
#   comparison_operator = "GreaterThanThreshold"
#   evaluation_periods  = 2
#   metric_name         = "Errors"
#   namespace           = "AWS/Lambda"
#   period              = 300
#   statistic           = "Sum"
#   threshold           = 5
#   alarm_description   = "Score calculator Lambda function errors"
#   treat_missing_data  = "notBreaching"
#
#   dimensions = {
#     FunctionName = aws_lambda_function.score_calculator[0].function_name
#   }
# }

#------------------------------------------------------------------------------
# Custom Message Lambda (Cognito Email Customization)
#------------------------------------------------------------------------------

# IAM Role for CustomMessage Lambda
resource "aws_iam_role" "custom_message_lambda" {
  name = "${var.project_name}-custom-message-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-custom-message-role-${var.environment}"
  }
}

# Basic Lambda execution policy for CustomMessage
resource "aws_iam_role_policy_attachment" "custom_message_basic" {
  role       = aws_iam_role.custom_message_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Archive CustomMessage Lambda source code
data "archive_file" "custom_message" {
  type        = "zip"
  source_dir  = "${path.module}/../../lambdas/custom-message"
  output_path = "${path.module}/../../.terraform/lambda/custom-message.zip"

  excludes = [
    "index.ts",
    "tsconfig.json",
    "dist",
    "*.d.ts",
    "*.map"
  ]
}

# CustomMessage Lambda Function
resource "aws_lambda_function" "custom_message" {
  filename         = data.archive_file.custom_message.output_path
  function_name    = "${var.project_name}-custom-message-${var.environment}"
  role             = aws_iam_role.custom_message_lambda.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.custom_message.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = 10 # CustomMessage trigger has strict timeout limits
  memory_size      = 256

  environment {
    variables = {
      FRONTEND_URL = var.frontend_url
      LOG_LEVEL    = "INFO"
    }
  }

  tags = {
    Name = "${var.project_name}-custom-message-${var.environment}"
  }
}

# CloudWatch Log Group for CustomMessage Lambda
resource "aws_cloudwatch_log_group" "custom_message" {
  name              = "/aws/lambda/${aws_lambda_function.custom_message.function_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-custom-message-logs-${var.environment}"
  }
}

# Lambda Permission for Cognito to invoke CustomMessage
resource "aws_lambda_permission" "cognito_custom_message" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.custom_message.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}
