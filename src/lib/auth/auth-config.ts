import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import type { AuthUser, UserType, PartnerSubType } from '@/types'

// In-memory user store (replace with database in production)
// This extends the mock users with proper auth fields
const usersDb: Map<string, AuthUser & { passwordHash?: string }> = new Map([
  [
    'partner@sanctuary.vc',
    {
      id: 'user-partner-1',
      email: 'partner@sanctuary.vc',
      name: 'Alex Thompson',
      avatarUrl: null,
      userType: 'partner',
      partnerSubType: 'startup_manager',
      startupId: null,
      onboardingComplete: true,
      createdAt: '2025-01-01T00:00:00Z',
      passwordHash: 'demo', // In production, use bcrypt
    },
  ],
  [
    'sarah@techflow.ai',
    {
      id: 'user-founder-1',
      email: 'sarah@techflow.ai',
      name: 'Sarah Chen',
      avatarUrl: null,
      userType: 'founder',
      partnerSubType: null,
      startupId: 'startup-1',
      onboardingComplete: true,
      createdAt: '2025-01-15T00:00:00Z',
      passwordHash: 'demo',
    },
  ],
  [
    'emma@greencommute.co',
    {
      id: 'user-founder-2',
      email: 'emma@greencommute.co',
      name: 'Emma Johansson',
      avatarUrl: null,
      userType: 'founder',
      partnerSubType: null,
      startupId: 'startup-2',
      onboardingComplete: true,
      createdAt: '2025-01-20T00:00:00Z',
      passwordHash: 'demo',
    },
  ],
])

// Helper to get user by email
export function getUserByEmail(email: string): (AuthUser & { passwordHash?: string }) | undefined {
  return usersDb.get(email.toLowerCase())
}

// Helper to create new user
export function createUser(data: {
  email: string
  name: string
  avatarUrl?: string
  passwordHash?: string
  provider?: string
}): AuthUser {
  const user: AuthUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: data.email.toLowerCase(),
    name: data.name,
    avatarUrl: data.avatarUrl || null,
    userType: null, // Will be set during role selection
    partnerSubType: null,
    startupId: null,
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
  }

  usersDb.set(user.email, { ...user, passwordHash: data.passwordHash })
  return user
}

// Helper to update user type
export function updateUserType(
  email: string,
  userType: UserType,
  partnerSubType?: PartnerSubType
): AuthUser | null {
  const user = usersDb.get(email.toLowerCase())
  if (!user) return null

  user.userType = userType
  user.partnerSubType = partnerSubType || null
  usersDb.set(email.toLowerCase(), user)

  return user
}

// Helper to update user startup ID
export function updateUserStartupId(email: string, startupId: string): AuthUser | null {
  const user = usersDb.get(email.toLowerCase())
  if (!user) return null

  user.startupId = startupId
  user.onboardingComplete = true
  usersDb.set(email.toLowerCase(), user)

  return user
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = getUserByEmail(email)

        if (user) {
          // In production: compare hashed passwords with bcrypt
          if (user.passwordHash === password || user.passwordHash === 'demo') {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.avatarUrl,
              userType: user.userType,
              partnerSubType: user.partnerSubType,
              startupId: user.startupId,
              onboardingComplete: user.onboardingComplete,
            }
          }
        }

        // For demo: allow any @sanctuary.vc email
        if (email.endsWith('@sanctuary.vc')) {
          const newUser = createUser({
            email,
            name: email.split('@')[0],
            passwordHash: password,
          })
          // Auto-set as partner for sanctuary.vc emails
          updateUserType(email, 'partner', 'startup_manager')
          const updated = getUserByEmail(email)!

          return {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            image: updated.avatarUrl,
            userType: updated.userType,
            partnerSubType: updated.partnerSubType,
            startupId: updated.startupId,
            onboardingComplete: updated.onboardingComplete,
          }
        }

        return null
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/auth/role-select',
  },
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, check if user exists and create if not
      if (account?.provider === 'google' || account?.provider === 'github') {
        const existingUser = getUserByEmail(user.email!)

        if (!existingUser) {
          // Create new user from OAuth
          createUser({
            email: user.email!,
            name: user.name || user.email!.split('@')[0],
            avatarUrl: user.image || undefined,
            provider: account.provider,
          })
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.userType = user.userType
        token.partnerSubType = user.partnerSubType
        token.startupId = user.startupId
        token.onboardingComplete = user.onboardingComplete
      }

      // Handle session update (e.g., after role selection)
      if (trigger === 'update' && session) {
        token.userType = session.userType
        token.partnerSubType = session.partnerSubType
        token.startupId = session.startupId
        token.onboardingComplete = session.onboardingComplete
      }

      // Refresh user data from store
      if (token.email) {
        const dbUser = getUserByEmail(token.email as string)
        if (dbUser) {
          token.userType = dbUser.userType
          token.partnerSubType = dbUser.partnerSubType
          token.startupId = dbUser.startupId
          token.onboardingComplete = dbUser.onboardingComplete
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.userType = token.userType as UserType | null
        session.user.partnerSubType = token.partnerSubType as PartnerSubType | null
        session.user.startupId = token.startupId as string | null
        session.user.onboardingComplete = token.onboardingComplete as boolean
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})

// Type augmentation for next-auth
declare module 'next-auth' {
  interface User {
    userType?: UserType | null
    partnerSubType?: PartnerSubType | null
    startupId?: string | null
    onboardingComplete?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      userType: UserType | null
      partnerSubType: PartnerSubType | null
      startupId: string | null
      onboardingComplete: boolean
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string
    userType?: UserType | null
    partnerSubType?: PartnerSubType | null
    startupId?: string | null
    onboardingComplete?: boolean
  }
}
