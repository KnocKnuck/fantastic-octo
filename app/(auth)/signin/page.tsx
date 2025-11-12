"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Sign In Page
 *
 * Features:
 * - Google OAuth sign-in button
 * - Error handling and display
 * - Loading states
 * - Redirect after successful sign-in
 * - Security: CSRF protection (built into NextAuth)
 *
 * TODO: Add Microsoft OAuth when provider is configured
 */
export default function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  /**
   * Handle OAuth sign-in
   * Uses NextAuth's signIn function which handles:
   * - CSRF token generation
   * - OAuth state parameter
   * - Redirect flow
   * - Error handling
   */
  const handleSignIn = async (provider: string) => {
    try {
      setIsLoading(provider);
      await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsLoading(null);
    }
  };

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = (error: string | null): string | null => {
    if (!error) return null;

    const errorMessages: Record<string, string> = {
      OAuthSignin: "Error connecting to authentication provider. Please try again.",
      OAuthCallback: "Error during authentication. Please try again.",
      OAuthCreateAccount: "Could not create account. Please try again.",
      EmailCreateAccount: "Could not create account. Please try again.",
      Callback: "Authentication failed. Please try again.",
      OAuthAccountNotLinked:
        "This email is already associated with another account. Please sign in with your original provider.",
      EmailSignin: "Unable to send sign-in email. Please try again.",
      CredentialsSignin: "Invalid credentials. Please try again.",
      SessionRequired: "Please sign in to access this page.",
      Default: "An error occurred. Please try again.",
    };

    return errorMessages[error] || errorMessages.Default;
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="text-gray-600">
          Sign in to access your AI Calendar Agent
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
          role="alert"
        >
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* Sign-in Buttons */}
      <div className="space-y-4">
        {/* Google Sign-in */}
        <button
          onClick={() => handleSignIn("google")}
          disabled={isLoading !== null}
          className="w-full flex items-center justify-center space-x-3 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading === "google" ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* TODO: Add Microsoft sign-in when configured */}
        {/* <button
          onClick={() => handleSignIn("microsoft")}
          disabled={isLoading !== null}
          className="w-full flex items-center justify-center space-x-3 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading === "microsoft" ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-600" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#f25022" d="M0 0h11.377v11.372H0z" />
                <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z" />
                <path fill="#7fba00" d="M0 12.628h11.377V24H0z" />
                <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z" />
              </svg>
              <span>Continue with Microsoft</span>
            </>
          )}
        </button> */}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">
            Secure authentication
          </span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              Your authentication is secured with industry-standard OAuth 2.0 protocol.
              We never store your password.
            </p>
          </div>
        </div>
      </div>

      {/* Rate Limiting Notice */}
      <p className="text-xs text-center text-gray-500">
        For security, sign-in attempts are limited to 5 per 15 minutes
      </p>
    </div>
  );
}
