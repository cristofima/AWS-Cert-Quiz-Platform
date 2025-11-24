/**
 * Dashboard Layout
 * 
 * Provides the app shell (navigation, user info, logout) for the dashboard page.
 * Client-side authentication verification with fallback to login.
 */
"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/AppShell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isInitialized, user } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated after initialization
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      console.log("Dashboard: No user found, redirecting to login");
      router.replace("/auth/login");
    }
  }, [isInitialized, isLoading, user, router]);

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

  // Don't render if no user (will redirect via useEffect)
  if (!user) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
