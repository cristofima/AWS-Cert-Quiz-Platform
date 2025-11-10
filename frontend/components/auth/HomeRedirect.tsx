"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export function HomeRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // If user is authenticated, redirect to quiz
      console.log("User authenticated, redirecting to quiz...");
      router.push("/quiz");
    }
  }, [user, isLoading, router]);

  return null;
}
