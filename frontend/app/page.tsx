import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  Cloud,
} from "lucide-react";
import { HomeRedirect } from "@/components/auth/HomeRedirect";

export default function Home() {
  return (
    <>
      <HomeRedirect />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Cloud className="w-4 h-4 mr-2" />
              AWS Community Project
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl">
              Master Your{" "}
              <span className="text-primary">AWS Certification</span> with Real
              Exam Practice
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl">
              Practice with 1,200+ quality exam questions designed to help you
              ace your AWS certification exams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" asChild>
                <Link href="/portal/quiz">Start Practice Quiz</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>1,200+ Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>4 Question Types</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>AI-Generated Content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Progress Tracking</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive features to help you prepare effectively for AWS
              certifications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <BookOpen className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Quality Questions</CardTitle>
                <CardDescription>
                  1,200+ AWS Developer Associate questions with detailed
                  explanations and reviewed by experts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-amber-500 mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Instant question loading with no delays. Start practicing
                  immediately and focus on learning.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-blue-600 mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your progress and data are protected with industry-standard
                  authentication and access control.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-green-600 mb-4" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Track your performance across domains. Identify weak areas and
                  focus your study efforts where needed most.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Cloud className="w-10 h-10 text-sky-600 mb-4" />
                <CardTitle>Always Available</CardTitle>
                <CardDescription>
                  Practice anytime, anywhere with reliable cloud-based
                  infrastructure. No setup required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Multiple Question Types</CardTitle>
                <CardDescription>
                  Practice with single-choice, multiple-choice, true/false, and
                  scenario-based questions with code snippets.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Exam Coverage Section */}
        <section className="container mx-auto px-4 py-20 bg-muted/50 rounded-lg">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AWS Associate-Level Certifications
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practice questions for all three AWS Associate-level
              certifications
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Developer Associate
                </CardTitle>
                <CardDescription>DVA-C02</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 400+ questions available</li>
                  <li>• Deployment & Security</li>
                  <li>• Development with AWS Services</li>
                  <li>• Refactoring & Monitoring</li>
                  <li>• Troubleshooting & Optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Solutions Architect Associate
                </CardTitle>
                <CardDescription>SAA-C03 • Coming Soon</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 400+ questions planned</li>
                  <li>• Design Resilient Architectures</li>
                  <li>• High-Performing Architectures</li>
                  <li>• Secure Applications & Data</li>
                  <li>• Cost-Optimized Architectures</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  SysOps Administrator Associate
                </CardTitle>
                <CardDescription>SOA-C02 • Coming Soon</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 400+ questions planned</li>
                  <li>• Monitoring, Logging & Remediation</li>
                  <li>• Reliability & Business Continuity</li>
                  <li>• Deployment, Provisioning & Automation</li>
                  <li>• Security & Compliance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Ace Your AWS Certification?
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                Join developers preparing for AWS certifications and start
                practicing today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/auth/signup">Get Started Free</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/90 hover:text-primary/90"
                  asChild
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground border-t">
          <p>
            Built with ❤️ by the AWS Community • Open Source on{" "}
            <a
              href="https://github.com"
              className="underline hover:text-primary"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
