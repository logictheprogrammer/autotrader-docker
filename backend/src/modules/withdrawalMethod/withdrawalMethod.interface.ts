import { WithdrawalMethodStatus } from '@/modules/withdrawalMethod/withdrawalMethod.enum'
import { ObjectId, FilterQuery } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface IWithdrawalMethodObject extends baseObjectInterface {
  currency: ObjectId
  name: string
  symbol: string
  logo: string
  network: string
  status: WithdrawalMethodStatus
  fee: number
  minWithdrawal: number
}

// @ts-ignore
export interface IWithdrawalMethod
  extends baseModelInterface,
    IWithdrawalMethodObject {}

export interface IWithdrawalMethodService {
  create(
    currencyId: ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): Promise<IWithdrawalMethodObject>

  update(
    filter: FilterQuery<IWithdrawalMethod>,
    currencyId: ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): Promise<IWithdrawalMethodObject>

  fetch(
    filter: FilterQuery<IWithdrawalMethod>
  ): Promise<IWithdrawalMethodObject>

  fetchAll(
    filter: FilterQuery<IWithdrawalMethod>
  ): Promise<IWithdrawalMethodObject[]>

  delete(
    filter: FilterQuery<IWithdrawalMethod>
  ): Promise<IWithdrawalMethodObject>

  updateStatus(
    filter: FilterQuery<IWithdrawalMethod>,
    status: WithdrawalMethodStatus
  ): Promise<IWithdrawalMethodObject>
}
