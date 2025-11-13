"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { Session } from "next-auth";

/**
 * Session Provider Wrapper
 *
 * This component wraps NextAuth's SessionProvider to make it work with
 * Next.js 13+ App Router and Server Components.
 *
 * It's a client component that accepts the session from a server component
 * and provides it to all child components via React Context.
 *
 * Usage in layout.tsx:
 * ```tsx
 * import { SessionProvider } from "@/components/providers/SessionProvider";
 * import { getCurrentSession } from "@/lib/auth";
 *
 * export default async function RootLayout({ children }) {
 *   const session = await getCurrentSession();
 *
 *   return (
 *     <html>
 *       <body>
 *         <SessionProvider session={session}>
 *           {children}
 *         </SessionProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * This allows:
 * - Server Components to pass session data
 * - Client Components to use useSession() hook
 * - Automatic session refresh
 * - Type-safe session access
 */
export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <NextAuthSessionProvider
      session={session}
      // Refetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
      // Refetch session when window regains focus
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
