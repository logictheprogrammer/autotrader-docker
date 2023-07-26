import { Router, Request, Response, NextFunction } from 'express'
import { Service, Inject } from 'typedi'
import { IUserService } from '@/modules/user/user.interface'
import ServiceToken from '@/utils/enums/serviceToken'
import HttpException from '@/modules/http/http.exception'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import userValidation from '@/modules/user/user.validation'
import { IServiceController } from '@/modules/service/service.interface'
import { Types } from 'mongoose'

@Service()
class UserController implements IServiceController {
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
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(userValidation.fundUser),
      this.forceFundUser
    )

    // Update Profile
    this.router.put(
      `${this.path}/update-profile`,
      HttpMiddleware.authenticate(UserRole.USER),
      HttpMiddleware.validate(userValidation.updateProfile),
      this.updateProfile(false)
    )

    // Update User Profile
    this.router.put(
      `${this.path}/:userId/update-user-profile`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(userValidation.updateProfile),
      this.updateProfile(true)
    )

    // Update User Email
    this.router.patch(
      `${this.path}/:userId/update-user-email`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(userValidation.updateEmail),
      this.updateEmail(true)
    )

    // Update User Status
    this.router.patch(
      `${this.path}/:userId/update-user-status`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(userValidation.updateStatus),
      this.updateStatus
    )

    // Delete User
    this.router.delete(
      `${this.path}/:userId/delete-user`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.deleteUser
    )

    // Get Referred Users
    this.router.get(
      `${this.path}/referred-users`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.getReferredUsers(false)
    )

    // Get All Referred Users
    this.router.get(
      `${this.path}/all-referred-users`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.getReferredUsers(true)
    )

    // Send Email
    this.router.post(
      `${this.path}/send-email/:userId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(userValidation.sendEmail),
      this.sendEmail
    )

    // Get User
    this.router.get(
      `${this.path}/:userId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.getUser
    )

    // Get Users
    this.router.get(
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.getUsers
    )
  }

  private getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const responce = await this.userService.fetchAll()
      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private getUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.userId as unknown as Types.ObjectId
      const responce = await this.userService.fetch(userId)
      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private updateProfile =
    (isAdmin: boolean = false) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        let userId
        const { name, username } = req.body
        if (isAdmin) {
          userId = req.params.userId
          if (!userId) throw new HttpException(404, 'User not found')
        } else {
          if (!req.user) throw new HttpException(404, 'User not found')
          userId = req.user._id
        }
        const responce = await this.userService.updateProfile(
          userId,
          name,
          username,
          isAdmin
        )
        res.status(200).json(responce)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private updateEmail =
    (isAdmin: boolean = false) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        let userId
        const email = req.body.email
        if (isAdmin) {
          userId = req.params.userId
          if (!userId) throw new HttpException(404, 'User not found')
        } else {
          if (!req.user) throw new HttpException(404, 'User not found')
          userId = req.user._id
        }
        const responce = await this.userService.updateEmail(userId, email)
        res.status(200).json(responce)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.body
      const userId = req.params.userId as unknown as Types.ObjectId
      const responce = await this.userService.updateStatus(userId, status)
      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.userId as unknown as Types.ObjectId
      const responce = await this.userService.delete(userId)
      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private forceFundUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.userId as unknown as Types.ObjectId
      const { account, amount } = req.body
      const responce = await this.userService.forceFund(userId, account, amount)
      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private getReferredUsers =
    (getAll: boolean = false) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        let userId
        if (!getAll) {
          if (!req.user) throw new HttpException(404, 'User not found')
          userId = req.user._id
        }
        const responce = await this.userService.getReferredUsers(getAll, userId)
        res.status(200).json(responce)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private sendEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.userId as unknown as Types.ObjectId
      const { subject, heading, content } = req.body

      const responce = await this.userService.sendEmail(
        userId,
        subject,
        heading,
        content
      )

      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default UserController
