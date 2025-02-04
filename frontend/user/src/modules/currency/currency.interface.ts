import { IBaseObject } from '@/util/interface'

export interface ICurrency extends IBaseObject {
  name: string
  symbol: string
  logo: string
}
