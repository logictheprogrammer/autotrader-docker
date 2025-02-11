import { Router, Response } from 'express'
import { Service, Inject } from 'typedi'
import validate from '@/modules/auth/auth.validation'
import { UserRole, UserStatus } from '@/modules/user/user.enum'
import { IAuthService } from '@/modules/auth/auth.interface'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import { SiteConstants } from '../config/config.constants'
import asyncHandler from '@/helpers/asyncHandler'
import {
  StatusCode,
  SuccessCreatedResponse,
  SuccessResponse,
} from '@/core/apiResponse'
import schemaValidator from '@/helpers/schemaValidator'
import routePermission from '@/helpers/routePermission'
import BaseController from '@/core/baseController'

@Service()
class AuthController extends BaseController implements IController {
  public path = '/authentication'
  public routes: IControllerRoute[] = [
    [
      'post',
      `${this.path}/register`,
      schemaValidator(validate.register),
      (...params) => this.register(...params),
    ],
    [
      'post',
      `${this.path}/login`,
      schemaValidator(validate.login),
      (...params) => this.login(...params),
    ],
    [
      'get',
      `${this.path}/user`,
      routePermission(UserRole.USER),
      (...params) => this.user(...params),
    ],
    [
      'patch',
      `${this.path}/update-password`,
      routePermission(UserRole.USER),
      schemaValidator(validate.updatePassword),
      (...params) => this.updatePassword(false)(...params),
    ],
    [
      'post',
      `${this.path}/forget-password`,
      schemaValidator(validate.forgetPassword),
      (...params) => this.forgetPassword(...params),
    ],
    [
      'patch',
      `${this.path}/reset-password`,
      schemaValidator(validate.resetPassword),
      (...params) => this.resetPassword(...params),
    ],
    [
      'patch',
      `${this.path}/verify-email`,
      schemaValidator(validate.verifyEmail),
      (...params) => this.verifyEmail(...params),
    ],
    [
      'patch',
      `/master${this.path}/update-password/:userId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateUserPassword),
      (...params) => this.updatePassword(true)(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.AUTH_SERVICE) private authService: IAuthService
  ) {
    super()
    this.initializeRoutes()
  }

  private register = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { name, email, username, country, password, invite } = req.body
      const { message, email: resEmail } = await this.authService.register(
        name,
        email,
        username,
        country,
        password,
        UserRole.USER,
        UserStatus.ACTIVE,
        SiteConstants.mainBalance,
        SiteConstants.referralBalance,
        SiteConstants.demoBalance,
        SiteConstants.bonusBalance,
        invite
      )
      return new SuccessCreatedResponse(
        message,
        { email: resEmail },
        '',
        StatusCode.INFO
      ).send(res)
    }
  )

  private login = asyncHandler(async (req, res): Promise<Response | void> => {
    const { account, password } = req.body

    const response = await this.authService.login(
      { $or: [{ username: account }, { email: account }] },
      password
    )

    return new SuccessResponse(
      // @ts-ignore
      response.message || 'Login successfully',
      response,
      '',
      // @ts-ignore
      response.message ? StatusCode.INFO : StatusCode.SUCCESS
    ).send(res)
  })

  private user = asyncHandler(async (req, res): Promise<Response | void> => {
    return new SuccessResponse('', { user: req.user }).send(res)
  })

  private updatePassword = (byAdmin: boolean = false) =>
    asyncHandler(async (req, res): Promise<void | Response> => {
      let user
      const { password } = req.body
      if (byAdmin) {
        user = await this.authService.updatePassword(
          { _id: req.params.userId },
          password
        )
      } else {
        user = await this.authService.updatePassword(
          { _id: req.user._id },
          password,
          req.body.oldPassword
        )
      }

      return new SuccessResponse('Password updated successfully', {
        user,
      }).send(res)
    })

  private forgetPassword = asyncHandler(
    async (req, res): Promise<void | Response> => {
      const { account } = req.body
      const response = await this.authService.forgetPassword({
        $or: [{ username: account }, { email: account }],
      })
      return new SuccessResponse(
        'A reset password link has been sent to your email address',
        { response },
        undefined,
        StatusCode.INFO
      ).send(res)
    }
  )

  private resetPassword = asyncHandler(
    async (req, res): Promise<void | Response> => {
      const { password, key, verifyToken } = req.body
      await this.authService.resetPassword(key, verifyToken, password)
      return new SuccessResponse('Password updated successfully').send(res)
    }
  )

  private verifyEmail = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { key, verifyToken } = req.body
      await this.authService.verifyEmail(key, verifyToken)
      return new SuccessResponse('Email successfully verified').send(res)
    }
  )
}

export default AuthController
