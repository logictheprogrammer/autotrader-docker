import { WithdrawalStatus } from '@/modules/withdrawal/withdrawal.enum'
import {
  IWithdrawalMethod,
  IWithdrawalMethodObject,
} from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { UserAccount } from '@/modules/user/user.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'
import { ICurrency, ICurrencyObject } from '../currency/currency.interface'

export interface IWithdrawalObject extends baseObjectInterface {
  withdrawalMethod: IWithdrawalMethod['_id']
  currency: ICurrency['_id']
  user: IUser['_id']
  account: UserAccount
  address: string
  status: WithdrawalStatus
  amount: number
  fee: number
}

// @ts-ignore
export interface IWithdrawal extends baseModelInterface, IWithdrawalObject {}

export interface IWithdrawalService {
  create(
    withdrawalMethodId: ObjectId,
    userId: ObjectId,
    account: UserAccount,
    address: string,
    amount: number
  ): Promise<IWithdrawalObject>

  updateStatus(
    filter: FilterQuery<IWithdrawal>,
    status: WithdrawalStatus
  ): Promise<IWithdrawalObject>

  fetch(filter: FilterQuery<IWithdrawal>): Promise<IWithdrawalObject>

  fetchAll(filter: FilterQuery<IWithdrawal>): Promise<IWithdrawalObject[]>

  delete(filter: FilterQuery<IWithdrawal>): Promise<IWithdrawalObject>

  count(filter: FilterQuery<IWithdrawal>): Promise<number>
}
