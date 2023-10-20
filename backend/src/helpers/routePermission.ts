import { Response } from 'express'
import userModel from '@/modules/user/user.model'
import { UserRole, UserStatus } from '@/modules/user/user.enum'
import Cryptograph from '@/core/cryptograph'
import { UnauthorizedError } from '@/core/apiError'
import asyncHandler from './asyncHandler'

export default (role: UserRole) => {
  return asyncHandler(async (req, res, next): Promise<Response | void> => {
    const bearer = req.headers.authorization
    if (!bearer || !bearer.startsWith('Bearer ')) {
      throw new UnauthorizedError('Unauthorized')
    }

    const accessToken = bearer.split('Bearer ')[1].trim()

    const payload = await Cryptograph.verifyToken(accessToken)

    if (!payload) {
      throw new UnauthorizedError('Unauthorized')
    }

    const user = await userModel.findById(payload.id).select('-password').exec()

    if (!user) {
      throw new UnauthorizedError('Unauthorized')
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Unauthorized')
    }

    if (role > user.role) {
      throw new UnauthorizedError('Unauthorized')
    }

    req.user = user
    return next()
  })
}
