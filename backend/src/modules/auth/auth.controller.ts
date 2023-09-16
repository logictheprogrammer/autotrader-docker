import { Router, Request, Response, NextFunction } from 'express'
import { Service, Inject } from 'typedi'
import validate from '@/modules/auth/auth.validation'
import { UserRole, UserStatus } from '@/modules/user/user.enum'
import ServiceToken from '@/utils/enums/serviceToken'
import { AppConstants } from '@/modules/app/app.constants'
import { IAuthService } from '@/modules/auth/auth.interface'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import HttpException from '@/modules/http/http.exception'
import { HttpResponseStatus } from '../http/http.enum'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'

@Service()
class AuthController implements IAppController {
  public path = '/authentication'
  public router = Router()

  constructor(
    @Inject(ServiceToken.AUTH_SERVICE) private authService: IAuthService
  ) {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
    // Register
    this.router.post(
      `${this.path}/register`,
      HttpMiddleware.validate(validate.register),
      this.register
    )

    // Login
    this.router.post(
      `${this.path}/login`,
      HttpMiddleware.validate(validate.login),
      this.login
    )

    // user
    this.router.get(
      `${this.path}/user`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.user
    )

    // Update Password
    this.router.patch(
      `${this.path}/update-password`,
      HttpMiddleware.authenticate(UserRole.USER),
      HttpMiddleware.validate(validate.updatePassword),
      this.updatePassword(true)
    )

    // Update User Password
    this.router.patch(
      `${this.path}/update-password/:userId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.updateUserPassword),
      this.updatePassword(false, true)
    )

    // Forget Password
    this.router.post(
      `${this.path}/forget-password`,
      HttpMiddleware.validate(validate.forgetPassword),
      this.forgetPassword
    )

    // Reset Password
    this.router.patch(
      `${this.path}/reset-password`,
      HttpMiddleware.validate(validate.resetPassword),
      this.resetPassword
    )

    // Verify Email
    this.router.patch(
      `${this.path}/verify-email`,
      HttpMiddleware.validate(validate.verifyEmail),
      this.verifyEmail
    )
  }

  private register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { name, email, username, country, password, invite } = req.body
      const responce = await this.authService.register(
        name,
        email,
        username,
        country,
        password,
        UserRole.USER,
        UserStatus.ACTIVE,
        AppConstants.mainBalance,
        AppConstants.referralBalance,
        AppConstants.demoBalance,
        AppConstants.bonusBalance,
        invite
      )
      res.status(201).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { account, password } = req.body

      const responce = await this.authService.login(account, password)
      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private user = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      console.log(req.user.status)
      if (req.user.status !== UserStatus.ACTIVE)
        throw new HttpException(
          ErrorCode.FORBIDDEN,
          'Your account is under review, please check in later',
          HttpResponseStatus.INFO
        )

      res.status(200).json({
        status: HttpResponseStatus.SUCCESS,
        message: 'profile fetched',
        data: { user: req.user },
      })
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private updatePassword =
    (withOldPassword: boolean = true, isAdmin: boolean = false) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        let userId, oldPassword
        const { password } = req.body
        if (isAdmin) {
          userId = req.params.userId
          if (!userId) throw new HttpException(404, 'User not found')
        } else {
          if (!req.user) throw new HttpException(404, 'User not found')
          userId = req.user._id
          if (withOldPassword) oldPassword = req.body.oldPassword
        }
        const responce = await this.authService.updatePassword(
          userId,
          password,
          oldPassword
        )
        res.status(200).json(responce)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private forgetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { account } = req.body
      const responce = await this.authService.forgetPassword(account)
      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { password, key, verifyToken } = req.body
      const responce = await this.authService.resetPassword(
        key,
        verifyToken,
        password
      )
      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { key, verifyToken } = req.body
      const response = await this.authService.verifyEmail(key, verifyToken)
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default AuthController
