import { createHash, timingSafeEqual } from "node:crypto";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/** Absolute session lifetime. Inactivity logout (15 min) is handled client-side. */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

// Public demo accounts for the hosted demo. Their credentials are shown on the
// login page on purpose; real accounts live in the database with bcrypt hashes.
const demoUsers = [
  { id: "demo-1", name: "Security Analyst", email: "analyst@secureaudit.dev", password: "password123", role: "analyst" },
  { id: "demo-2", name: "Incident Responder", email: "responder@secureaudit.dev", password: "password123", role: "responder" },
  { id: "demo-3", name: "Admin User", email: "admin@secureaudit.dev", password: "password123", role: "admin" },
];

/** Constant-time string comparison (hash first so lengths always match). */
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password || email.length > 254 || password.length > 256) return null;

        const demoUser = demoUsers.find((u) => u.email === email);
        if (demoUser) {
          if (!safeEqual(demoUser.password, password)) return null;
          return { id: demoUser.id, name: demoUser.name, email: demoUser.email, role: demoUser.role };
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.role) session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
