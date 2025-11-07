# Amazon DynamoDB Tables Configuration
# Stores quiz questions, user sessions, and progress tracking
# Only deployed in Article 1+

#------------------------------------------------------------------------------
# Questions Table
#------------------------------------------------------------------------------
# Stores all quiz questions with support for multiple exam types and domains
# PK: examType (e.g., "Developer-Associate")
# SK: Q#<questionId> (e.g., "Q#001")

resource "aws_dynamodb_table" "questions" {
  count = local.deploy_article_1 ? 1 : 0

  name         = "${var.project_name}-questions-${var.environment}"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "PK" # Partition Key: examType
  range_key    = "SK" # Sort Key: Q#<questionId>

  # Attributes
  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "domain"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  # GSI 1: Query by domain within exam type
  global_secondary_index {
    name            = "DomainIndex"
    hash_key        = "PK"
    range_key       = "domain"
    projection_type = "ALL"
  }

  # GSI 2: Query by status (for admin approval workflow - future)
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  # Point-in-time Recovery
  point_in_time_recovery {
    enabled = true
  }

  # Server-Side Encryption
  server_side_encryption {
    enabled = true
  }

  # TTL Configuration (optional - for archiving old questions)
  ttl {
    attribute_name = "ttl"
    enabled        = false
  }

  tags = {
    Name = "${var.project_name}-questions-${var.environment}"
    Type = "QuestionBank"
  }
}

#------------------------------------------------------------------------------
# Quiz Sessions Table
#------------------------------------------------------------------------------
# Stores user quiz attempts with questions, answers, and scores
# PK: userId
# SK: SESSION#<timestamp>

resource "aws_dynamodb_table" "quiz_sessions" {
  count = local.deploy_article_1 ? 1 : 0

  name         = "${var.project_name}-quiz-sessions-${var.environment}"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "PK" # Partition Key: userId
  range_key    = "SK" # Sort Key: SESSION#<timestamp>

  # Attributes
  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "examType"
    type = "S"
  }

  attribute {
    name = "completedAt"
    type = "S"
  }

  # GSI 1: Query sessions by exam type
  global_secondary_index {
    name            = "ExamTypeIndex"
    hash_key        = "examType"
    range_key       = "completedAt"
    projection_type = "ALL"
  }

  # Point-in-time Recovery
  point_in_time_recovery {
    enabled = true
  }

  # Server-Side Encryption
  server_side_encryption {
    enabled = true
  }

  # TTL Configuration (auto-delete sessions after 90 days)
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name = "${var.project_name}-quiz-sessions-${var.environment}"
    Type = "SessionData"
  }
}

#------------------------------------------------------------------------------
# User Progress Table
#------------------------------------------------------------------------------
# Stores user progress, scores by domain, and learning analytics
# PK: userId
# SK: PROGRESS#<examType>

resource "aws_dynamodb_table" "user_progress" {
  count = local.deploy_article_1 ? 1 : 0

  name         = "${var.project_name}-user-progress-${var.environment}"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "PK" # Partition Key: userId
  range_key    = "SK" # Sort Key: PROGRESS#<examType>

  # Attributes
  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "lastUpdated"
    type = "S"
  }

  # GSI 1: Query users by last activity (for analytics - future)
  global_secondary_index {
    name            = "ActivityIndex"
    hash_key        = "SK"
    range_key       = "lastUpdated"
    projection_type = "ALL"
  }

  # Point-in-time Recovery
  point_in_time_recovery {
    enabled = true
  }

  # Server-Side Encryption
  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${var.project_name}-user-progress-${var.environment}"
    Type = "UserData"
  }
}

#------------------------------------------------------------------------------
# CloudWatch Alarms for DynamoDB
#------------------------------------------------------------------------------
# NOTE: Commented out - requires cloudwatch:PutMetricAlarm IAM permission
#       Uncomment after adding permission to IAM user

# # Questions Table - Read Throttle Alarm
# resource "aws_cloudwatch_metric_alarm" "questions_read_throttle" {
#   count = local.deploy_article_1 ? 1 : 0
#
#   alarm_name          = "${var.project_name}-questions-read-throttle-${var.environment}"
#   comparison_operator = "GreaterThanThreshold"
#   evaluation_periods  = 2
#   metric_name         = "UserErrors"
#   namespace           = "AWS/DynamoDB"
#   period              = 300
#   statistic           = "Sum"
#   threshold           = 10
#   alarm_description   = "Questions table read throttle events"
#   treat_missing_data  = "notBreaching"
#
#   dimensions = {
#     TableName = aws_dynamodb_table.questions[0].name
#   }
# }

# # Quiz Sessions Table - Write Throttle Alarm
# resource "aws_cloudwatch_metric_alarm" "sessions_write_throttle" {
#   count = local.deploy_article_1 ? 1 : 0
#
#   alarm_name          = "${var.project_name}-sessions-write-throttle-${var.environment}"
#   comparison_operator = "GreaterThanThreshold"
#   evaluation_periods  = 2
#   metric_name         = "UserErrors"
#   namespace           = "AWS/DynamoDB"
#   period              = 300
#   statistic           = "Sum"
#   threshold           = 10
#   alarm_description   = "Quiz sessions table write throttle events"
#   treat_missing_data  = "notBreaching"
#
#   dimensions = {
#     TableName = aws_dynamodb_table.quiz_sessions[0].name
#   }
# }
