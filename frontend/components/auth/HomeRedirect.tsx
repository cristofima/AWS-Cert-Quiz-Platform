"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export function HomeRedirect() {
  const router = useRouter();
  const { user, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    // Only redirect after initialization is complete to avoid race conditions
    if (isInitialized && user) {
      // If user is authenticated, redirect to dashboard
      router.replace("/portal/dashboard");
    }
  }, [user, isInitialized, router]);

  return null;
}
