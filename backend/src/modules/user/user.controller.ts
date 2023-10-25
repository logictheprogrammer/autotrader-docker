import { Router, Response } from 'express'
import { Service, Inject } from 'typedi'
import { IUserService } from '@/modules/user/user.interface'
import { UserRole } from '@/modules/user/user.enum'
import userValidation from '@/modules/user/user.validation'
import { ObjectId } from 'mongoose'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
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
    // Update Profile
    this.router.put(
      `${this.path}/update-profile`,
      routePermission(UserRole.USER),
      schemaValidator(userValidation.updateProfile),
      this.updateProfile(false)
    )

    // Get Referred Users
    this.router.get(
      `${this.path}/referred-users`,
      routePermission(UserRole.USER),
      this.getReferredUsers(false)
    )

    // Get Users
    this.router.get(
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll
    )
    // Fund User
    this.router.patch(
      `/master${this.path}/fund/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.fundUser),
      this.fundUser
    )

    // Update User Profile
    this.router.put(
      `/master${this.path}/update-profile/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.updateProfile),
      this.updateProfile(true)
    )

    // Update User Email
    this.router.patch(
      `/master${this.path}/update-email/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.updateEmail),
      this.updateEmail(true)
    )

    // Update User Status
    this.router.patch(
      `/master${this.path}/update-status/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.updateStatus),
      this.updateStatus
    )

    // Delete User
    this.router.delete(
      `/master${this.path}/delete/:userId`,
      routePermission(UserRole.ADMIN),
      this.deleteUser
    )

    // Get All Referred Users
    this.router.get(
      `/master${this.path}/referred-users/:userId`,
      routePermission(UserRole.ADMIN),
      this.getReferredUsers(true)
    )

    // Send Email
    this.router.post(
      `/master${this.path}/send-email/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.sendEmail),
      this.sendEmail
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
      const user = await this.userService.delete({ _id: userId })
      return new SuccessResponse('User deleted successfully', { user }).send(
        res
      )
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
      let users
      if (byAdmin) {
        users = await this.userService.fetchAll({
          referred: req.params.userId,
        })
      } else {
        users = await this.userService.fetchAll({ referred: req.user._id })
      }

      return new SuccessResponse('Users fetched successfully', { users }).send(
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

      return new SuccessResponse('Email successfully sent', { user }).send(res)
    }
  )
}

export default UserController
