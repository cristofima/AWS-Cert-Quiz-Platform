# 🔐 Authentication & Session Management

Complete guide to authentication, authorization, and session management in the AWS Certification Quiz Platform.

## 🎯 Overview

The platform uses **AWS Cognito User Pools** for authentication, integrated with **AWS Amplify** on the frontend for seamless session management.

## 🏗️ Authentication Architecture

```
┌──────────────────┐
│   User Browser   │
│                  │
│  localStorage:   │
│  - Access Token  │
│  - ID Token      │
│  - Refresh Token │
└────────┬─────────┘
         │
         │ JWT Tokens
         │
         ▼
┌─────────────────────┐
│   AWS Amplify Auth  │
│  (Client Library)   │
│                     │
│ Features:           │
│ • Auto token refresh│
│ • Session persist   │
│ • SSR support       │
└─────────┬───────────┘
          │
          │ API Calls
          │ (JWT in header)
          ▼
┌──────────────────────┐
│   AWS AppSync        │
│ @aws_cognito_user_   │
│    pools directive   │
│                      │
│ Validates:           │
│ • JWT signature      │
│ • Token expiration   │
│ • User existence     │
└──────────┬───────────┘
           │
           │ Authorized
           ▼
┌──────────────────────┐
│   Lambda Functions   │
│                      │
│ Access user context: │
│ • userId (sub)       │
│ • email              │
│ • cognito groups     │
└──────────────────────┘
```

## 🔑 Token Management

### Token Types

**1. Access Token**

- **Lifetime**: 1 hour (default)
- **Purpose**: API authorization
- **Contains**: User attributes, groups
- **Storage**: localStorage
- **Auto-refresh**: Yes (via Refresh Token)

**2. ID Token**

- **Lifetime**: 1 hour (default)
- **Purpose**: User identity
- **Contains**: Username, email, custom attributes
- **Storage**: localStorage
- **Used by**: Frontend to display user info

**3. Refresh Token**

- **Lifetime**: 30 days (default, configurable)
- **Purpose**: Renew access & ID tokens
- **Storage**: localStorage
- **Rotation**: Yes (on each use)

### Token Refresh Flow

```
1. Access Token Expires (after 1 hour)
   ↓
2. AWS Amplify detects expiration
   ↓
3. Amplify automatically calls Cognito refresh endpoint
   ↓
4. Cognito validates Refresh Token
   ↓
5. New Access Token + ID Token issued
   ↓
6. Tokens stored in localStorage
   ↓
7. API request retried with new token
```

**No user interaction required** ✅

### Token Storage

**Location**: `localStorage` (browser)

**Keys**:

```javascript
// Amplify stores tokens with these keys:
localStorage.getItem(
  `CognitoIdentityServiceProvider.${clientId}.${username}.accessToken`
);
localStorage.getItem(
  `CognitoIdentityServiceProvider.${clientId}.${username}.idToken`
);
localStorage.getItem(
  `CognitoIdentityServiceProvider.${clientId}.${username}.refreshToken`
);
```

**Security Considerations**:

- ✅ **HTTPS only**: Tokens transmitted over TLS
- ✅ **HttpOnly cookies** (optional): Can be configured for added security
- ⚠️ **XSS risk**: Tokens accessible via JavaScript (use CSP headers)
- ⚠️ **Not suitable for sensitive banking apps** (use HttpOnly cookies instead)

## 🔐 Authentication Flows

### 1. Signup Flow

```typescript
// frontend/app/(auth)/signup/page.tsx
import { signUp, confirmSignUp } from "aws-amplify/auth";

// Step 1: User submits signup form
const { userId, nextStep } = await signUp({
  username: email,
  password: password,
  options: {
    userAttributes: {
      email: email,
      name: name,
    },
  },
});

// Step 2: Cognito sends verification email
// (6-digit code to user's email)

// Step 3: User submits verification code
await confirmSignUp({
  username: email,
  confirmationCode: code,
});

// Step 4: User redirected to login
```

**Email Template**: Custom HTML template (see `infrastructure/terraform/email-templates/verification-email.html`)

### 2. Login Flow

```typescript
// frontend/app/(auth)/login/page.tsx
import { signIn } from "aws-amplify/auth";

const { isSignedIn, nextStep } = await signIn({
  username: email,
  password: password,
});

// If successful:
// - Tokens stored in localStorage
// - User redirected to /quiz
```

### 3. Logout Flow

```typescript
// frontend/components/layout/Sidebar.tsx
import { signOut } from "aws-amplify/auth";

await signOut();

// Results in:
// - Tokens removed from localStorage
// - Cognito session invalidated
// - User redirected to /login
```

### 4. Forgot Password Flow

```typescript
// frontend/app/(auth)/forgot-password/page.tsx
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";

// Step 1: Request reset code
await resetPassword({ username: email });

// Step 2: Cognito sends reset code via email
// (6-digit code, expires in 1 hour)

// Step 3: User submits code + new password
await confirmResetPassword({
  username: email,
  confirmationCode: code,
  newPassword: newPassword,
});

// Step 4: User redirected to login
```

## 👥 User Groups & Authorization

### Cognito User Groups

**1. Users (Default)**

- Automatically assigned on signup
- Can take quizzes
- Can view personal history/progress
- Cannot access admin panel

**2. Admins (Manual Assignment)**

- Must be manually added via AWS CLI
- Can access admin panel (`/admin/*` routes)
- Can manage questions
- Can view analytics

### Assigning Admin Role

```powershell
aws cognito-idp admin-add-user-to-group `
  --user-pool-id us-east-1_XNLodSkoE `
  --username admin@example.com `
  --group-name Admins `
  --region us-east-1
```

### Checking User Groups

```typescript
// frontend/lib/auth/auth-context.tsx
import { fetchAuthSession } from "aws-amplify/auth";

const session = await fetchAuthSession();
const groups = session.tokens?.accessToken?.payload["cognito:groups"] || [];
const isAdmin = groups.includes("Admins");
```

### Route Protection

```typescript
// frontend/app/admin/layout.tsx
"use client";

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.groups?.includes("Admins");

  if (!isAdmin) {
    redirect("/quiz");
  }

  return <>{children}</>;
}
```

## 🔄 Session Persistence

### How Sessions Persist

**Across Page Refreshes** ✅

- Tokens stored in localStorage
- Amplify reads tokens on page load
- User remains logged in

**Across Browser Restarts** ✅

- localStorage persists until cleared
- As long as Refresh Token is valid (<30 days)
- User remains logged in

**Across Tabs** ✅

- localStorage shared across tabs (same domain)
- User logged in all tabs simultaneously

**After Network Interruptions** ✅

- Tokens stored locally, no network needed
- API retries with cached tokens

### When Sessions DON'T Persist

**❌ Explicit Logout**

```typescript
await signOut(); // Clears localStorage
```

**❌ Browser Data Clear**

- User clears browser cache/data
- localStorage deleted

**❌ Refresh Token Expiration**

- After 30 days (default)
- User must re-login

**❌ Incognito/Private Mode Closure**

- localStorage cleared on window close

**❌ Password Reset/Change**

- Cognito invalidates all tokens
- User must re-login

## 🔍 Session Validation

### Frontend Session Check

```typescript
// frontend/lib/auth/auth-context.tsx
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";

const fetchUser = async () => {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser();

    // Fetch full session (includes tokens)
    const session = await fetchAuthSession();

    // Validate token exists and not expired
    if (session.tokens?.accessToken) {
      setUser({
        userId: currentUser.userId,
        username: currentUser.username,
        groups: session.tokens.accessToken.payload["cognito:groups"] || [],
      });
    }
  } catch (error) {
    // User not authenticated
    setUser(null);
  }
};
```

### Periodic Session Monitoring

```typescript
// Validate session every 5 minutes
useEffect(() => {
  fetchUser(); // Initial check

  const interval = setInterval(() => {
    fetchUser(); // Periodic check
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(interval);
}, []);
```

### GraphQL Request with JWT

```typescript
// frontend/lib/graphql/client.ts
import { fetchAuthSession } from "aws-amplify/auth";

const session = await fetchAuthSession();
const token = session.tokens?.idToken?.toString();

const response = await fetch(process.env.NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: token || "", // JWT included
  },
  body: JSON.stringify({ query, variables }),
});
```

## 🛡️ Security Best Practices

### 1. Password Policy

Configured in `infrastructure/terraform/cognito.tf`:

```hcl
password_policy {
  minimum_length    = 8
  require_lowercase = true
  require_uppercase = true
  require_numbers   = true
  require_symbols   = true
}
```

### 2. Account Recovery

**Email Verification**: Required on signup
**Password Reset**: Via email (6-digit code, 1-hour expiration)
**MFA**: Optional (user-configurable)

### 3. Session Security

**Token Rotation**: Refresh tokens rotated on use
**Token Expiration**: Short-lived access tokens (1 hour)
**Automatic Logout**: After 30 days (refresh token expiration)

### 4. API Authorization

**AppSync Directives**:

```graphql
type Query {
  getQuizQuestions(examType: String!, questionCount: Int!): [Question!]!
    @aws_cognito_user_pools # ✅ JWT validation
}
```

**Lambda Context**:

```typescript
// Lambda receives user context
const userId = event.requestContext.authorizer.claims.sub;
const email = event.requestContext.authorizer.claims.email;
const groups = event.requestContext.authorizer.claims["cognito:groups"];
```

## 🐛 Troubleshooting

### Issue: "User not authenticated" error

**Solutions**:

1. Check tokens exist in localStorage
2. Verify Cognito User Pool ID is correct in `.env.local`
3. Clear localStorage and re-login
4. Check token expiration (max 30 days)

### Issue: Session lost after page refresh

**Solutions**:

1. Verify `Amplify.configure()` called in `app/layout.tsx`
2. Check `ssr: true` in Amplify config
3. Verify localStorage not disabled in browser

### Issue: "Unauthorized" in API calls

**Solutions**:

1. Ensure JWT included in Authorization header
2. Verify AppSync API configured with Cognito User Pools
3. Check user exists in Cognito User Pool

### Issue: Refresh token expired

**Solution**:
User must re-login (30-day limit reached). Consider increasing refresh token expiration:

```hcl
# infrastructure/terraform/cognito.tf
resource "aws_cognito_user_pool" "main" {
  refresh_token_validity = 60 # Increase to 60 days
}
```

## 📚 Related Documentation

- [System Architecture](./system-overview.md)
- [Frontend Development](../development/frontend-guide.md)
- [Deployment Guide](../deployment/README.md)
- [Troubleshooting](../deployment/troubleshooting.md)
