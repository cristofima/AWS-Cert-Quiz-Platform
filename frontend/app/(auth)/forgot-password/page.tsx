"use client";

import { useState, useMemo, useEffect } from "react";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"request" | "reset">("request");

  // Configure Amplify on component mount
  useEffect(() => {
    configureAmplify();
  }, []);

  // Real-time form validation
  const isRequestFormValid = useMemo(() => {
    return email.trim().length > 0 && email.includes("@");
  }, [email]);

  const isResetFormValid = useMemo(() => {
    return (
      code.trim().length === 6 &&
      newPassword.length >= 8 &&
      newPassword === confirmPassword &&
      /[A-Z]/.test(newPassword) && // Has uppercase
      /[a-z]/.test(newPassword) && // Has lowercase
      /[0-9]/.test(newPassword) && // Has number
      /[^A-Za-z0-9]/.test(newPassword) // Has special character
    );
  }, [code, newPassword, confirmPassword]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await resetPassword({
        username: email,
      });

      setSuccess(`Password reset code sent to ${email}`);
      setStep("reset");
    } catch (err) {
      console.error("Password reset request error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isResetFormValid) {
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

      setSuccess("Password reset successful! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Password reset confirmation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please check your code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {step === "request" ? "Reset Password" : "Enter New Password"}
          </CardTitle>
          <CardDescription>
            {step === "request"
              ? "Enter your email to receive a password reset code"
              : "Enter the code sent to your email and your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "request" ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
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
                disabled={isLoading || !isRequestFormValid}
              >
                {isLoading ? "Sending code..." : "Send Reset Code"}
              </Button>

              <div className="space-y-2 text-center text-sm">
                <p className="text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
                <p className="text-muted-foreground">
                  Already have a code?{" "}
                  <button
                    type="button"
                    onClick={() => setStep("reset")}
                    className="text-primary hover:underline"
                  >
                    Enter code
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirmReset} className="space-y-4">
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
                <p className="text-xs text-muted-foreground">
                  Min 8 characters, include uppercase, lowercase, number, and
                  special character
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium"
                >
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
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading || !isResetFormValid}
              >
                {isLoading ? "Resetting password..." : "Reset Password"}
              </Button>

              <div className="space-y-2 text-center text-sm">
                <p className="text-muted-foreground">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setCode("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-primary hover:underline"
                  >
                    Resend code
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
