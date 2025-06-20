import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/landing',
  '/products(.*)',
  '/product(.*)',
  '/api/products(.*)',
  '/api/featured(.*)',
  '/api/chat/messages',
  '/submit-problem',
  '/submit-product',
  // Static assets and Next.js internals
  '/favicon.ico',
  '/_next(.*)',
  '/api/webhook(.*)',
  '/api/submit/dev/opportunity(.*)',
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth()

  // If the user is not logged in and tries to access a protected route, redirect to landing
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/landing', req.url))
  }

  // For all other cases, continue
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
