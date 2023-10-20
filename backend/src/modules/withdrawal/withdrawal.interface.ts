import { WithdrawalStatus } from '@/modules/withdrawal/withdrawal.enum'
import { IWithdrawalMethodObject } from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import { IUserObject } from '@/modules/user/user.interface'
import { UserAccount } from '@/modules/user/user.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface IWithdrawalObject extends baseObjectInterface {
  withdrawalMethod: IWithdrawalMethodObject
  user: IUserObject
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
}
