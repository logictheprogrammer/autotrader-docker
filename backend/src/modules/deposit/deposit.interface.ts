import { DepositStatus } from '@/modules/deposit/deposit.enum'
import { IDepositMethod } from '@/modules/depositMethod/depositMethod.interface'
import { IUser } from '@/modules/user/user.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface IDepositObject extends baseObjectInterface {
  depositMethod: IDepositMethod
  user: IUser
  status: DepositStatus
  amount: number
  fee: number
}

// @ts-ignore
export interface IDeposit extends baseModelInterface, IDepositObject {}

export interface IDepositService {
  create(
    depositMethodId: ObjectId,
    userId: ObjectId,
    amount: number
  ): Promise<IDepositObject>

  fetchAll(filter: FilterQuery<IDeposit>): Promise<IDepositObject[]>

  delete(filter: FilterQuery<IDeposit>): Promise<IDepositObject>

  updateStatus(
    filter: FilterQuery<IDeposit>,
    status: DepositStatus
  ): Promise<IDepositObject>
}
