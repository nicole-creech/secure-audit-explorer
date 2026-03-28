import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const demoUsers = [
  {
    id: "demo-1",
    name: "Security Analyst",
    email: "analyst@secureaudit.dev",
    password: "password123",
    role: "analyst",
  },
  {
    id: "demo-2",
    name: "Incident Responder",
    email: "responder@secureaudit.dev",
    password: "password123",
    role: "responder",
  },
  {
    id: "demo-3",
    name: "Admin User",
    email: "admin@secureaudit.dev",
    password: "password123",
    role: "admin",
  },
];

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize called with:", {
          email: credentials?.email,
          passwordProvided: Boolean(credentials?.password),
        });

        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        // 1) Demo fallback so login works right now
        const demoUser = demoUsers.find(
          (user) => user.email.toLowerCase() === normalizedEmail
        );

        if (demoUser) {
          const validDemoPassword = demoUser.password === credentials.password;

          console.log("Matched demo user:", demoUser.email);
          console.log("Demo password valid:", validDemoPassword);

          if (!validDemoPassword) return null;

          return {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
          };
        }

        // 2) Database auth path
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          console.log("No database user found for:", normalizedEmail);
          return null;
        }

        console.log("Database user found:", {
          id: user.id,
          email: user.email,
          hasPassword: Boolean(user.password),
          role: user.role,
        });

        if (!user.password) {
          console.log("User exists but password field is empty");
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.password);

        console.log("Database password valid:", valid);

        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };