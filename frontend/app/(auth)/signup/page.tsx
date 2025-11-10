"use client";

import { useState, useMemo, useEffect } from "react";
import {
  signUp,
  confirmSignUp,
  autoSignIn,
  signIn,
  resendSignUpCode,
} from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { configureAmplify } from "@/lib/auth/amplify-config";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Configure Amplify on component mount
  useEffect(() => {
    // Debug: Log configuration
    console.log("🔧 Configuring Amplify...");
    console.log("UserPoolId:", process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID);
    console.log("ClientId:", process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID);

    configureAmplify();

    console.log("✅ Amplify configured");
  }, []);

  // Real-time form validation
  const isSignupFormValid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      email.includes("@") &&
      password.length >= 8 &&
      password === confirmPassword &&
      /[A-Z]/.test(password) && // Has uppercase
      /[a-z]/.test(password) && // Has lowercase
      /[0-9]/.test(password) && // Has number
      /[^A-Za-z0-9]/.test(password) // Has special character
    );
  }, [name, email, password, confirmPassword]);

  const isConfirmationFormValid = useMemo(() => {
    return confirmationCode.trim().length === 6;
  }, [confirmationCode]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isSignupFormValid) {
      setError("Please fill in all fields correctly");
      return;
    }

    setIsLoading(true);

    try {
      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
          autoSignIn: true, // Enable auto sign-in after confirmation
        },
      });

      console.log("Signup next step:", nextStep);
      setNeedsConfirmation(true);
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign up. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validate code format
    if (
      confirmationCode.trim().length !== 6 ||
      !/^\d+$/.test(confirmationCode)
    ) {
      setError("Please enter a valid 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      // Confirm the signup
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode.trim(),
      });

      console.log("Sign up complete:", isSignUpComplete);

      // Try auto sign-in first
      try {
        await autoSignIn();
        console.log("Auto sign-in successful");
      } catch (autoSignInError) {
        console.log(
          "Auto sign-in failed, attempting manual sign-in:",
          autoSignInError
        );

        // Fallback: Manual sign-in with the saved password
        await signIn({
          username: email,
          password,
        });
        console.log("Manual sign-in successful");
      }

      console.log("Signup complete, refreshing user context...");

      // Refresh user context to update authentication state
      await refreshUser();

      console.log("User context refreshed, redirecting to quiz...");

      // Redirect to quiz page after successful login
      router.push("/quiz");
    } catch (err: unknown) {
      console.error("Confirmation error:", err);

      // Provide specific error messages
      const error = err as { name?: string; message?: string };
      if (error.name === "CodeMismatchException") {
        setError("Invalid code. Please check your email and try again.");
      } else if (error.name === "ExpiredCodeException") {
        setError("Code has expired. Please request a new one.");
      } else if (error.name === "LimitExceededException") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(
          error.message || "Failed to confirm account. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      await resendSignUpCode({
        username: email,
      });

      setSuccess("Verification code sent! Check your email.");
      setConfirmationCode(""); // Clear the input
    } catch (err: unknown) {
      console.error("Resend code error:", err);
      const error = err as { message?: string };
      setError(error.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {needsConfirmation ? "Verify Your Email" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {needsConfirmation
              ? `We sent a confirmation code to ${email}`
              : "Sign up for AWS Quiz Platform"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!needsConfirmation ? (
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Min 8 characters, include uppercase, lowercase, number, and
                  special character
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading || !isSignupFormValid}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleConfirmation} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Confirmation Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => {
                    // Only allow digits
                    const value = e.target.value.replace(/\D/g, "");
                    setConfirmationCode(value);
                  }}
                  placeholder="123456"
                  required
                  maxLength={6}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-center text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground">
                  Check your email for the 6-digit code
                </p>
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading || !isConfirmationFormValid}
              >
                {isLoading ? "Verifying..." : "Confirm Account"}
              </Button>

              <div className="space-y-2 text-center text-sm">
                <p className="text-muted-foreground">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? "Sending..." : "Resend code"}
                  </button>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
