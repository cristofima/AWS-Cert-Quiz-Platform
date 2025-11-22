# AWS Certification Quiz Platform 🎓

> Serverless AWS certification exam prep platform built with Next.js 16, Terraform, and AWS AppSync.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Terraform](https://img.shields.io/badge/Terraform-1.9+-purple)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com/)

---

## 🎯 Project Overview

A serverless quiz platform for AWS certification exam preparation. Built with Next.js 16 and Terraform, featuring AI-powered question generation with Amazon Bedrock.

### Key Features

- ✅ **AI-Powered Questions**: Generated with Claude 3.5 Sonnet via Amazon Bedrock
- ✅ **Multiple Question Types**: Single-choice, multiple-choice, true/false, scenario-based
- ✅ **Real-time Scoring** with detailed explanations
- ✅ **Progress Tracking** with domain-level analytics
- ✅ **Lightning Fast**: <100ms quiz loading with DynamoDB
- ✅ **Cost-Optimized**: ~$0.50/month for 100 active users

---

## 🏗️ Architecture

```
Next.js 16 (App Router) → Cognito Auth → AppSync GraphQL → Lambda → DynamoDB
                                                                ↓
                                                        Bedrock (Claude 3.5)
```

### AWS Services Used

- **Frontend**: Next.js 16 (App Router with TypeScript)
- **Authentication**: Amazon Cognito (User Pools + Groups + Custom Email Templates)
- **API**: AWS AppSync (GraphQL API with 4 resolvers)
- **Compute**: AWS Lambda (Node.js 20, 512MB, 30s timeout)
- **Database**: Amazon DynamoDB (3 tables: Questions, QuizSessions, UserProgress)
- **AI**: Amazon Bedrock (Claude 3.5 Sonnet v2 for question generation)
- **IaC**: Terraform 1.9+ (AWS Provider 5.x)

---

## 📊 Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (12 components)
- **Auth**: AWS Amplify Auth
- **Forms**: React Hook Form + Zod validation
- **State**: React Context + TanStack Query

### Backend

- **IaC**: Terraform 1.9+
- **AWS Provider**: ~> 5.0
- **Region**: us-east-1 (N. Virginia)
- **Lambda Runtime**: Node.js 20
- **Python**: 3.12 (Bedrock scripts)

### Lambda Functions

| Function           | Runtime    | Memory | Purpose                                            |
| ------------------ | ---------- | ------ | -------------------------------------------------- |
| `quiz-selector`    | Node.js 20 | 512 MB | Random question selection (strips correct answers) |
| `score-calculator` | Node.js 20 | 512 MB | Server-side scoring + session tracking             |
| `custom-message`   | Node.js 20 | 512 MB | Cognito email customization (forgot password flow) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.x or later
- **Terraform**: 1.9 or later
- **Python**: 3.9+ (for question generation)
- **AWS CLI**: Configured with credentials
- **AWS Account**: With permissions for Cognito, AppSync, Lambda, DynamoDB, Bedrock

### 1. Clone the Repository

```bash
git clone https://github.com/cristofima/AWS-Cert-Quiz-Platform.git
cd AWS-Cert-Quiz-Platform
```

### 2. Install Lambda Dependencies (BEFORE Terraform)

⚠️ **CRITICAL**: Install dependencies before deploying infrastructure (Terraform packages them into ZIPs).

```powershell
# Use build script (recommended)
.\scripts\build-lambdas.ps1

# OR manually:
cd lambdas/quiz-selector && npm install && cd ../..
cd lambdas/score-calculator && npm install && cd ../..
cd lambdas/custom-message && npm install && npm run build && cd ../..
```

### 3. Deploy Infrastructure with Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review planned changes
terraform plan -var="article_phase=article-2"

# Deploy infrastructure
terraform apply -var="article_phase=article-2" -auto-approve

# Save outputs for frontend configuration
terraform output -json > outputs.json
```

### 4. Configure Frontend Environment

Create `frontend/.env.local` from Terraform outputs:

```bash
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT=https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
NEXT_PUBLIC_AWS_REGION=us-east-1
```

### 5. Generate Questions with Bedrock

```bash
cd scripts
pip install -r requirements.txt

python generate-questions.py \
  --exam-type Developer-Associate \
  --count 50 \
  --region us-east-1
```

**Cost**: ~$0.015 per question (~$0.75 for 50 questions)

### 6. Start Development Server

```bash
cd frontend

# Start Next.js dev server
npm run dev

# Open http://localhost:3000
```

**Live Resource IDs**: Check `infrastructure/terraform/outputs.json` for actual deployed values.

---

## 📁 Project Structure

```
aws-cert-quiz-platform/
├── docs/                         # 📚 Complete documentation
│   ├── README.md                 # Documentation index
│   ├── CHANGELOG.md              # Version history
│   ├── architecture/             # System design docs
│   │   ├── system-overview.md
│   │   └── authentication.md
│   ├── deployment/               # Deployment guides
│   │   ├── README.md
│   │   ├── troubleshooting.md
│   │   ├── email-templates.md
│   │   └── forgot-password-lambda.md
│   └── development/              # Developer guides
│       ├── graphql-integration.md
│       ├── forgot-password-flow.md
│       └── colors.md
├── frontend/                     # Next.js 16 App
│   ├── app/                      # App Router
│   │   ├── (auth)/               # Auth routes: login, signup, forgot-password, reset-password
│   │   ├── (dashboard)/          # Protected routes: dashboard, quiz, history, progress, settings
│   │   └── admin/                # Admin routes: analytics, generation, questions (Phase 2)
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (12 components)
│   │   ├── quiz/                 # QuizSelector, QuestionCard
│   │   ├── auth/                 # HomeRedirect
│   │   └── admin/                # Admin components (Phase 2)
│   ├── lib/
│   │   ├── auth/                 # Amplify config, AuthContext, ProtectedRoute
│   │   └── graphql/              # GraphQL client, queries, quiz-service
│   ├── types/                    # TypeScript type definitions
│   └── public/                   # Static assets
├── infrastructure/
│   └── terraform/
│       ├── main.tf               # Main config
│       ├── cognito.tf            # User auth
│       ├── appsync.tf            # GraphQL API
│       ├── dynamodb.tf           # Database tables
│       ├── lambda.tf             # Serverless functions
│       ├── schema.graphql        # GraphQL schema
│       └── email-templates/      # Custom email HTML
├── lambdas/
│   ├── quiz-selector/            # Question selection
│   ├── score-calculator/         # Scoring logic
│   └── custom-message/           # Cognito email customization
├── scripts/
│   ├── generate-questions.py    # Bedrock AI generation
│   └── seed-questions.py         # Batch DynamoDB upload
├── .github/
│   ├── copilot-instructions.md  # AI coding guidelines
│   └── nextjs-code-generation-instructions.md
├── README.md                     # This file
└── LICENSE
```

---

## 📚 Documentation

**Complete documentation available in [`docs/`](./docs/README.md)**:

- **[System Architecture](./docs/architecture/system-overview.md)** - Complete system design
- **[Deployment Guide](./docs/deployment/README.md)** - Step-by-step deployment
- **[Troubleshooting](./docs/deployment/troubleshooting.md)** - Common issues & solutions
- **[Authentication Flow](./docs/architecture/authentication.md)** - Cognito & session management
- **[Frontend Development](./docs/development/frontend-guide.md)** - Next.js coding standards
- **[GraphQL Integration](./docs/development/graphql-integration.md)** - Connecting to AppSync

---

## 🔐 Authentication & Authorization

### User Roles

- **Users** (default): Take quizzes, view progress, access history
- **Admins** (manual assignment): Advanced analytics, AI recommendations, question management (Phase 2)

### Creating Admin Users

```powershell
aws cognito-idp admin-add-user-to-group `
  --user-pool-id us-east-1_XNLodSkoE `
  --username admin@example.com `
  --group-name Admins `
  --region us-east-1
```

See [Authentication Guide](./docs/architecture/authentication.md) for details.

---

## 💰 Cost Estimation

### Development Environment (100 Active Users)

| Service    | Usage                          | Monthly Cost     |
| ---------- | ------------------------------ | ---------------- |
| Cognito    | <50 MAU                        | **Free**         |
| AppSync    | <250k requests                 | **Free**         |
| Lambda     | <1M invocations                | **Free**         |
| DynamoDB   | <25 GB storage, <200M requests | **Free**         |
| CloudWatch | ~100 MB logs                   | **~$0.50**       |
| Bedrock    | 50 questions generated         | **$0.75**        |
| **Total**  |                                | **~$1.25/month** |

### Production (500 Active Users)

| Service    | Usage                    | Monthly Cost   |
| ---------- | ------------------------ | -------------- |
| Cognito    | 500 MAU                  | Free           |
| AppSync    | 50k requests/month       | $0.20          |
| Lambda     | 100k invocations         | $0.30          |
| DynamoDB   | 150k reads/writes, 15 GB | $3-5           |
| CloudWatch | Logs + metrics           | $1-2           |
| Bedrock    | 100 questions/month      | $1.50          |
| **Total**  |                          | **$6-9/month** |

### Cost vs Traditional Setup

| Setup                        | Monthly Cost | Savings    |
| ---------------------------- | ------------ | ---------- |
| EC2 + RDS + Load Balancer    | $125-140     | -          |
| **This Serverless Platform** | **$6-9**     | **93-95%** |

**All costs assume AWS Free Tier usage where applicable.**

---

## 🧪 Testing

### Run Frontend Tests

```bash
cd frontend
npm test
```

### Test Lambda Functions Locally

```bash
# Install dependencies
cd lambdas/quiz-selector
npm install
npm test

# Test with sample payload
node index.js
```

### Test Infrastructure

```bash
cd infrastructure/terraform
terraform validate
terraform plan
```

See [Testing Guide](./docs/development/testing.md) for comprehensive testing strategies.

---

## 🚧 Current Status

**Phase 1: Core Quiz Platform** 🚧 (In Progress - November 2025)

### Completed ✅

- [x] Complete Terraform infrastructure (Cognito, DynamoDB, AppSync, Lambda)
- [x] Next.js 16 frontend with App Router + TypeScript
- [x] Authentication flow (signup, login, email verification, password reset)
- [x] Lambda functions (quiz-selector, score-calculator, custom-message)
- [x] GraphQL API with 4 resolvers
- [x] Custom email templates for Cognito (forgot password flow)
- [x] Domain-based question distribution
- [x] Server-side scoring (security-first design)
- [x] shadcn/ui component library (12 components)

### In Progress 🚧

- [ ] Quiz completion flow (submit and save results)
- [ ] Quiz history storage and display
- [ ] Progress tracking dashboard validation

### Phase 2: AI-Powered Analytics & Admin Panel 💡 (Planned)

- [ ] Advanced score analysis dashboard
- [ ] AI-powered study recommendations (Amazon Bedrock)
- [ ] Personalized suggestions based on weak domains
- [ ] Performance trends and insights visualization
- [ ] Admin panel for question management
- [ ] Automated question generation with Bedrock (Claude 3.5 Sonnet)
- [ ] Question approval workflow
- [ ] Automated weekly question generation (EventBridge)

### Future Enhancements 💡

- [ ] Spaced repetition algorithm
- [ ] Study notes and flashcards
- [ ] Community-contributed questions
- [ ] Leaderboard and achievements
- [ ] Mobile app (React Native)
- [ ] More exam types (Solutions Architect Professional, DevOps Engineer, Security Specialty)
- [ ] Practice labs with AWS Sandbox accounts

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow [Next.js code generation instructions](./.github/nextjs-code-generation-instructions.md)
- Write clear commit messages (see [Git commit guidelines](./.github/git-commit-messages-instructions.md))
- Add tests for new features
- Update documentation as needed
- Ensure all linting passes (`npm run lint`)

### Contribution Ideas

- **Frontend**: Dark mode, accessibility improvements, mobile responsiveness
- **Backend**: Additional exam types, question validation, analytics
- **DevOps**: CI/CD pipelines, automated testing, monitoring dashboards
- **Documentation**: Tutorials, video guides, architecture diagrams
- **Questions**: Add more practice questions for existing exam types

---

## 🆘 Getting Help

- **Documentation**: [docs/](./docs/README.md)
- **Troubleshooting**: [Troubleshooting Guide](./docs/deployment/troubleshooting.md)
- **GitHub Issues**: [Report a bug or request a feature](https://github.com/cristofima/AWS-Cert-Quiz-Platform/issues)
- **AWS Support**: [AWS Support Center](https://console.aws.amazon.com/support/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **AWS**: For providing excellent serverless services
- **Next.js Team**: For the amazing React framework
- **shadcn/ui**: For beautiful, accessible UI components
- **Terraform**: For infrastructure as code excellence
- **Anthropic**: For Claude 3.5 Sonnet AI model

---

## 📊 Project Metrics

- **AWS Services Used**: 7 (Cognito, AppSync, Lambda, DynamoDB, Bedrock, CloudWatch, IAM)
- **Lambda Functions**: 3
- **DynamoDB Tables**: 3
- **GraphQL Resolvers**: 4
- **Frontend Components**: 25+
- **Documentation Pages**: 15+

---

**Built with ❤️ for the AWS certification community**

---

## 👨‍💻 Author

**Cristopher Coronado** - AWS Community Builder

- **GitHub**: [@cristofima](https://github.com/cristofima)

---

## 🙏 Acknowledgments

- **AWS Community Builders Program** for support and resources
- **Vercel** for Next.js framework
- **shadcn** for beautiful UI components
- **HashiCorp** for Terraform

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/cristofima/AWS-Cert-Quiz-Platform?style=social)
![GitHub forks](https://img.shields.io/github/forks/cristofima/AWS-Cert-Quiz-Platform?style=social)
![GitHub issues](https://img.shields.io/github/issues/cristofima/AWS-Cert-Quiz-Platform)
![GitHub pull requests](https://img.shields.io/github/issues-pr/cristofima/AWS-Cert-Quiz-Platform)

---

## 🌟 Star History

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Built with ❤️ by the AWS Community**

_Serverless AWS certification prep platform. Perfect for learning AWS services while preparing for certification exams._
