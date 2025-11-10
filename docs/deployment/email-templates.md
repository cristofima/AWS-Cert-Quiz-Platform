# 📧 Email Templates Configuration

Custom email templates for AWS Cognito User Pool notifications.

## 📋 Overview

The platform uses three custom HTML email templates for user communications:

1. **Verification Email** - Sent when users sign up
2. **Admin Invitation Email** - Sent when admins create new users
3. **Password Reset Email** - Sent when users request password reset (⚠️ uses default AWS template due to Terraform limitation)

## 📁 Template Files

All templates located in: `infrastructure/terraform/email-templates/`

### 1. verification-email.html

**Subject**: "Verify your AWS Quiz Platform account"
**Trigger**: User signs up via `/signup`
**Variables**: `{####}` = 6-digit verification code
**Expiration**: 24 hours

**Features**:

- AWS brand colors (Orange #FF9900, Blue #232F3E)
- Responsive design (mobile-friendly)
- Large, readable code display (32px, monospace)
- Clear instructions
- Security notice

**Preview**:

```
┌──────────────────────────────────┐
│   AWS Quiz Platform              │ ← Orange gradient header
├──────────────────────────────────┤
│ Verify Your Email Address       │
│                                  │
│ Your verification code is:       │
│                                  │
│   ┌─────────────┐                │
│   │  1 2 3 4 5 6│                │ ← Highlighted code
│   └─────────────┘                │
│                                  │
│ ⏱ Expires in 24 hours            │
└──────────────────────────────────┘
```

### 2. admin-invite-email.html

**Subject**: "Welcome to AWS Quiz Platform - Set your password"
**Trigger**: Admin creates user via AWS CLI/Console
**Variables**: `{username}`, `{####}` = temporary password
**Expiration**: 7 days

**Features**:

- Welcome message with username
- "Sign In Now" CTA button (orange)
- List of available features
- Password change reminder
- Link to admin guide

**Preview**:

```
┌──────────────────────────────────┐
│ 🎉 Welcome to AWS Quiz Platform  │ ← Dark blue gradient
├──────────────────────────────────┤
│ Your Admin Account is Ready      │
│                                  │
│ Username: admin@example.com      │
│ Temporary password: Pass123!     │
│                                  │
│   ┌────────────────┐             │
│   │  Sign In Now   │             │ ← Orange CTA button
│   └────────────────┘             │
│                                  │
│ ⚠️ Change password on first login│
└──────────────────────────────────┘
```

### 3. password-reset-email.html

**Status**: ⚠️ **Cannot be customized via Terraform** (AWS Cognito limitation)
**Workaround**: Uses AWS Cognito default template

**Subject**: "Your verification code" (AWS default)
**Trigger**: User requests password reset at `/forgot-password`
**Variables**: `{####}` = 6-digit reset code
**Expiration**: 1 hour

**To customize** (manual process):

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Select User Pool: `cert-quiz-dev`
3. Messaging → Message customizations
4. Paste contents of `password-reset-email.html`
5. Save changes

## 🚀 Deployment

### Terraform Configuration

Templates are deployed via `infrastructure/terraform/cognito-email-templates.tf`:

```hcl
resource "aws_cognito_user_pool" "main" {
  # Verification email template
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Verify your AWS Quiz Platform account"
    email_message        = file("${path.module}/email-templates/verification-email.html")
  }

  # Admin invitation template
  admin_create_user_config {
    invite_message_template {
      email_subject = "Welcome to AWS Quiz Platform - Set your password"
      email_message = file("${path.module}/email-templates/admin-invite-email.html")
    }
  }
}
```

### Deploy Templates

```powershell
cd infrastructure/terraform
terraform apply -auto-approve
```

**⚠️ Note**: Password reset template must be configured manually in AWS Console.

## 🧪 Testing

### Test Verification Email

1. **Start frontend**:

```powershell
cd frontend
npm run dev
```

2. **Sign up new user**:

- Go to http://localhost:3000/signup
- Enter email + password
- Submit form

3. **Check email**:

- Verify custom template appears
- 6-digit code displayed
- AWS branding present

4. **Confirm account**:

- Enter verification code
- Should redirect to `/quiz`

### Test Admin Invitation Email

1. **Create admin user**:

```powershell
aws cognito-idp admin-create-user `
  --user-pool-id us-east-1_XNLodSkoE `
  --username testadmin@example.com `
  --user-attributes Name=email,Value=testadmin@example.com `
  --temporary-password "TempPass123!" `
  --region us-east-1
```

2. **Check email**:

- Verify custom invitation template
- "Sign In Now" button present
- Temporary password displayed

3. **Login**:

- Go to http://localhost:3000/login
- Enter credentials
- Should prompt password change on first login

### Test Password Reset Email

1. **Request reset**:

- Go to http://localhost:3000/forgot-password
- Enter email
- Click "Send Reset Code"

2. **Check email**:

- ⚠️ Will show AWS default template (not custom)
- Subject: "Your verification code"
- 6-digit reset code present

3. **Reset password**:

- Enter code + new password
- Click "Reset Password"
- Should redirect to `/login`

## 🎨 Customization

### Modify Templates

Edit HTML files in `infrastructure/terraform/email-templates/`:

1. **Update brand colors**:

```html
<!-- Change AWS orange to your brand -->
<div
  style="background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);"
></div>
```

2. **Update logo**:

```html
<!-- Add your logo URL -->
<img
  src="https://your-cdn.com/logo.png"
  alt="Your Logo"
  style="height: 32px;"
/>
```

3. **Update company name**:

- Find/replace "AWS Quiz Platform" with your app name

4. **Redeploy**:

```powershell
terraform apply -auto-approve
```

### Email Variables

Cognito supports these template variables:

| Variable       | Description                | Templates Using |
| -------------- | -------------------------- | --------------- |
| `{####}`       | Verification/reset code    | All             |
| `{username}`   | User's username            | Admin invite    |
| `{##Verify##}` | Verification link (unused) | None            |

## 🔒 Security Considerations

### 1. Code Expiration

- **Verification code**: 24 hours
- **Password reset code**: 1 hour
- **Temporary password**: 7 days

### 2. Rate Limiting

Cognito enforces rate limits:

- Max 5 verification emails per 24 hours per user
- Max 5 password reset requests per hour per user

### 3. Email Spoofing Protection

- **SPF**: AWS SES automatically adds SPF records
- **DKIM**: Enabled by default for `@` sender domain
- **DMARC**: Recommended to add DMARC record to your domain

### 4. Sensitive Data

⚠️ **Never include** in emails:

- Full passwords (only temporary passwords)
- Credit card numbers
- Social security numbers
- Account balances

## 🐛 Troubleshooting

### Issue: Emails not received

**Solutions**:

1. Check spam/junk folder
2. Verify email is valid in Cognito:

```powershell
aws cognito-idp admin-get-user `
  --user-pool-id us-east-1_XNLodSkoE `
  --username user@example.com
```

3. Check SES sending limits:

```powershell
aws ses get-send-quota --region us-east-1
```

4. Verify SES is not in sandbox mode (production only)

### Issue: Email shows HTML code instead of rendering

**Cause**: Email client doesn't support HTML emails

**Solution**: Use plain text fallback (not currently implemented)

### Issue: Template changes not applied

**Solutions**:

1. Verify Terraform apply succeeded:

```powershell
terraform apply -auto-approve
```

2. Check User Pool configuration:

```powershell
aws cognito-idp describe-user-pool `
  --user-pool-id us-east-1_XNLodSkoE
```

3. Clear Cognito cache (wait 5 minutes)

### Issue: Password reset email not customized

**Known Limitation**: Terraform cannot customize password reset emails.

**Workaround**: Manual configuration in AWS Console (see above)

## 📊 Monitoring

### CloudWatch Logs

Monitor email delivery:

```powershell
aws logs tail /aws/cognito/cert-quiz-dev --follow --region us-east-1
```

### Metrics to Track

- **Delivery rate**: % of emails successfully delivered
- **Open rate**: % of emails opened (requires tracking pixels)
- **Click rate**: % of CTA button clicks
- **Bounce rate**: % of emails bounced (invalid addresses)

### SES Dashboard

View detailed metrics in [SES Console](https://console.aws.amazon.com/ses/):

- Sends
- Deliveries
- Opens
- Clicks
- Bounces
- Complaints

## 🔗 Related Documentation

- [Authentication Flow](../../docs/architecture/authentication.md)
- [Cognito Configuration](../../docs/deployment/README.md#amazon-cognito)
- [Troubleshooting](../../docs/deployment/troubleshooting.md)

## 🆘 Advanced: CustomMessage Lambda Trigger

For full email customization (including password reset), use Lambda trigger:

**1. Create Lambda function**:

```typescript
// customMessageHandler.ts
export const handler = async (event) => {
  if (event.triggerSource === "CustomMessage_ForgotPassword") {
    event.response.emailSubject = "Reset your AWS Quiz Platform password";
    event.response.emailMessage = `<html>...</html>`; // Custom HTML
  }
  return event;
};
```

**2. Add trigger to Cognito**:

```hcl
resource "aws_cognito_user_pool" "main" {
  lambda_config {
    custom_message = aws_lambda_function.custom_message.arn
  }
}
```

**3. Grant permissions**:

```hcl
resource "aws_lambda_permission" "allow_cognito" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.custom_message.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}
```

See [AWS Cognito Lambda Triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html) for more details.
