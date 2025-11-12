import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

/**
 * Extended User type for authentication
 * Extends NextAuth's default User type with additional fields
 */
export interface ExtendedUser extends DefaultUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User roles for authorization
 */
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  PREMIUM = "premium",
}

/**
 * Extended Session type
 * Extends NextAuth's default Session type
 */
export interface ExtendedSession extends DefaultSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: UserRole;
    isActive?: boolean;
  };
  accessToken?: string;
  error?: string;
}

/**
 * Extended JWT type
 * Extends NextAuth's default JWT type
 */
export interface ExtendedJWT extends DefaultJWT {
  id?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
}

/**
 * OAuth Provider types
 */
export type OAuthProvider = "google" | "microsoft" | "github";

/**
 * Sign in response type
 */
export interface SignInResponse {
  error?: string;
  status: number;
  ok: boolean;
  url?: string | null;
}

/**
 * Auth error types for better error handling
 */
export enum AuthError {
  CONFIGURATION = "Configuration",
  ACCESS_DENIED = "AccessDenied",
  VERIFICATION = "Verification",
  CALLBACK = "Callback",
  OAUTH_CALLBACK = "OAuthCallback",
  OAUTH_ACCOUNT_NOT_LINKED = "OAuthAccountNotLinked",
  EMAIL_SIGNIN = "EmailSignin",
  SESSION_REQUIRED = "SessionRequired",
  CREDENTIAL_SIGNIN = "CredentialsSignin",
  DEFAULT = "Default",
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  blockDurationMs: number; // How long to block after max attempts
}

/**
 * Auth event types for logging
 */
export enum AuthEvent {
  SIGNIN_SUCCESS = "SIGNIN_SUCCESS",
  SIGNIN_FAILURE = "SIGNIN_FAILURE",
  SIGNOUT = "SIGNOUT",
  SESSION_CREATED = "SESSION_CREATED",
  SESSION_UPDATED = "SESSION_UPDATED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  TOKEN_REFRESH = "TOKEN_REFRESH",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  OAUTH_CALLBACK = "OAUTH_CALLBACK",
  OAUTH_ERROR = "OAUTH_ERROR",
}

/**
 * Auth event log structure
 */
export interface AuthEventLog {
  event: AuthEvent;
  userId?: string;
  email?: string;
  provider?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}
