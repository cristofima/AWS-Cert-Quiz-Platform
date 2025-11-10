# Input Variables for AWS Certification Quiz Platform

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod"
  }
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "cert-quiz"
}

#------------------------------------------------------------------------------
# Article Phase Control
#------------------------------------------------------------------------------
variable "article_phase" {
  description = "Article deployment phase (article-1, article-2, article-3)"
  type        = string
  default     = "article-1"

  validation {
    condition     = contains(["article-1", "article-2", "article-3"], var.article_phase)
    error_message = "Article phase must be article-1, article-2, or article-3"
  }
}

#------------------------------------------------------------------------------
# Cognito Configuration (Article 1)
#------------------------------------------------------------------------------
variable "cognito_password_minimum_length" {
  description = "Minimum password length for Cognito users"
  type        = number
  default     = 8
}

variable "cognito_token_validity_days" {
  description = "Refresh token validity in days"
  type        = number
  default     = 30
}

#------------------------------------------------------------------------------
# Amplify Hosting Configuration (Article 1)
#------------------------------------------------------------------------------
variable "github_repository_url" {
  description = "GitHub repository URL for Amplify (e.g., https://github.com/cristofima/AWS-Cert-Quiz-Platform)"
  type        = string
  default     = ""
}

variable "github_access_token" {
  description = "GitHub personal access token for Amplify (set via TF_VAR_github_access_token)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "amplify_branch_name" {
  description = "Git branch to deploy with Amplify"
  type        = string
  default     = "main"
}

#------------------------------------------------------------------------------
# Lambda Configuration (Article 2+)
#------------------------------------------------------------------------------
variable "lambda_runtime" {
  description = "Lambda runtime version"
  type        = string
  default     = "nodejs20.x"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 512
}

#------------------------------------------------------------------------------
# DynamoDB Configuration (Article 2+)
#------------------------------------------------------------------------------
variable "dynamodb_billing_mode" {
  description = "DynamoDB billing mode (PROVISIONED or PAY_PER_REQUEST)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

#------------------------------------------------------------------------------
# AppSync Configuration (Article 2+)
#------------------------------------------------------------------------------
variable "appsync_log_level" {
  description = "AppSync logging level (NONE, ERROR, ALL)"
  type        = string
  default     = "ERROR"

  validation {
    condition     = contains(["NONE", "ERROR", "ALL"], var.appsync_log_level)
    error_message = "Log level must be NONE, ERROR, or ALL"
  }
}

#------------------------------------------------------------------------------
# Frontend Configuration
#------------------------------------------------------------------------------
variable "frontend_url" {
  description = "Frontend URL for password reset links (e.g., https://app.example.com or http://localhost:3000)"
  type        = string
  default     = "http://localhost:3000"
}
