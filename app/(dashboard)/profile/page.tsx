"use client";

/**
 * User Profile Page
 *
 * Features:
 * - Display user information (name, email, avatar)
 * - Display workspace information
 * - Show connected accounts (Google Calendar)
 * - Update user preferences (timezone, work hours, work days, break duration)
 * - Form validation with real-time feedback
 * - Success/error messages
 *
 * Security:
 * - Client-side validation before API calls
 * - API handles authorization (user can only edit own profile)
 */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

// ============================================================================
// Types
// ============================================================================

interface UserProfile {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
    updatedAt: string;
  };
  preferences: {
    timezone: string;
    workHoursStart: number;
    workHoursEnd: number;
    workDays: string[];
    breakDuration: number;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
    type: string;
    plan: string;
  };
  connectedAccounts: Array<{
    id: string;
    provider: string;
    accountId: string;
  }>;
}

interface FormData {
  name: string;
  timezone: string;
  workHoursStart: number;
  workHoursEnd: number;
  workDays: string[];
  breakDuration: number;
}

// ============================================================================
// Constants
// ============================================================================

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ============================================================================
// Component
// ============================================================================

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    timezone: "UTC",
    workHoursStart: 9,
    workHoursEnd: 17,
    workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    breakDuration: 15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Fetch profile data
  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/user/profile");

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);

      // Initialize form with current values
      setFormData({
        name: data.user.name || "",
        timezone: data.preferences.timezone,
        workHoursStart: data.preferences.workHoursStart,
        workHoursEnd: data.preferences.workHoursEnd,
        workDays: data.preferences.workDays,
        breakDuration: data.preferences.breakDuration,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({
        type: "error",
        text: "Failed to load profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      // Refresh profile data
      await fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleWorkDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter((d) => d !== day)
        : [...prev.workDays, day],
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-600">Failed to load profile</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      {/* User Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Your account details and workspace information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {profile.user.image && (
                <img
                  src={profile.user.image}
                  alt={profile.user.name || "User"}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">
                  {profile.user.name || "No name set"}
                </p>
                <p className="text-sm text-gray-600">{profile.user.email}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Workspace</h3>
              <p className="text-sm">
                <span className="text-gray-600">Name:</span>{" "}
                {profile.workspace.name}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Type:</span>{" "}
                {profile.workspace.type.charAt(0) +
                  profile.workspace.type.slice(1).toLowerCase()}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Plan:</span>{" "}
                {profile.workspace.plan.charAt(0).toUpperCase() +
                  profile.workspace.plan.slice(1)}
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Connected Accounts</h3>
              {profile.connectedAccounts.length > 0 ? (
                <ul className="space-y-2">
                  {profile.connectedAccounts.map((account) => (
                    <li
                      key={account.id}
                      className="flex items-center space-x-2"
                    >
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {account.provider.charAt(0).toUpperCase() +
                          account.provider.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">Connected</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No accounts connected</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your work schedule and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>

            {/* Timezone */}
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                id="timezone"
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                className="mt-1"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </Select>
            </div>

            {/* Work Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workHoursStart">Work Hours Start</Label>
                <Select
                  id="workHoursStart"
                  value={formData.workHoursStart.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workHoursStart: parseInt(e.target.value),
                    })
                  }
                  className="mt-1"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}:00
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="workHoursEnd">Work Hours End</Label>
                <Select
                  id="workHoursEnd"
                  value={formData.workHoursEnd.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workHoursEnd: parseInt(e.target.value),
                    })
                  }
                  className="mt-1"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}:00
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Work Days */}
            <div>
              <Label>Work Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWorkDay(day)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.workDays.includes(day)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Select at least one work day
              </p>
            </div>

            {/* Break Duration */}
            <div>
              <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                min="0"
                max="120"
                value={formData.breakDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    breakDuration: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                Time between scheduled tasks (0-120 minutes)
              </p>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || formData.workDays.length === 0}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
