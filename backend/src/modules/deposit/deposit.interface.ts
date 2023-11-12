import { DepositStatus } from '@/modules/deposit/deposit.enum'
import {
  IDepositMethod,
  IDepositMethodObject,
} from '@/modules/depositMethod/depositMethod.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'
import { ICurrency, ICurrencyObject } from '../currency/currency.interface'

export interface IDepositObject extends baseObjectInterface {
  depositMethod: IDepositMethod['_id']
  currency: ICurrency['_id']
  user: IUser['_id']
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

  count(filter: FilterQuery<IDeposit>): Promise<number>

  updateStatus(
    filter: FilterQuery<IDeposit>,
    status: DepositStatus
  ): Promise<IDepositObject>
}
