# AWS Amplify Hosting Configuration
# Hosts the Next.js 16 frontend application with automatic CI/CD from GitHub

# Only deploy in Article 1+ AND when GitHub repository URL is provided
resource "aws_amplify_app" "frontend" {
  count = local.deploy_article_1 && var.github_repository_url != "" ? 1 : 0

  name         = "${var.project_name}-frontend-${var.environment}"
  repository   = var.github_repository_url
  access_token = var.github_access_token

  # Build settings for Next.js 16
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd frontend
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: frontend/.next
        files:
          - '**/*'
      cache:
        paths:
          - frontend/node_modules/**/*
  EOT

  # Environment variables (injected from Terraform outputs)
  # Note: APPSYNC_GRAPHQL_ENDPOINT will be empty on first apply
  # Run terraform apply twice or update manually in AWS Console
  environment_variables = {
    NEXT_PUBLIC_AWS_REGION               = var.aws_region
    NEXT_PUBLIC_COGNITO_USER_POOL_ID     = aws_cognito_user_pool.main.id
    NEXT_PUBLIC_COGNITO_CLIENT_ID        = aws_cognito_user_pool_client.web.id
    NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT = ""                       # Will be populated after first apply
    NEXT_PUBLIC_APP_URL                  = "https://localhost:3000" # Placeholder
  }

  # Enable auto branch creation
  enable_auto_branch_creation = false
  enable_branch_auto_build    = true
  enable_branch_auto_deletion = false

  # Custom rules for SPA routing
  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }

  tags = {
    Name = "${var.project_name}-amplify-${var.environment}"
  }
}

# Main branch deployment
resource "aws_amplify_branch" "main" {
  count = local.deploy_article_1 && var.github_repository_url != "" ? 1 : 0

  app_id      = aws_amplify_app.frontend[0].id
  branch_name = var.amplify_branch_name

  enable_auto_build           = true
  enable_notification         = false
  enable_pull_request_preview = false

  stage = var.environment == "prod" ? "PRODUCTION" : "DEVELOPMENT"

  tags = {
    Name = "${var.project_name}-amplify-main-${var.environment}"
  }
}

# Outputs
output "amplify_app_id" {
  description = "Amplify App ID"
  value       = local.deploy_article_1 && var.github_repository_url != "" ? aws_amplify_app.frontend[0].id : null
}

output "amplify_default_domain" {
  description = "Amplify Default Domain"
  value       = local.deploy_article_1 && var.github_repository_url != "" ? aws_amplify_app.frontend[0].default_domain : null
}

output "amplify_app_url" {
  description = "Amplify App URL"
  value       = local.deploy_article_1 && var.github_repository_url != "" ? "https://main.${aws_amplify_app.frontend[0].default_domain}" : null
}

