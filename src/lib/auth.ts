import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions, getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import type { NextRequest } from "next/server"
import bcrypt from "bcryptjs"

export { getServerSession }

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error('Tidak ada akun yang terdaftar menggunakan email ini');
        }

        if (!user.password) {
          throw new Error('Email ini didaftarkan via metode lain (Google). Silakan masuk menggunakan Sign in with Google.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Kata sandi salah');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub as string;
        // Optionally pass role from db if needed
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! }
        });
        if (dbUser) {
          (session.user as any).role = dbUser.role;
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Polyfill for old Firebase auth checks
export async function requireAuth(request?: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user as typeof session.user & { id: string; role: string }
}

export async function requireAdmin(request?: NextRequest) {
  const user = await requireAuth(request)
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
  return user
}
