import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import type { AuthUser, UserType, PartnerSubType } from '@/types'

// -----------------------------------------------------
// SUPABASE INTEGRATION
// -----------------------------------------------------

// Check if Supabase is configured
const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Dynamic import to avoid errors when Supabase isn't configured
async function getSupabaseClient() {
  if (!isSupabaseConfigured) return null
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}

// -----------------------------------------------------
// IN-MEMORY FALLBACK (Demo Mode)
// Used when Supabase is not configured
// -----------------------------------------------------

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
      passwordHash: 'demo',
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

// -----------------------------------------------------
// USER DATA ACCESS FUNCTIONS
// These abstract over Supabase vs in-memory storage
// -----------------------------------------------------

/**
 * Get user by email - checks Supabase first, falls back to in-memory
 */
export async function getUserByEmail(
  email: string
): Promise<(AuthUser & { passwordHash?: string }) | null> {
  const normalizedEmail = email.toLowerCase()

  // Try Supabase first
  if (isSupabaseConfigured) {
    try {
      const supabase = await getSupabaseClient()
      if (supabase) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .single()

        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            name: data.name || '',
            avatarUrl: data.avatar_url,
            userType: data.user_type as UserType | null,
            partnerSubType: data.partner_sub_type as PartnerSubType | null,
            startupId: data.startup_id,
            onboardingComplete: data.onboarding_complete,
            createdAt: data.created_at,
          }
        }
      }
    } catch (error) {
      console.error('Supabase getUserByEmail error:', error)
    }
  }

  // Fallback to in-memory
  return usersDb.get(normalizedEmail) || null
}

/**
 * Synchronous version for callbacks that can't be async
 * Only uses in-memory store
 */
export function getUserByEmailSync(
  email: string
): (AuthUser & { passwordHash?: string }) | undefined {
  return usersDb.get(email.toLowerCase())
}

/**
 * Create a new user - in Supabase if configured, otherwise in-memory
 */
export async function createUser(data: {
  email: string
  name: string
  avatarUrl?: string
  passwordHash?: string
  provider?: string
}): Promise<AuthUser> {
  const normalizedEmail = data.email.toLowerCase()

  const user: AuthUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: normalizedEmail,
    name: data.name,
    avatarUrl: data.avatarUrl || null,
    userType: null,
    partnerSubType: null,
    startupId: null,
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
  }

  // Note: When using Supabase Auth, the user is created automatically
  // via the on_auth_user_created trigger. This function is mainly for
  // the in-memory fallback and credentials-based signup.

  // Add to in-memory store (for session lookup in callbacks)
  usersDb.set(normalizedEmail, { ...user, passwordHash: data.passwordHash })

  return user
}

/**
 * Update user type and partner sub-type
 */
export async function updateUserType(
  email: string,
  userType: UserType,
  partnerSubType?: PartnerSubType
): Promise<AuthUser | null> {
  const normalizedEmail = email.toLowerCase()

  // Update in Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const supabase = await getSupabaseClient()
      if (supabase) {
        const { data, error } = await supabase
          .from('users')
          .update({
            user_type: userType,
            partner_sub_type: partnerSubType || null,
          })
          .eq('email', normalizedEmail)
          .select()
          .single()

        if (!error && data) {
          // Also update in-memory cache
          const cachedUser = usersDb.get(normalizedEmail)
          if (cachedUser) {
            cachedUser.userType = userType
            cachedUser.partnerSubType = partnerSubType || null
            usersDb.set(normalizedEmail, cachedUser)
          }

          return {
            id: data.id,
            email: data.email,
            name: data.name || '',
            avatarUrl: data.avatar_url,
            userType: data.user_type as UserType,
            partnerSubType: data.partner_sub_type as PartnerSubType | null,
            startupId: data.startup_id,
            onboardingComplete: data.onboarding_complete,
            createdAt: data.created_at,
          }
        }
      }
    } catch (error) {
      console.error('Supabase updateUserType error:', error)
    }
  }

  // Fallback to in-memory
  const user = usersDb.get(normalizedEmail)
  if (!user) return null

  user.userType = userType
  user.partnerSubType = partnerSubType || null
  usersDb.set(normalizedEmail, user)

  return user
}

/**
 * Update user startup ID (for founders)
 */
export async function updateUserStartupId(
  email: string,
  startupId: string
): Promise<AuthUser | null> {
  const normalizedEmail = email.toLowerCase()

  // Update in Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const supabase = await getSupabaseClient()
      if (supabase) {
        const { data, error } = await supabase
          .from('users')
          .update({
            startup_id: startupId,
            onboarding_complete: true,
          })
          .eq('email', normalizedEmail)
          .select()
          .single()

        if (!error && data) {
          // Also update in-memory cache
          const cachedUser = usersDb.get(normalizedEmail)
          if (cachedUser) {
            cachedUser.startupId = startupId
            cachedUser.onboardingComplete = true
            usersDb.set(normalizedEmail, cachedUser)
          }

          return {
            id: data.id,
            email: data.email,
            name: data.name || '',
            avatarUrl: data.avatar_url,
            userType: data.user_type as UserType | null,
            partnerSubType: data.partner_sub_type as PartnerSubType | null,
            startupId: data.startup_id,
            onboardingComplete: data.onboarding_complete,
            createdAt: data.created_at,
          }
        }
      }
    } catch (error) {
      console.error('Supabase updateUserStartupId error:', error)
    }
  }

  // Fallback to in-memory
  const user = usersDb.get(normalizedEmail)
  if (!user) return null

  user.startupId = startupId
  user.onboardingComplete = true
  usersDb.set(normalizedEmail, user)

  return user
}

/**
 * Get user by ID - for Supabase integration
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  if (!isSupabaseConfigured) {
    // Search in-memory by ID
    for (const user of usersDb.values()) {
      if (user.id === userId) {
        return user
      }
    }
    return null
  }

  try {
    const supabase = await getSupabaseClient()
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        return {
          id: data.id,
          email: data.email,
          name: data.name || '',
          avatarUrl: data.avatar_url,
          userType: data.user_type as UserType | null,
          partnerSubType: data.partner_sub_type as PartnerSubType | null,
          startupId: data.startup_id,
          onboardingComplete: data.onboarding_complete,
          createdAt: data.created_at,
        }
      }
    }
  } catch (error) {
    console.error('Supabase getUserById error:', error)
  }

  return null
}

// -----------------------------------------------------
// NEXTAUTH CONFIGURATION
// -----------------------------------------------------

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

        const user = await getUserByEmail(email)

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
          const newUser = await createUser({
            email,
            name: email.split('@')[0],
            passwordHash: password,
          })
          // Auto-set as partner for sanctuary.vc emails
          await updateUserType(email, 'partner', 'startup_manager')
          const updated = await getUserByEmail(email)

          if (updated) {
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
        const existingUser = await getUserByEmail(user.email!)

        if (!existingUser) {
          // Create new user from OAuth
          // Note: With Supabase Auth, the trigger handles this automatically
          await createUser({
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
        // Use sync version to avoid async issues in callback
        const dbUser = getUserByEmailSync(token.email as string)
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

// -----------------------------------------------------
// TYPE AUGMENTATION
// -----------------------------------------------------

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
