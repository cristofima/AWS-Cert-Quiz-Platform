# AWS Certification Quiz Platform - Terraform Configuration
# Region: us-east-1 (N. Virginia) - Full Bedrock availability
# Article Series: Modular deployment for 3-part tutorial

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state management
  # Uncomment and configure after creating S3 bucket + DynamoDB table for locking
  # backend "s3" {
  #   bucket         = "aws-cert-quiz-terraform-state"
  #   key            = "terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

# AWS Provider Configuration
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "AWS-Cert-Quiz-Platform"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "cristofima"
      Article     = var.article_phase
    }
  }
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# Data source for AWS region
data "aws_region" "current" {}

#------------------------------------------------------------------------------
# Article Phase Control
# Set var.article_phase to control which resources to deploy:
# - "article-1" = Cognito + Amplify Hosting (Signup/Signin)
# - "article-2" = + DynamoDB + Lambda + AppSync (Quiz Engine)
# - "article-3" = + Bedrock + EventBridge (AI Generation + Admin)
#------------------------------------------------------------------------------

locals {
  deploy_article_1 = contains(["article-1", "article-2", "article-3"], var.article_phase)
  deploy_article_2 = contains(["article-2", "article-3"], var.article_phase)
  deploy_article_3 = contains(["article-3"], var.article_phase)
}
