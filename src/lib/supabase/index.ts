// Re-export for convenience
// Use createClient from './client' for browser-side code
// Use createClient from './server' for server-side code (Server Components, Route Handlers)
// Use updateSession from './middleware' for middleware

export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'
export { updateSession } from './middleware'
