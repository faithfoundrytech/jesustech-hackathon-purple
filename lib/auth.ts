import { auth, currentUser } from '@clerk/nextjs/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { logger } from '@/utils/logger'

/**
 * Authentication helper for API routes
 * Returns the authenticated user or throws a 401 response
 * @returns MongoDB user document for the authenticated user
 */
export async function getAuthenticatedUser() {
  try {
    // Get the Clerk user ID
    const { userId } = await auth()
    if (!userId) {
      throw new Response('Unauthorized', { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Find the user in the database by clerk ID
    let user = await User.findOne({ clerkId: userId })

    // If no user found by clerkId, try to find by email and create if needed
    if (!user) {
      const clerkUser = await currentUser()
      if (clerkUser?.emailAddresses?.[0]?.emailAddress) {
        // Try to match by email
        user = await User.findOne({
          email: clerkUser.emailAddresses[0].emailAddress,
        })

        // If found, update the clerkId
        if (user) {
          let wasUpdated = false
          if (user.clerkId !== userId) {
            user.clerkId = userId
            wasUpdated = true
          }
          if (user.status !== 'active') {
            user.status = 'active'
            wasUpdated = true
          }
          if (user.image !== clerkUser.imageUrl) {
            user.image = clerkUser.imageUrl
            wasUpdated = true
          }
          // Safely construct name with fallbacks
          const fullName =
            `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
            clerkUser.emailAddresses[0].emailAddress
          if (user.name !== fullName) {
            user.name = fullName
            wasUpdated = true
          }
          if (wasUpdated) {
            await user.save()
            logger.info('auth lib getAuthenticatedUser', 'User updated', {
              userId,
              wasUpdated,
            })
          }
        } else {
          // Create new user
          try {
            // Safely construct name with fallbacks
            const fullName =
              `${clerkUser.firstName || ''} ${
                clerkUser.lastName || ''
              }`.trim() || clerkUser.emailAddresses[0].emailAddress

            user = await User.create({
              clerkId: userId,
              email: clerkUser.emailAddresses[0].emailAddress,
              name: fullName,
              image: clerkUser.imageUrl || undefined,
              status: 'active',
            })
            logger.info('auth lib getAuthenticatedUser', 'New user created', {
              userId,
            })
          } catch (error) {
            logger.error(
              'auth lib getAuthenticatedUser',
              'Error creating user',
              {
                error,
                userId,
              }
            )
            // Try to find the user again in case of race condition
            user = await User.findOne({ clerkId: userId })
          }
        }
      } else {
        // Handle case where Clerk user has no email
        logger.error(
          'auth lib getAuthenticatedUser',
          'Clerk user has no email address',
          { userId }
        )
        throw new Response('User has no email address', { status: 400 })
      }
    }

    if (!user) {
      throw new Response('User not found', { status: 404 })
    }

    return user
  } catch (error) {
    // If error is already a Response, rethrow it
    if (error instanceof Response) {
      throw error
    }

    logger.error('auth lib getAuthenticatedUser', 'Unexpected error', error)
    throw new Response('Internal server error', { status: 500 })
  }
}

/**
 * Get user details by ID
 * @param userId MongoDB user ID
 * @returns User document or null if not found
 */
export async function getUserDetails(userId: string) {
  await dbConnect()
  return await User.findById(userId)
}

/**
 * Create or update user from Clerk data
 * @param clerkUserId Clerk user ID
 * @returns Created or updated user document
 */
export async function createOrUpdateUserFromClerk(clerkUserId: string) {
  const clerkUser = await currentUser()
  if (!clerkUser) {
    throw new Error('Clerk user not found')
  }

  await dbConnect()

  const userData = {
    clerkId: clerkUserId,
    email: clerkUser.emailAddresses?.[0]?.emailAddress,
    name: `${clerkUser.firstName} ${clerkUser.lastName}`,
    image: clerkUser.imageUrl,
    status: 'active' as const,
  }

  // Use upsert to create or update
  const user = await User.findOneAndUpdate({ clerkId: clerkUserId }, userData, {
    upsert: true,
    new: true,
  })

  return user
}

/**
 * Check if current user exists in database
 * @returns Current user or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return null
    }

    await dbConnect()

    // Find the user in the database by clerk ID
    let user = await User.findOne({ clerkId: userId })

    // If no user found by clerkId, try to find by email and create if needed
    if (!user) {
      const clerkUser = await currentUser()
      if (clerkUser?.emailAddresses?.[0]?.emailAddress) {
        // Try to match by email
        user = await User.findOne({
          email: clerkUser.emailAddresses[0].emailAddress,
        })

        // If found, update the clerkId
        if (user) {
          let wasUpdated = false
          if (user.clerkId !== userId) {
            user.clerkId = userId
            wasUpdated = true
          }
          if (user.status !== 'active') {
            user.status = 'active'
            wasUpdated = true
          }
          if (user.image !== clerkUser.imageUrl) {
            user.image = clerkUser.imageUrl
            wasUpdated = true
          }
          // Safely construct name with fallbacks
          const fullName =
            `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
            clerkUser.emailAddresses[0].emailAddress
          if (user.name !== fullName) {
            user.name = fullName
            wasUpdated = true
          }
          if (wasUpdated) {
            await user.save()
            logger.info('auth lib getCurrentUser', 'User updated', {
              userId,
              wasUpdated,
            })
          }
        } else {
          // Create new user
          try {
            // Safely construct name with fallbacks
            const fullName =
              `${clerkUser.firstName || ''} ${
                clerkUser.lastName || ''
              }`.trim() || clerkUser.emailAddresses[0].emailAddress

            user = await User.create({
              clerkId: userId,
              email: clerkUser.emailAddresses[0].emailAddress,
              name: fullName,
              image: clerkUser.imageUrl || undefined,
              status: 'active',
            })
            logger.info('auth lib getCurrentUser', 'New user created', {
              userId,
            })
          } catch (error) {
            logger.error('auth lib getCurrentUser', 'Error creating user', {
              error,
              userId,
            })
            // Try to find the user again in case of race condition
            user = await User.findOne({ clerkId: userId })
          }
        }
      } else {
        // Log warning but don't throw error for getCurrentUser (it should return null)
        logger.warn(
          'auth lib getCurrentUser',
          'Clerk user has no email address',
          { userId }
        )
      }
    }

    return user
  } catch (error) {
    logger.error('auth lib getCurrentUser', 'Error getting current user', error)
    return null
  }
}

/**
 * Delete user by MongoDB ID
 * @param userId MongoDB user ID
 * @returns Deleted user document or null if not found
 */
export async function deleteUser(userId: string) {
  await dbConnect()
  return await User.findByIdAndDelete(userId)
}

/**
 * Check if user can create a new chat (within monthly limits)
 * @param userId MongoDB user ID
 * @returns Promise<{ canChat: boolean, remainingChats: number }>
 */
export async function checkChatLimits(userId: string) {
  await dbConnect()

  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // If user has unlimited access, allow
  if (user.unlimited) {
    return { canChat: true, remainingChats: -1 } // -1 indicates unlimited
  }

  // Get current month and year
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // getMonth() returns 0-11

  // Check current month's usage
  const ChatUsage = (await import('@/models/ChatUsage')).default
  let usage = await ChatUsage.findOne({
    userId: userId,
    year: currentYear,
    month: currentMonth,
  })

  if (!usage) {
    // Create new usage record
    usage = await ChatUsage.create({
      userId: userId,
      year: currentYear,
      month: currentMonth,
      chatCount: 0,
    })
  }

  const remainingChats = Math.max(0, 3 - usage.chatCount)
  const canChat = usage.chatCount < 3

  return { canChat, remainingChats }
}

/**
 * Increment chat count for the current month
 * @param userId MongoDB user ID
 */
export async function incrementChatCount(userId: string) {
  await dbConnect()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const ChatUsage = (await import('@/models/ChatUsage')).default
  await ChatUsage.findOneAndUpdate(
    {
      userId: userId,
      year: currentYear,
      month: currentMonth,
    },
    {
      $inc: { chatCount: 1 },
    },
    {
      upsert: true,
    }
  )
}
