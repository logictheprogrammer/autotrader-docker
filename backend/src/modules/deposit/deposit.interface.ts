import { DepositStatus } from '@/modules/deposit/deposit.enum'
import { IDepositMethodObject } from '@/modules/depositMethod/depositMethod.interface'
import { IUserObject } from '@/modules/user/user.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'
import { ICurrencyObject } from '../currency/currency.interface'

export interface IDepositObject extends baseObjectInterface {
  depositMethod: IDepositMethodObject
  currency: ICurrencyObject
  user: IUserObject
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
