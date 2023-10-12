import { Request, Response, NextFunction } from 'express'
import userModel from '@/modules/user/user.model'
import { UserRole, UserStatus } from '@/modules/user/user.enum'

import HttpException from '@/modules/http/http.exception'
import Encryption from '@/utils/encryption'

export default (role: UserRole) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const bearer = req.headers.authorization
      if (!bearer || !bearer.startsWith('Bearer ')) {
        throw new HttpException(401, 'Unauthorized')
      }

      const accessToken = bearer.split('Bearer ')[1].trim()

      const payload = await Encryption.verifyToken(accessToken)

      if (!payload) {
        throw new HttpException(401, 'Unauthorized')
      }

      const user = await userModel
        .findById(payload.id)
        .select('-password')
        .exec()

      if (!user) {
        throw new HttpException(401, 'Unauthorized')
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new HttpException(401, 'Unauthorized')
      }

      if (role > user.role) {
        throw new HttpException(401, 'Unauthorized')
      }

      req.user = user
      return next()
    } catch (err) {
      return next(err)
    }
  }
}
