import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { getCurrentSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AI Calendar Agent - Plan your day without thinking",
  description: "Connect your Google or Outlook calendar, add your tasks, and let our AI create the perfect schedule — without stress or overload.",
  keywords: ["AI", "calendar", "scheduling", "productivity", "task management"],
  authors: [{ name: "Joseph Hani" }],
  openGraph: {
    title: "AI Calendar Agent - Plan your day without thinking",
    description: "Smart scheduling tool that automatically plans your tasks inside your Google or Outlook Calendar.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get session on the server for optimal performance
  const session = await getCurrentSession();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
