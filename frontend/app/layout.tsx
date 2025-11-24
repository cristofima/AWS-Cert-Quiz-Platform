import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AmplifyInitializer } from "@/lib/auth/amplify-initializer";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AWS Certification Quiz Platform | Practice for Developer Associate",
  description:
    "Master your AWS certification with 1,200+ quality questions. Built with Next.js 16, Terraform, AppSync, and Amazon Bedrock. Production-ready serverless architecture.",
  keywords: [
    "AWS",
    "certification",
    "quiz",
    "Developer Associate",
    "serverless",
    "Next.js",
    "Bedrock",
  ],
  authors: [{ name: "AWS Community" }],
  openGraph: {
    title: "AWS Certification Quiz Platform",
    description: "Practice with 1,200+ AWS Developer Associate questions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AmplifyInitializer>
          <AuthProvider>{children}</AuthProvider>
        </AmplifyInitializer>
        <Toaster />
      </body>
    </html>
  );
}
