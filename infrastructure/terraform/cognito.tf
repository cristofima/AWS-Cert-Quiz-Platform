# Amazon Cognito Configuration
# Manages user authentication and authorization for the quiz platform

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-users-${var.environment}"

  # Username Configuration
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Password Policy
  password_policy {
    minimum_length                   = var.cognito_password_minimum_length
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  # Account Recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # User Attribute Schema
  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = false
    required            = true

    string_attribute_constraints {
      min_length = 5
      max_length = 255
    }
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    mutable             = true
    required            = false

    string_attribute_constraints {
      min_length = 1
      max_length = 255
    }
  }

  # Email Configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # MFA Configuration (Optional)
  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = true
  }

  # User Pool Add-ons
  user_pool_add_ons {
    advanced_security_mode = "AUDIT"
  }

  # Deletion Protection
  deletion_protection = "ACTIVE"

  tags = {
    Name = "${var.project_name}-user-pool-${var.environment}"
  }
}

# Cognito User Pool Client (for Next.js web app)
resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.project_name}-web-client-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id

  # OAuth Configuration
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile", "aws.cognito.signin.user.admin"]

  # Callback URLs - Initial setup (will be updated after Amplify deployment)
  # Note: After first deployment, update these URLs manually in AWS Console
  # or use a second terraform apply with the Amplify domain
  callback_urls = [
    "http://localhost:3000/auth/callback",
    "https://*.amplifyapp.com/auth/callback" # Wildcard for Amplify domains
  ]

  logout_urls = [
    "http://localhost:3000",
    "https://*.amplifyapp.com" # Wildcard for Amplify domains
  ]

  supported_identity_providers = ["COGNITO"]

  # Authentication Flows
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]                          # Token Validity
  access_token_validity  = 1 # 1 hour
  id_token_validity      = 1 # 1 hour
  refresh_token_validity = var.cognito_token_validity_days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Prevent destroying client with active users
  prevent_user_existence_errors = "ENABLED"

  # Read/Write Attributes
  read_attributes = [
    "email",
    "email_verified",
    "name",
    "sub"
  ]

  write_attributes = [
    "email",
    "name"
  ]
}

# Cognito User Pool Domain
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${var.environment}-${data.aws_caller_identity.current.account_id}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# CloudWatch Log Group for Cognito
resource "aws_cloudwatch_log_group" "cognito" {
  name              = "/aws/cognito/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-cognito-logs-${var.environment}"
  }
}
