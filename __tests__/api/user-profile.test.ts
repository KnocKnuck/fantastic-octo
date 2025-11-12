/**
 * User Profile API Tests
 *
 * Tests for user profile GET and PATCH endpoints:
 * - GET /api/v1/user/profile
 * - PATCH /api/v1/user/profile
 * - DELETE /api/v1/user/delete
 *
 * Coverage:
 * - Authentication requirements
 * - Authorization (users can only access their own profile)
 * - Input validation
 * - Profile retrieval
 * - Profile updates
 * - Account deletion
 * - Error handling
 *
 * Note: These tests use mocked Prisma client and NextAuth session
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ============================================================================
// Mock Setup
// ============================================================================

// Mock NextAuth
const mockRequireAuth = jest.fn();
jest.mock("@/lib/auth", () => ({
  requireAuth: () => mockRequireAuth(),
}));

// Mock Prisma
const mockPrismaUser = {
  findUnique: jest.fn(),
  update: jest.fn(),
};

const mockPrismaSession = {
  deleteMany: jest.fn(),
};

const mockPrismaAuditLog = {
  create: jest.fn(),
};

jest.mock("@/lib/infrastructure/database", () => ({
  prisma: {
    user: mockPrismaUser,
    session: mockPrismaSession,
    auditLog: mockPrismaAuditLog,
  },
}));

// Mock authorization
jest.mock("@/lib/security/authorization", () => ({
  authorizeResourceAccess: jest.fn((session: any, resource: any) => ({
    authorized: session?.user?.id === resource?.id,
    error: session?.user?.id !== resource?.id ? "Forbidden" : undefined,
    errorCode:
      session?.user?.id !== resource?.id ? "RESOURCE_ACCESS_DENIED" : undefined,
  })),
}));

// ============================================================================
// Test Data
// ============================================================================

const mockSession = {
  user: {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    isActive: true,
  },
  accessToken: "mock-token",
};

const mockUserProfile = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  image: "https://example.com/avatar.jpg",
  timezone: "America/New_York",
  workHoursStart: 9,
  workHoursEnd: 17,
  workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  breakDuration: 15,
  workspaceId: "workspace-123",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  workspace: {
    id: "workspace-123",
    name: "Test Workspace",
    slug: "test-workspace",
    type: "PERSONAL",
    plan: "free",
  },
  accounts: [
    {
      id: "account-123",
      provider: "google",
      providerAccountId: "google-123",
    },
  ],
};

// ============================================================================
// Tests
// ============================================================================

describe("User Profile API", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe("GET /api/v1/user/profile", () => {
    it("should return user profile when authenticated", async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue(mockSession);
      mockPrismaUser.findUnique.mockResolvedValue(mockUserProfile);

      // Act
      const { GET } = await import("@/app/api/v1/user/profile/route");
      const request = new Request("http://localhost:3000/api/v1/user/profile");
      const response = await GET(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe("user-123");
      expect(data.user.email).toBe("test@example.com");
      expect(data.preferences).toBeDefined();
      expect(data.preferences.timezone).toBe("America/New_York");
      expect(data.workspace).toBeDefined();
      expect(data.connectedAccounts).toBeDefined();
      expect(data.connectedAccounts).toHaveLength(1);
    });

    it("should return 401 when not authenticated", async () => {
      // Arrange
      mockRequireAuth.mockRejectedValue(
        new Error("Unauthorized - No session found"),
      );

      // Act
      const { GET } = await import("@/app/api/v1/user/profile/route");
      const request = new Request("http://localhost:3000/api/v1/user/profile");
      const response = await GET(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
      expect(data.code).toBe("UNAUTHORIZED");
    });

    it("should return 404 when user not found", async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue(mockSession);
      mockPrismaUser.findUnique.mockResolvedValue(null);

      // Act
      const { GET } = await import("@/app/api/v1/user/profile/route");
      const request = new Request("http://localhost:3000/api/v1/user/profile");
      const response = await GET(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
      expect(data.code).toBe("USER_NOT_FOUND");
    });
  });

  describe("PATCH /api/v1/user/profile", () => {
    it("should update user profile with valid data", async () => {
      // Arrange
      const updateData = {
        name: "Updated Name",
        timezone: "Europe/London",
        workHoursStart: 8,
        workHoursEnd: 16,
        workDays: ["Mon", "Tue", "Wed", "Thu"],
        breakDuration: 30,
      };

      mockRequireAuth.mockResolvedValue(mockSession);
      mockPrismaUser.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        workspaceId: "workspace-123",
      });
      mockPrismaUser.update.mockResolvedValue({
        ...mockUserProfile,
        ...updateData,
        updatedAt: new Date(),
      });
      mockPrismaAuditLog.create.mockResolvedValue({});

      // Act
      const { PATCH } = await import("@/app/api/v1/user/profile/route");
      const request = new Request("http://localhost:3000/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const response = await PATCH(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.name).toBe("Updated Name");
      expect(data.preferences).toBeDefined();
      expect(data.preferences.timezone).toBe("Europe/London");
      expect(data.preferences.workHoursStart).toBe(8);
      expect(data.preferences.workHoursEnd).toBe(16);
      expect(mockPrismaAuditLog.create).toHaveBeenCalled();
    });

    it("should return 400 with invalid work hours", async () => {
      // Arrange
      const updateData = {
        workHoursStart: 18,
        workHoursEnd: 9, // End before start
      };

      mockRequireAuth.mockResolvedValue(mockSession);

      // Act
      const { PATCH } = await import("@/app/api/v1/user/profile/route");
      const request = new Request("http://localhost:3000/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const response = await PATCH(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 with invalid work days", async () => {
      // Arrange
      const updateData = {
        workDays: ["Monday"], // Invalid format (should be 'Mon')
      };

      mockRequireAuth.mockResolvedValue(mockSession);

      // Act
      const { PATCH } = await import("@/app/api/v1/user/profile/route");
      const request = new Request("http://localhost:3000/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const response = await PATCH(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should return 401 when not authenticated", async () => {
      // Arrange
      mockRequireAuth.mockRejectedValue(
        new Error("Unauthorized - No session found"),
      );

      // Act
      const { PATCH } = await import("@/app/api/v1/user/profile/route");
      const request = new Request("http://localhost:3000/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });
      const response = await PATCH(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.code).toBe("UNAUTHORIZED");
    });

    it("should return 404 when user not found", async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue(mockSession);
      mockPrismaUser.findUnique.mockResolvedValue(null);

      // Act
      const { PATCH } = await import("@/app/api/v1/user/profile/route");
      const request = new Request("http://localhost:3000/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });
      const response = await PATCH(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });
  });

  describe("DELETE /api/v1/user/delete", () => {
    it("should delete user account with valid confirmation", async () => {
      // Arrange
      const deleteData = {
        confirmationToken: "valid-token-123",
        email: "test@example.com",
      };

      mockRequireAuth.mockResolvedValue(mockSession);
      mockPrismaUser.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        workspaceId: "workspace-123",
        name: "Test User",
      });
      mockPrismaSession.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaAuditLog.create.mockResolvedValue({});

      // Act
      const { DELETE } = await import("@/app/api/v1/user/delete/route");
      const request = new Request("http://localhost:3000/api/v1/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });
      const response = await DELETE(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Account deleted successfully");
      expect(mockPrismaSession.deleteMany).toHaveBeenCalled();
      expect(mockPrismaAuditLog.create).toHaveBeenCalled();
    });

    it("should return 400 when email does not match", async () => {
      // Arrange
      const deleteData = {
        confirmationToken: "valid-token-123",
        email: "wrong@example.com", // Different from session email
      };

      mockRequireAuth.mockResolvedValue(mockSession);

      // Act
      const { DELETE } = await import("@/app/api/v1/user/delete/route");
      const request = new Request("http://localhost:3000/api/v1/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });
      const response = await DELETE(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe("Email does not match authenticated user");
      expect(data.code).toBe("EMAIL_MISMATCH");
    });

    it("should return 400 with missing confirmation token", async () => {
      // Arrange
      const deleteData = {
        confirmationToken: "",
        email: "test@example.com",
      };

      mockRequireAuth.mockResolvedValue(mockSession);

      // Act
      const { DELETE } = await import("@/app/api/v1/user/delete/route");
      const request = new Request("http://localhost:3000/api/v1/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });
      const response = await DELETE(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should return 401 when not authenticated", async () => {
      // Arrange
      mockRequireAuth.mockRejectedValue(
        new Error("Unauthorized - No session found"),
      );

      // Act
      const { DELETE } = await import("@/app/api/v1/user/delete/route");
      const request = new Request("http://localhost:3000/api/v1/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationToken: "token",
          email: "test@example.com",
        }),
      });
      const response = await DELETE(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.code).toBe("UNAUTHORIZED");
    });
  });

  describe("POST /api/v1/user/delete/request", () => {
    it("should request account deletion and return token in development", async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      mockRequireAuth.mockResolvedValue(mockSession);

      // Act
      const { POST } = await import("@/app/api/v1/user/delete/route");
      const request = new Request(
        "http://localhost:3000/api/v1/user/delete/request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe("Confirmation email sent");
      expect(data.developmentToken).toBeDefined();

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });

    it("should not return token in production", async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      mockRequireAuth.mockResolvedValue(mockSession);

      // Act
      const { POST } = await import("@/app/api/v1/user/delete/route");
      const request = new Request(
        "http://localhost:3000/api/v1/user/delete/request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request as any);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.developmentToken).toBeUndefined();

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe("Validation Schemas", () => {
  it("should validate profile update schema", () => {
    const {
      UpdateUserProfileAndPreferencesSchema,
    } = require("@/lib/security/validation");

    // Valid data
    const validData = {
      name: "John Doe",
      timezone: "America/New_York",
      workHoursStart: 9,
      workHoursEnd: 17,
      workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      breakDuration: 15,
    };

    const result = UpdateUserProfileAndPreferencesSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid work hours", () => {
    const {
      UpdateUserProfileAndPreferencesSchema,
    } = require("@/lib/security/validation");

    const invalidData = {
      workHoursStart: 18,
      workHoursEnd: 9, // End before start
    };

    const result = UpdateUserProfileAndPreferencesSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should validate delete account schema", () => {
    const { DeleteAccountSchema } = require("@/lib/security/validation");

    const validData = {
      confirmationToken: "token-123",
      email: "test@example.com",
    };

    const result = DeleteAccountSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
