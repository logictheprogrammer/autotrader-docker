import { Router, Response } from 'express'
import { Service, Inject } from 'typedi'
import { IUserService } from '@/modules/user/user.interface'
import { UserRole } from '@/modules/user/user.enum'
import userValidation from '@/modules/user/user.validation'
import { ObjectId } from 'mongoose'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseController'
import ImageFileService from '../imageFile/imageFile.service'
import { InternalError, NotFoundError } from '@/core/apiError'
import UserService from './user.service'

@Service()
class UserController extends BaseController implements IController {
  public path = '/users'
  private imageFile = new ImageFileService()
  public routes: IControllerRoute[] = [
    [
      'put',
      `${this.path}/update-profile`,
      routePermission(UserRole.USER),
      schemaValidator(userValidation.updateProfile),
      (...params) => this.updateProfile(false)(...params),
    ],
    [
      'put',
      `${this.path}/update-profile-images`,
      routePermission(UserRole.USER),
      ImageFileService.validate([{ name: 'profile' }, { name: 'cover' }]),
      ImageFileService.upload([
        {
          name: 'profile',
          resize: UserService.profileImageSizes,
        },
        { name: 'cover', resize: UserService.coverImageSizes },
      ]),
      (req, res, next) => {
        res.send({})
      },
      // (...params) => this.updateProfileImages(false)(...params),
    ],
    [
      'get',
      `${this.path}/referred-users`,
      routePermission(UserRole.USER),
      (...params) => this.getReferredUsers(false)(...params),
    ],
    [
      'get',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(...params),
    ],
    [
      'patch',
      `/master${this.path}/fund/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.fundUser),
      (...params) => this.fundUser(...params),
    ],
    [
      'put',
      `/master${this.path}/update-profile/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.updateProfile),
      (...params) => this.updateProfile(true)(...params),
    ],
    [
      'patch',
      `/master${this.path}/update-email/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.updateEmail),
      (...params) => this.updateEmail(true)(...params),
    ],
    [
      'patch',
      `/master${this.path}/update-status/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.updateStatus),
      (...params) => this.updateStatus(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:userId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.deleteUser(...params),
    ],
    [
      'get',
      `/master${this.path}/referred-users`,
      routePermission(UserRole.ADMIN),
      (...params) => this.getReferredUsers(true)(...params),
    ],
    [
      'post',
      `/master${this.path}/send-email/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(userValidation.sendEmail),
      (...params) => this.sendEmail(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService
  ) {
    super()
    this.initializeRoutes()
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

  private updateProfileImages = (isAdmin: boolean = false) =>
    asyncHandler(async (req, res, next) => {
      let profileImage, coverImage
      try {
        let userId
        const { profile, cover } = req.body

        profileImage = profile && profile[0].name
        coverImage = cover && cover[0].name

        if (isAdmin) {
          userId = req.params.userId
          if (!userId) throw new NotFoundError('User not found')
        } else {
          if (!req.user) throw new NotFoundError('User not found')
          userId = req.user._id
        }
        const responce = await this.userService.updateProfileImages(
          userId,
          profileImage,
          coverImage
        )
        res.status(200).json(responce)
      } catch (err: any) {
        if (profileImage) ImageFileService.delete('profile', profileImage)
        if (coverImage) ImageFileService.delete('cover', coverImage)
        next(new InternalError(err.message, undefined, err.status))
      }
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
      return new SuccessResponse(
        `User ${amount > 0 ? 'credited' : 'debited'} successfully`,
        { user }
      ).send(res)
    }
  )

  private getReferredUsers = (byAdmin: boolean = false) =>
    asyncHandler(async (req, res): Promise<void | Response> => {
      let users
      if (byAdmin) {
        users = await this.userService.fetchAll({})
      } else {
        users = await this.userService.fetchAllReferrals({
          referred: req.user._id,
        })
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
