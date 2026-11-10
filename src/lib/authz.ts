import { getServerSession, type Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/**
 * Server-side role checks. Every API route calls `authorize` before touching
 * data, so access control holds even when the UI is bypassed.
 *
 * - read:        any signed-in role
 * - investigate: update events, add notes, open and update alert cases, ingest events
 * - manageRules: create, edit and delete detection rules
 */
export const PERMISSIONS = {
  read: ["admin", "analyst", "responder", "viewer"],
  investigate: ["admin", "analyst", "responder"],
  manageRules: ["admin", "analyst"],
} as const satisfies Record<string, readonly string[]>;

export type Permission = keyof typeof PERMISSIONS;

type AuthResult = { session: Session; error?: undefined } | { session?: undefined; error: NextResponse };

export async function authorize(permission: Permission): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const role = session.user.role ?? "";
  if (!(PERMISSIONS[permission] as readonly string[]).includes(role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session };
}
