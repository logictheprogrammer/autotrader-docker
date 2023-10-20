import baseModelInterface from '@/core/baseModelInterface'
import baseObjectInterface from '@/core/baseObjectInterface'
import { FilterQuery } from 'mongoose'

export interface ICurrencyObject extends baseObjectInterface {
  name: string
  symbol: string
  logo: string
}

// @ts-ignore
export interface ICurrency extends baseModelInterface, ICurrencyObject {}

export interface ICurrencyService {
  create(name: string, symbol: string, logo: string): Promise<ICurrencyObject>

  fetch(filter: FilterQuery<ICurrency>): Promise<ICurrencyObject>

  fetchAll(filter: FilterQuery<ICurrency>): Promise<ICurrencyObject[]>
}
