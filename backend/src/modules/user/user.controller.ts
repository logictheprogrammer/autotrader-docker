import { Router, Response } from 'express'
import { Service, Inject } from 'typedi'
import { IUserService } from '@/modules/user/user.interface'
import { UserRole } from '@/modules/user/user.enum'
import userValidation from '@/modules/user/user.validation'
import { ObjectId } from 'mongoose'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import { RequestConflictError } from '@/core/apiError'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'

@Service()
class UserController implements IController {
  public path = '/users'
  public router = Router()

  constructor(
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService
  ) {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
    // Fund User
    this.router.patch(
      `${this.path}/:userId/force-fund-user`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.fundUser),
      this.fundUser
    )

    // Update Profile
    this.router.put(
      `${this.path}/update-profile`,
      routePermission(UserRole.USER),
      schemaValidator(userValidation.updateProfile),
      this.updateProfile(false)
    )

    // Update User Profile
    this.router.put(
      `${this.path}/:userId/update-user-profile`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.updateProfile),
      this.updateProfile(true)
    )

    // Update User Email
    this.router.patch(
      `${this.path}/:userId/update-user-email`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.updateEmail),
      this.updateEmail(true)
    )

    // Update User Status
    this.router.patch(
      `${this.path}/:userId/update-user-status`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.updateStatus),
      this.updateStatus
    )

    // Delete User
    this.router.delete(
      `${this.path}/:userId/delete-user`,
      routePermission(UserRole.ADMIN),
      this.deleteUser
    )

    // Get Referred Users
    this.router.get(
      `${this.path}/referred-users`,
      routePermission(UserRole.USER),
      this.getReferredUsers(false)
    )

    // Get All Referred Users
    this.router.get(
      `${this.path}/all-referred-users`,
      routePermission(UserRole.ADMIN),
      this.getReferredUsers(true)
    )

    // Send Email
    this.router.post(
      `${this.path}/send-email/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.sendEmail),
      this.sendEmail
    )

    // Get Users
    this.router.get(
      `${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll
    )
  }

  private fetchAll = asyncHandler(
    async (req, res): Promise<void | Response> => {
      const users = await this.userService.fetchAll({})
      return new SuccessResponse('Users fetched successfully', { users }).send(
        res
      )
    }
  )

  private updateProfile = (byAdmin: boolean = false) =>
    asyncHandler(async (req, res): Promise<void | Response> => {
      const userId = byAdmin ? req.params.userId : req.user._id
      const { name, username } = req.body

      const usernameExit = await this.userService.fetch({
        username,
        _id: { $ne: userId },
      })

      if (usernameExit)
        throw new RequestConflictError(
          'A user with this username already exist'
        )

      const user = await this.userService.updateProfile(
        { _id: userId },
        name,
        username,
        byAdmin
      )
      return new SuccessResponse('Profile updated successfully', { user }).send(
        res
      )
    })

  private updateEmail = (byAdmin: boolean) =>
    asyncHandler(async (req, res): Promise<void | Response> => {
      const userId = byAdmin ? req.params.userId : req.user._id
      const email = req.body.email

      const emailExit = await this.userService.fetch({
        email,
        _id: { $ne: userId },
      })

      if (emailExit)
        throw new RequestConflictError('A user with this email already exist')

      const user = await this.userService.updateEmail({ _id: userId }, email)
      return new SuccessResponse('Email updated successfully', { user }).send(
        res
      )
    })

  private updateStatus = asyncHandler(
    async (req, res): Promise<void | Response> => {
      const { status } = req.body
      const userId = req.params.userId as unknown as ObjectId
      const user = await this.userService.updateStatus({ _id: userId }, status)
      return new SuccessResponse('Status updated successfully', { user }).send(
        res
      )
    }
  )

  private deleteUser = asyncHandler(
    async (req, res): Promise<void | Response> => {
      const userId = req.params.userId as unknown as ObjectId
      const user = await this.userService.delete(userId)
      return new SuccessResponse('', { user }).send(res)
    }
  )

  private fundUser = asyncHandler(
    async (req, res): Promise<void | Response> => {
      const userId = req.params.userId as unknown as ObjectId
      const { account, amount } = req.body
      const user = await this.userService.fund({ _id: userId }, account, amount)
      return new SuccessResponse('User funded successfully', { user }).send(res)
    }
  )

  private getReferredUsers = (byAdmin: boolean = false) =>
    asyncHandler(async (req, res): Promise<void | Response> => {
      let user
      if (byAdmin) {
        user = await this.userService.getReferredUsers({})
      } else {
        user = await this.userService.getReferredUsers({ _id: req.user._id })
      }

      return new SuccessResponse('Users fetched successfully', { user }).send(
        res
      )
    })

  private sendEmail = asyncHandler(
    async (req, res): Promise<void | Response> => {
      const userId = req.params.userId as unknown as ObjectId
      const { subject, heading, content } = req.body

      const user = await this.userService.sendEmail(
        { _id: userId },
        subject,
        heading,
        content
      )

      return new SuccessResponse('', { user }).send(res)
    }
  )
}

export default UserController
