import { ITransferService } from '@/modules/transfer/transfer.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import validate from '@/modules/transfer/transfer.validation'
import { UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseController'

@Service()
class TransferController extends BaseController implements IController {
  public path = '/transfer'
  public routes: IControllerRoute[] = [
    [
      'post',
      `${this.path}/create`,
      routePermission(UserRole.USER),
      schemaValidator(validate.create),
      (...params) => this.create(...params),
    ],
    [
      'get',
      `${this.path}`,
      routePermission(UserRole.USER),
      (...params) => this.fetchAll(false)(...params),
    ],
    [
      'patch',
      `/master${this.path}/update-status/:transferId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      (...params) => this.updateStatus(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:transferId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.delete(...params),
    ],
    [
      'get',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(true)(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.TRANSFER_SERVICE)
    private transferService: ITransferService
  ) {
    super()
    this.initializeRoutes()
  }

  private intialiseRoutes(): void {
    this.router.post(
      `${this.path}/create`,
      routePermission(UserRole.USER),
      schemaValidator(validate.create),
      this.create
    )

    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false)
    )

    this.router.patch(
      `/master${this.path}/update-status/:transferId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `/master${this.path}/delete/:transferId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true)
    )
  }

  private fetchAll = (byAdmin: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let transfers
      if (byAdmin) {
        transfers = await this.transferService.fetchAll({})
      } else {
        const userId = req.user._id
        transfers = await this.transferService.fetchAll({
          $or: [{ toUser: userId }, { fromUser: userId }],
        })
      }
      return new SuccessResponse('Transfer fetched successfully', {
        transfers,
      }).send(res)
    })

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const { toUserUsername, amount, account } = req.body
    const userId = req.user._id
    const transfer = await this.transferService.create(
      userId,
      toUserUsername,
      account,
      amount
    )
    return new SuccessCreatedResponse('Transfer registered successfully', {
      transfer,
    }).send(res)
  })

  private updateStatus = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { status } = req.body
      const { transferId } = req.params
      const transfer = await this.transferService.updateStatus(
        { _id: transferId },
        status
      )
      return new SuccessResponse('Status updated successfully', {
        transfer,
      }).send(res)
    }
  )

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const transferId = req.params.transferId as unknown as ObjectId
    const transfer = await this.transferService.delete({ _id: transferId })
    return new SuccessResponse('Transfer deleted successfully', {
      transfer,
    }).send(res)
  })
}

export default TransferController
