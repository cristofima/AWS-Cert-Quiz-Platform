"use client";

import { useState, useMemo, useEffect } from "react";
import { resetPassword } from "aws-amplify/auth";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Configure Amplify on component mount
  useEffect(() => {
    configureAmplify();
  }, []);

  // Real-time form validation
  const isFormValid = useMemo(() => {
    return email.trim().length > 0 && email.includes("@");
  }, [email]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await resetPassword({
        username: email,
      });

      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.", {
        description: "The link will expire in 1 hour",
        duration: 5000,
      });
    } catch (err) {
      console.error("Password reset request error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send reset email. Please try again.";
      setError(errorMessage);
      toast.error("Failed to send reset email", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setError("");
    setIsLoading(true);

    try {
      await resetPassword({
        username: email,
      });

      toast.success("Email resent successfully!", {
        description: "Check your inbox",
      });
    } catch (err) {
      console.error("Resend email error:", err);
      toast.error("Failed to resend email", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {emailSent
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="space-y-2 text-center text-sm">
                <p className="text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-semibold">📧 Check your email!</p>
                    <p>
                      We&apos;ve sent a password reset link to{" "}
                      <span className="font-mono font-semibold">{email}</span>
                    </p>
                    <p className="text-sm">
                      Click the link in the email to reset your password. The
                      link will expire in 1 hour.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 border border-border rounded-md p-4 space-y-2">
                <p className="text-sm font-medium">📍 What to do next:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Open your email inbox</li>
                  <li>Look for an email from AWS Quiz Platform</li>
                  <li>Click the &quot;Reset Password&quot; button</li>
                  <li>Enter your new password</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? "Sending..." : "Resend Email"}
                </Button>

                <div className="text-center text-sm">
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center space-y-1 pt-2">
                <p>
                  💡 <strong>Tip:</strong> Check your spam folder if you
                  don&apos;t see the email
                </p>
                <p>
                  🔗 If you have the reset code, you can also{" "}
                  <Link
                    href="/reset-password"
                    className="text-primary hover:underline"
                  >
                    enter it manually here
                  </Link>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
