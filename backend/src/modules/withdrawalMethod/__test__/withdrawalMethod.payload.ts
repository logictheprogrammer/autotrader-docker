import { Types } from 'mongoose'
import { WithdrawalMethodStatus } from '../../../modules/withdrawalMethod/withdrawalMethod.enum'
import {
  currencyA_id,
  currencyB_id,
  currencyC_id,
} from '../../currency/__test__/currency.payload'

export const withdrawalMethodUpdated = {
  network: '--updated wallet network--',
  fee: 10,
  minWithdrawal: 70,
}

export const withdrawalMethodA_id = new Types.ObjectId(
  '6245de5d5b1f5b3a5c1b539a'
)

export const withdrawalMethodA = {
  currency: currencyA_id,
  name: 'bitcoin',
  symbol: 'btc',
  logo: 'btc.svg',
  network: '--a wallet network--',
  fee: 5,
  minWithdrawal: 40,
  status: WithdrawalMethodStatus.ENABLED,
}

export const withdrawalMethodB_id = new Types.ObjectId(
  '6245de5d5b1f5b3a5c1b539b'
)

export const withdrawalMethodB = {
  currency: currencyB_id,
  name: 'ethereum',
  symbol: 'eth',
  logo: 'eth.svg',
  network: '--b wallet network--',
  fee: 10,
  minWithdrawal: 30,
  status: WithdrawalMethodStatus.ENABLED,
}

export const withdrawalMethodC_id = new Types.ObjectId(
  '6245de5d5b1f5b3a5c1b539c'
)

export const withdrawalMethodC = {
  currency: currencyC_id,
  name: 'litecoin',
  symbol: 'ltc',
  logo: 'ltc.svg',
  network: '--c wallet network--',
  fee: 15,
  minWithdrawal: 50,
  status: WithdrawalMethodStatus.ENABLED,
}
