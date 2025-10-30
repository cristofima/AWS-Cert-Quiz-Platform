# AWS Certification Quiz Platform 🎓

> Serverless AWS certification exam prep platform built with Next.js 16, Terraform, and AWS AppSync.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Terraform](https://img.shields.io/badge/Terraform-1.9+-purple)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com/)

---

## 🎯 Project Overview

A serverless quiz platform for AWS certification exam preparation. Built with Next.js 16 and Terraform, featuring pre-seeded questions for fast loading times (<100ms).

### Key Features

- ✅ **1,200+ Pre-seeded Questions** across AWS Developer Associate domains
- ✅ **Multiple Question Types**: Single-choice, multiple-choice, true/false, scenario-based
- ✅ **Real-time Scoring** with detailed explanations
- ✅ **Progress Tracking** with domain-level analytics
- ✅ **Lightning Fast**: <100ms quiz loading with DynamoDB
- ✅ **Cost-Optimized**: $7.30/month for development environment

---

## 🏗️ Architecture

```
Next.js 16 (Amplify) → Cognito → AppSync GraphQL → Lambda → DynamoDB
```

### AWS Services Used

- **Frontend**: Next.js 16 (App Router with TypeScript)
- **Authentication**: Amazon Cognito (User Pools + Groups)
- **API**: AWS AppSync (GraphQL)
- **Compute**: AWS Lambda (Node.js 20)
- **Database**: Amazon DynamoDB (3 core tables: Questions, QuizSessions, UserProgress)
- **IaC**: Terraform 1.9+ (AWS Provider 5.x)

---

## 📊 Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 4+
- **Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod
- **State**: React Context + TanStack Query

### Backend (Infrastructure as Code)

- **IaC**: Terraform 1.9+
- **AWS Provider**: ~> 5.0 (latest stable)
- **Region**: us-east-1 (N. Virginia)
- **State Management**: S3 backend with encryption

### Lambda Functions

| Function           | Runtime    | Memory | Purpose                                  |
| ------------------ | ---------- | ------ | ---------------------------------------- |
| `quiz-selector`    | Node.js 20 | 512 MB | Random question selection                |
| `score-calculator` | Node.js 20 | 512 MB | Score calculation (multi-answer support) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.x or later
- **Terraform**: 1.9 or later
- **AWS CLI**: Configured with credentials
- **AWS Account**: With permissions for Cognito, AppSync, Lambda, DynamoDB

### 1. Clone the Repository

```bash
git clone https://github.com/cristofima/AWS-Cert-Quiz-Platform.git
cd AWS-Cert-Quiz-Platform
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Lambda dependencies
cd lambdas/quiz-selector && npm install && cd ../..
cd lambdas/score-calculator && npm install && cd ../..
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
# (You'll get these after Terraform deployment)
```

### 4. Deploy Infrastructure with Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Deploy infrastructure
terraform apply -auto-approve

# Note the outputs (you'll need these for .env.local)
terraform output
```

### 5. Seed Initial Question Bank

```bash
# Run question seeding script
python scripts/seed-questions.py \
  --exam-type "Developer-Associate" \
  --count 1200 \
  --region us-east-1

# This will store 1,200 pre-generated questions in DynamoDB
```

### 6. Start Development Server

```bash
# Return to project root
cd ../..

# Start Next.js dev server
npm run dev

# Open http://localhost:3000
```

---

## 📁 Project Structure

```
aws-cert-quiz-platform/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                   # Login/Signup pages
│   ├── (dashboard)/              # Quiz, progress, history
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── quiz/                     # Quiz-specific components
│   └── auth/                     # Auth components
├── lib/
│   ├── amplify-config.ts         # Amplify configuration
│   ├── graphql/                  # GraphQL queries/mutations
│   └── utils.ts
├── infrastructure/
│   └── terraform/
│       ├── main.tf               # Main Terraform config
│       ├── cognito.tf            # Cognito User Pools
│       ├── appsync.tf            # AppSync GraphQL API
│       ├── dynamodb.tf           # DynamoDB tables
│       ├── lambda.tf             # Lambda functions
│       └── outputs.tf            # Terraform outputs
├── lambdas/
│   ├── quiz-selector/            # Question selection logic
│   └── score-calculator/         # Scoring logic
├── scripts/
│   └── seed-questions.py         # Question seeding script
├── .env.local                    # Environment variables (not in repo)
├── .env.example                  # Environment template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔐 Authentication & Authorization

### User Roles

- **Users**: Can take quizzes, view progress, access history
- **Admins**: (Future) Question management capabilities

### Creating Users

Users can sign up through the Cognito-powered authentication flow integrated in the Next.js app.

---

## 💰 Cost Estimation

### Development Environment

| Service   | Usage                          | Monthly Cost     |
| --------- | ------------------------------ | ---------------- |
| Cognito   | <50 MAU                        | Free             |
| AppSync   | <250k requests                 | Free             |
| Lambda    | <1M invocations                | Free             |
| DynamoDB  | <25 GB storage, <200M requests | Free (Free Tier) |
| **Total** |                                | **~$7.30/month** |

### Production (500 Active Users)

| Service     | Usage                    | Monthly Cost    |
| ----------- | ------------------------ | --------------- |
| AWS Amplify | 5 GB bandwidth           | $2-5            |
| Cognito     | 500 MAU                  | Free            |
| AppSync     | 50k requests             | $0.20           |
| Lambda      | 42k invocations          | $0.30           |
| DynamoDB    | 150k reads/writes, 15 GB | $3-5            |
| CloudWatch  | Logs + metrics           | $1-3            |
| **Total**   |                          | **$7-14/month** |

### Cost vs Traditional Setup

| Setup                        | Monthly Cost | Savings    |
| ---------------------------- | ------------ | ---------- |
| EC2 + RDS + ELB              | $125-140     | -          |
| **This Serverless Platform** | **$7-14**    | **90-95%** |

---

## 📖 API Documentation

- **GraphQL Schema**: See `infrastructure/terraform/appsync.tf`
- **Lambda Functions**: Each function has inline JSDoc/docstrings

---

## 🚧 Current Status

### Completed ✅

- [x] Repository structure and documentation
- [x] Next.js 16 frontend setup with shadcn/ui components
- [x] Landing page with AWS branding
- [x] TypeScript types for Question, QuizSession, UserProgress
- [x] Route structure (auth, dashboard, admin placeholders)

### In Progress 🚧

- [ ] Terraform infrastructure (Cognito, DynamoDB, AppSync, Lambda)
- [ ] Lambda functions (quiz-selector, score-calculator)
- [ ] GraphQL schema and resolvers
- [ ] Quiz UI components (QuizSelector, QuestionCard)
- [ ] Question seeding script

### Future Enhancements 💡

- [ ] Admin panel for question management
- [ ] AI-powered question generation (Amazon Bedrock)
- [ ] Advanced analytics dashboard
- [ ] Spaced repetition algorithm
- [ ] Mobile app (React Native)
- [ ] More exam types (Solutions Architect, SysOps)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Ideas

- Implement missing Lambda functions
- Add more exam types (Solutions Architect, SysOps, etc.)
- Improve question quality and coverage
- Add frontend features (dark mode, accessibility)
- Write tests (unit and E2E)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
