/**
 * Profile Page Tests
 *
 * Tests for the user profile page component:
 * - Profile data fetching and display
 * - Form rendering
 * - User interactions (form submission, toggling work days)
 * - Loading states
 * - Error states
 * - Authentication redirect
 *
 * Note: These tests use React Testing Library for component testing
 */

import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";

// ============================================================================
// Mock Setup
// ============================================================================

// Mock next/navigation
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// ============================================================================
// Test Data
// ============================================================================

const mockProfileData = {
  user: {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    image: "https://example.com/avatar.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  preferences: {
    timezone: "America/New_York",
    workHoursStart: 9,
    workHoursEnd: 17,
    workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    breakDuration: 15,
  },
  workspace: {
    id: "workspace-123",
    name: "Test Workspace",
    slug: "test-workspace",
    type: "PERSONAL",
    plan: "free",
  },
  connectedAccounts: [
    {
      id: "account-123",
      provider: "google",
      accountId: "google-123",
    },
  ],
};

const mockSession = {
  user: {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    isActive: true,
  },
  expires: "2099-12-31",
};

// ============================================================================
// Helper Functions
// ============================================================================

function renderWithSession(
  component: React.ReactElement,
  session: any = mockSession,
) {
  return render(
    <SessionProvider session={session}>{component}</SessionProvider>,
  );
}

// ============================================================================
// Tests
// ============================================================================

describe("Profile Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication", () => {
    it("should redirect to signin when not authenticated", async () => {
      // Arrange
      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;

      // Act
      renderWithSession(<ProfilePage />, null);

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/signin");
      });
    });

    it("should not redirect when authenticated", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      });

      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;

      // Act
      renderWithSession(<ProfilePage />);

      // Assert
      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalledWith("/signin");
      });
    });
  });

  describe("Profile Data Loading", () => {
    it("should display loading state initially", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockProfileData,
                }),
              100,
            ),
          ),
      );

      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;

      // Act
      renderWithSession(<ProfilePage />);

      // Assert
      expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    });

    it("should fetch and display profile data", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      });

      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;

      // Act
      renderWithSession(<ProfilePage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        expect(screen.getByText("Test Workspace")).toBeInTheDocument();
      });

      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledWith("/api/v1/user/profile");
    });

    it("should display error message when fetch fails", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Failed to fetch profile" }),
      });

      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;

      // Act
      renderWithSession(<ProfilePage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Failed to load profile/i)).toBeInTheDocument();
      });
    });
  });

  describe("Profile Display", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      });
    });

    it("should display user information", async () => {
      // Arrange
      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;

      // Act
      renderWithSession(<ProfilePage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
      });
    });

    it("should display workspace information", async () => {
      // Arrange
      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;

      // Act
      renderWithSession(<ProfilePage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Test Workspace")).toBeInTheDocument();
        expect(screen.getByText(/Personal/i)).toBeInTheDocument();
        expect(screen.getByText(/Free/i)).toBeInTheDocument();
      });
    });

    it("should display connected accounts", async () => {
      // Arrange
      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;

      // Act
      renderWithSession(<ProfilePage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Google")).toBeInTheDocument();
        expect(screen.getByText("Connected")).toBeInTheDocument();
      });
    });

    it("should display preferences form with current values", async () => {
      // Arrange
      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;

      // Act
      renderWithSession(<ProfilePage />);

      // Assert
      await waitFor(() => {
        const nameInput = screen.getByLabelText(
          "Display Name",
        ) as HTMLInputElement;
        expect(nameInput.value).toBe("Test User");

        const timezoneSelect = screen.getByLabelText(
          "Timezone",
        ) as HTMLSelectElement;
        expect(timezoneSelect.value).toBe("America/New_York");
      });
    });
  });

  describe("Form Interactions", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { ...mockProfileData.user, name: "Updated Name" },
            preferences: mockProfileData.preferences,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        });
    });

    it("should allow updating display name", async () => {
      // Arrange
      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;
      renderWithSession(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
      });

      // Act
      const nameInput = screen.getByLabelText(
        "Display Name",
      ) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: "Updated Name" } });
      fireEvent.click(screen.getByText("Save Changes"));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("Profile updated successfully!"),
        ).toBeInTheDocument();
      });
    });

    it("should allow toggling work days", async () => {
      // Arrange
      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;
      renderWithSession(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("Mon")).toBeInTheDocument();
      });

      // Act - Toggle Friday off
      const fridayButton = screen.getByText("Fri");
      fireEvent.click(fridayButton);

      // Assert - Button should change style (check class)
      expect(fridayButton.className).not.toContain("bg-blue-600");
    });

    it("should disable submit button when no work days selected", async () => {
      // Arrange
      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;
      renderWithSession(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("Mon")).toBeInTheDocument();
      });

      // Act - Toggle all days off
      ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach((day) => {
        fireEvent.click(screen.getByText(day));
      });

      // Assert
      const submitButton = screen.getByText(
        "Save Changes",
      ) as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });

    it("should show error message on failed update", async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: "Update failed" }),
        });

      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;
      renderWithSession(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
      });

      // Act
      const nameInput = screen.getByLabelText("Display Name");
      fireEvent.change(nameInput, { target: { value: "New Name" } });
      fireEvent.click(screen.getByText("Save Changes"));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      });
    });

    it("should validate break duration min/max", async () => {
      // Arrange
      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;
      renderWithSession(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Break Duration/i)).toBeInTheDocument();
      });

      // Act
      const breakInput = screen.getByLabelText(
        /Break Duration/i,
      ) as HTMLInputElement;

      // Test min value
      expect(breakInput.min).toBe("0");

      // Test max value
      expect(breakInput.max).toBe("120");
    });

    it("should have all required form fields", async () => {
      // Arrange
      const ProfilePage = (await import("@/app/(dashboard)/profile/page"))
        .default;
      renderWithSession(<ProfilePage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Timezone")).toBeInTheDocument();
        expect(screen.getByLabelText("Work Hours Start")).toBeInTheDocument();
        expect(screen.getByLabelText("Work Hours End")).toBeInTheDocument();
        expect(screen.getByText("Work Days")).toBeInTheDocument();
        expect(screen.getByLabelText(/Break Duration/i)).toBeInTheDocument();
      });
    });
  });
});
