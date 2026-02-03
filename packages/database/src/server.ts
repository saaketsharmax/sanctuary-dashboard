// Server client must be created in each Next.js app
// because it depends on next/headers
// This file exports a factory function that apps can use

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'

export { createSupabaseServerClient }

// Apps should create their own server client like this:
//
// import { createSupabaseServerClient } from '@sanctuary/database/server'
// import { cookies } from 'next/headers'
//
// export async function createClient() {
//   const cookieStore = await cookies()
//   return createSupabaseServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() { return cookieStore.getAll() },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set(name, value, options))
//         },
//       },
//     }
//   )
// }
