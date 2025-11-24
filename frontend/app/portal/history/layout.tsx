/**
 * History Layout
 * 
 * Provides the app shell (navigation, user info, logout) for history pages.
 * Middleware handles authentication, this just ensures auth context is loaded.
 */
"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/AppShell";

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isInitialized, user } = useAuth();

  // Show loading state while authentication is being verified
  if (!isInitialized || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
