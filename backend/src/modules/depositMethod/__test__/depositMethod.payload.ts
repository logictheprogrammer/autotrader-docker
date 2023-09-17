import { Types } from 'mongoose'
import { DepositMethodStatus } from '../../../modules/depositMethod/depositMethod.enum'
import {
  currencyA_id,
  currencyB_id,
  currencyC_id,
} from '../../currency/__test__/currency.payload'

export const depositMethodUpdated = {
  address: '--updated wallet address--',
  network: '--updated wallet network--',
  fee: 10,
  minDeposit: 70,
}

export const depositMethodA_id = new Types.ObjectId('6245de5d5b1f5b3a5c1b539a')

export const depositMethodA = {
  currency: currencyA_id.toString(),
  name: 'bitcoin',
  symbol: 'btc',
  logo: 'btc.svg',
  price: 1,
  address: '--a wallet address--',
  network: '--a wallet network--',
  fee: 5,
  minDeposit: 40,
  status: DepositMethodStatus.ENABLED,
  autoUpdate: true,
}

export const depositMethodB_id = new Types.ObjectId('6245de5d5b1f5b3a5c1b539b')

export const depositMethodB = {
  currency: currencyB_id.toString(),
  name: 'ethereum',
  symbol: 'eth',
  logo: 'eth.svg',
  price: 2,
  address: '--b wallet address--',
  network: '--b wallet network--',
  fee: 10,
  minDeposit: 30,
  status: DepositMethodStatus.ENABLED,
  autoUpdate: true,
}

export const depositMethodC_id = new Types.ObjectId('6245de5d5b1f5b3a5c1b539c')

export const depositMethodC = {
  currency: currencyC_id.toString(),
  name: 'litecoin',
  symbol: 'ltc',
  logo: 'ltc.svg',
  price: 3,
  address: '--c wallet address--',
  network: '--c wallet network--',
  fee: 15,
  minDeposit: 50,
  status: DepositMethodStatus.ENABLED,
  autoUpdate: true,
}
