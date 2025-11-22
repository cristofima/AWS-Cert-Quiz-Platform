"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Client-side only Toaster component wrapper
 * Prevents hydration errors by ensuring Toaster only renders on client
 */
export function Toaster() {
  return <SonnerToaster position="top-right" richColors />;
}
