import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sign In - AI Calendar Agent",
  description: "Sign in to AI Calendar Agent to manage your schedule",
};

/**
 * Authentication Layout
 *
 * This layout wraps all authentication pages (sign-in, sign-up, etc.)
 * It provides a clean, centered layout optimized for auth flows.
 *
 * Features:
 * - Centered content with responsive design
 * - Gradient background for visual appeal
 * - Minimal navigation to reduce distractions
 * - Mobile-friendly layout
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Header */}
          <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg" />
                <span className="text-xl font-bold text-gray-900">
                  AI Calendar Agent
                </span>
              </a>
              <a
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Home
              </a>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="w-full max-w-md">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
              <p>
                By signing in, you agree to our{" "}
                <a href="/terms" className="underline hover:text-gray-900">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline hover:text-gray-900">
                  Privacy Policy
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
