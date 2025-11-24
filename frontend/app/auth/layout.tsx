"use client";

import { useAuth } from "@/lib/auth/auth-context";

/**
 * Auth Layout - Simplified
 * 
 * Middleware handles:
 * - Redirecting authenticated users away from /auth/* routes to /portal/dashboard
 * - Server-side protection (cannot be bypassed)
 * 
 * This layout only:
 * - Shows loading state while auth is being verified
 * - Renders auth pages once verification is complete
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isInitialized } = useAuth();

  // Show loading state while authentication is being verified
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Middleware will redirect authenticated users
  // This layout just renders the auth pages
  return <>{children}</>;
}
