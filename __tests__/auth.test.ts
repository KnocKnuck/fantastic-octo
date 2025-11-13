/**
 * Authentication Utilities Tests
 *
 * Tests for rate limiting and type definitions in the authentication system.
 *
 * Coverage:
 * - Rate limiting functionality
 * - Type definitions
 * - Authentication enums
 *
 * Note: Integration tests for session management (getCurrentSession, requireAuth, etc.)
 * will be in separate e2e tests due to the complexity of mocking NextAuth.js with Jest.
 * Those tests require a running Next.js server and are better suited for Playwright/Cypress.
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { checkRateLimit } from "@/lib/auth-options";
import { UserRole, AuthEvent, AuthError } from "@/types/auth";

describe("Authentication System", () => {
  describe("Type Definitions", () => {
    it("should have correct UserRole enum values", () => {
      expect(UserRole.USER).toBe("user");
      expect(UserRole.ADMIN).toBe("admin");
      expect(UserRole.PREMIUM).toBe("premium");
    });

    it("should have correct AuthEvent enum values", () => {
      expect(AuthEvent.SIGNIN_SUCCESS).toBe("SIGNIN_SUCCESS");
      expect(AuthEvent.SIGNIN_FAILURE).toBe("SIGNIN_FAILURE");
      expect(AuthEvent.SIGNOUT).toBe("SIGNOUT");
      expect(AuthEvent.SESSION_CREATED).toBe("SESSION_CREATED");
      expect(AuthEvent.SESSION_UPDATED).toBe("SESSION_UPDATED");
      expect(AuthEvent.SESSION_EXPIRED).toBe("SESSION_EXPIRED");
      expect(AuthEvent.TOKEN_REFRESH).toBe("TOKEN_REFRESH");
      expect(AuthEvent.RATE_LIMIT_EXCEEDED).toBe("RATE_LIMIT_EXCEEDED");
      expect(AuthEvent.OAUTH_CALLBACK).toBe("OAUTH_CALLBACK");
      expect(AuthEvent.OAUTH_ERROR).toBe("OAUTH_ERROR");
    });

    it("should have correct AuthError enum values", () => {
      expect(AuthError.CONFIGURATION).toBe("Configuration");
      expect(AuthError.ACCESS_DENIED).toBe("AccessDenied");
      expect(AuthError.VERIFICATION).toBe("Verification");
      expect(AuthError.CALLBACK).toBe("Callback");
      expect(AuthError.OAUTH_CALLBACK).toBe("OAuthCallback");
      expect(AuthError.OAUTH_ACCOUNT_NOT_LINKED).toBe("OAuthAccountNotLinked");
      expect(AuthError.EMAIL_SIGNIN).toBe("EmailSignin");
      expect(AuthError.SESSION_REQUIRED).toBe("SessionRequired");
      expect(AuthError.CREDENTIAL_SIGNIN).toBe("CredentialsSignin");
      expect(AuthError.DEFAULT).toBe("Default");
    });
  });

  describe("Rate Limiting", () => {
    // Use unique emails for each test to avoid interference
    let testCounter = 0;

    beforeEach(() => {
      testCounter++;
    });

    it("should allow first request", () => {
      const email = `test-${testCounter}-1@example.com`;
      const result = checkRateLimit(email);
      expect(result.allowed).toBe(true);
    });

    it("should allow requests within limit (5 attempts)", () => {
      const email = `test-${testCounter}-2@example.com`;

      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(email);
        expect(result.allowed).toBe(true);
      }
    });

    it("should block requests after exceeding limit", () => {
      const email = `test-${testCounter}-3@example.com`;

      // Make 5 allowed attempts
      for (let i = 0; i < 5; i++) {
        checkRateLimit(email);
      }

      // 6th attempt should be blocked
      const result = checkRateLimit(email);
      expect(result.allowed).toBe(false);
      expect(result.resetTime).toBeDefined();
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it("should provide reset time when blocked", () => {
      const email = `test-${testCounter}-4@example.com`;

      // Exceed limit
      for (let i = 0; i < 6; i++) {
        checkRateLimit(email);
      }

      const result = checkRateLimit(email);
      expect(result.allowed).toBe(false);
      expect(result.resetTime).toBeDefined();

      // Reset time should be approximately 30 minutes in the future
      const expectedResetTime = Date.now() + 30 * 60 * 1000;
      const timeDiff = Math.abs((result.resetTime || 0) - expectedResetTime);
      expect(timeDiff).toBeLessThan(5000); // Within 5 second tolerance
    });

    it("should track rate limits per identifier independently", () => {
      const email1 = `test-${testCounter}-5a@example.com`;
      const email2 = `test-${testCounter}-5b@example.com`;

      // Use up all attempts for email1
      for (let i = 0; i < 6; i++) {
        checkRateLimit(email1);
      }

      // email1 should be blocked
      const result1 = checkRateLimit(email1);
      expect(result1.allowed).toBe(false);

      // email2 should still be allowed
      const result2 = checkRateLimit(email2);
      expect(result2.allowed).toBe(true);
    });

    it("should continue to block while blocked period is active", () => {
      const email = `test-${testCounter}-6@example.com`;

      // Exceed limit
      for (let i = 0; i < 6; i++) {
        checkRateLimit(email);
      }

      // Should still be blocked on subsequent attempts
      const result1 = checkRateLimit(email);
      expect(result1.allowed).toBe(false);

      const result2 = checkRateLimit(email);
      expect(result2.allowed).toBe(false);

      // Reset times should be consistent
      expect(result2.resetTime).toBe(result1.resetTime);
    });
  });

  describe("Security Configuration", () => {
    it("should enforce rate limiting configuration", () => {
      // Test that rate limit is 5 attempts
      const email = `security-test-${Date.now()}@example.com`;

      // First 5 should pass
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(email);
        expect(result.allowed).toBe(true);
      }

      // 6th should fail
      const result = checkRateLimit(email);
      expect(result.allowed).toBe(false);
    });
  });
});
