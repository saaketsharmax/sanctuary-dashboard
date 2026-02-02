import { NextRequest, NextResponse } from 'next/server'
import { auth, updateUserType } from '@/lib/auth/auth-config'
import type { UserType, PartnerSubType } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { userType, partnerSubType } = body as {
      userType: UserType
      partnerSubType?: PartnerSubType
    }

    if (!userType || !['founder', 'partner'].includes(userType)) {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 })
    }

    if (userType === 'partner' && partnerSubType) {
      if (!['mentor', 'vc', 'startup_manager'].includes(partnerSubType)) {
        return NextResponse.json({ error: 'Invalid partner sub-type' }, { status: 400 })
      }
    }

    // Update user type - this now handles Supabase persistence if configured
    const updatedUser = await updateUserType(
      session.user.email,
      userType,
      userType === 'partner' ? partnerSubType : undefined
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        userType: updatedUser.userType,
        partnerSubType: updatedUser.partnerSubType,
      },
      redirectUrl: userType === 'founder' ? '/founder/dashboard' : '/partner/dashboard',
    })
  } catch (error) {
    console.error('Role selection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
