"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { confirmResetPassword } from "aws-amplify/auth";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get code and email from URL query params
  const codeFromUrl = searchParams.get("code") || "";
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState(codeFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Configure Amplify on component mount
  useEffect(() => {
    configureAmplify();
  }, []);

  // Auto-fill from URL params
  useEffect(() => {
    if (codeFromUrl) {
      setCode(codeFromUrl);
    }
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [codeFromUrl, emailFromUrl]);

  // Real-time form validation
  const isFormValid = useMemo(() => {
    return (
      email.trim().length > 0 &&
      email.includes("@") &&
      code.trim().length === 6 &&
      newPassword.length >= 8 &&
      newPassword === confirmPassword &&
      /[A-Z]/.test(newPassword) && // Has uppercase
      /[a-z]/.test(newPassword) && // Has lowercase
      /[0-9]/.test(newPassword) && // Has number
      /[^A-Za-z0-9]/.test(newPassword) // Has special character
    );
  }, [email, code, newPassword, confirmPassword]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Please fill in all fields correctly");
      return;
    }

    setIsLoading(true);

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });

      toast.success("Password reset successful!", {
        description: "Redirecting to login...",
        duration: 3000,
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Password reset confirmation error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please check your code and try again.";
      setError(errorMessage);
      toast.error("Failed to reset password", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Password</CardTitle>
          <CardDescription>
            Enter the verification code and your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
              <label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                className="w-full px-3 py-2 border rounded-md font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Check your email for the verification code
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li
                    className={
                      newPassword.length >= 8
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(newPassword)
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }
                  >
                    One uppercase letter
                  </li>
                  <li
                    className={
                      /[a-z]/.test(newPassword)
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }
                  >
                    One lowercase letter
                  </li>
                  <li
                    className={
                      /[0-9]/.test(newPassword)
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }
                  >
                    One number
                  </li>
                  <li
                    className={
                      /[^A-Za-z0-9]/.test(newPassword)
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }
                  >
                    One special character
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Resetting password..." : "Reset Password"}
            </Button>

            <div className="space-y-2 text-center text-sm">
              <p className="text-muted-foreground">
                Don&apos;t have a code?{" "}
                <Link
                  href="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Request new code
                </Link>
              </p>
              <p className="text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">Loading...</div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
