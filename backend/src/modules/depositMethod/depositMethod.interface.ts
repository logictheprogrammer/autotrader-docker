import { DepositMethodStatus } from '@/modules/depositMethod/depositMethod.enum'
import { FilterQuery, ObjectId, Types } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'
import { ICurrencyObject } from '../currency/currency.interface'

export interface IDepositMethodObject extends baseObjectInterface {
  currency: ICurrencyObject
  address: string
  network: string
  status: DepositMethodStatus
  fee: number
  minDeposit: number
  price: number
  autoUpdate: boolean
}

// @ts-ignore
export interface IDepositMethod
  extends baseModelInterface,
    IDepositMethodObject {}

export interface IDepositMethodService {
  create(
    currencyId: ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): Promise<IDepositMethod>

  update(
    filter: FilterQuery<IDepositMethod>,
    currencyId: ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): Promise<IDepositMethod>

  fetch(filter: FilterQuery<IDepositMethod>): Promise<IDepositMethodObject>

  fetchAll(filter: FilterQuery<IDepositMethod>): Promise<IDepositMethod[]>

  delete(filter: FilterQuery<IDepositMethod>): Promise<IDepositMethod>

  updateStatus(
    filter: FilterQuery<IDepositMethod>,
    status: DepositMethodStatus
  ): Promise<IDepositMethod>

  updateMode(
    filter: FilterQuery<IDepositMethod>,
    autoUpdate: boolean
  ): Promise<IDepositMethod>

  updatePrice(
    filter: FilterQuery<IDepositMethod>,
    price: number
  ): Promise<IDepositMethod>
}
