import {
  ForecastMove,
  ForecastStatus,
} from '../../../modules/forecast/forecast.enum'
import {
  investmentA,
  investmentA_id,
  investmentB,
  investmentB_id,
  investmentC,
  investmentC_id,
} from './../../investment/__test__/investment.payload'
import {
  userA,
  userA_id,
  userB,
  userB_id,
  userC,
  userC_id,
} from '../../user/__test__/user.payload'
import {
  pairA,
  pairA_id,
  pairB,
  pairB_id,
  pairC,
  pairC_id,
} from '../../pair/__test__/pair.payload'
import { Types } from 'mongoose'

export const tradeA_id = '1236de5d5b1f5b3a5c1b539a'

export const tradeA = {
  investment: investmentA_id,
  investmentObject: investmentA,
  user: userA_id,
  userObject: userA,
  pair: pairA_id,
  pairObject: pairA,
  market: investmentA.planObject.assetType,
  status: ForecastStatus.PREPARING,
  move: ForecastMove.LONG,
  stake: 10,
  outcome: 15,
  profit: 5,
  percentage: 50,
  investmentPercentage: 5,
  environment: investmentA.environment,
  manualUpdateAmount: false,
  manualMode: false,
}

export const tradeB_id = '1236de5d5b1f5b3a5c1b539b'

export const tradeB = {
  investment: investmentB_id,
  investmentObject: investmentB,
  user: userB_id,
  userObject: userB,
  pair: pairB_id,
  pairObject: pairB,
  market: investmentB.planObject.assetType,
  status: ForecastStatus.PREPARING,
  move: ForecastMove.LONG,
  stake: 10,
  outcome: 15,
  profit: 5,
  percentage: 50,
  investmentPercentage: 5,
  environment: investmentB.environment,
  manualUpdateAmount: false,
  manualMode: false,
}

export const tradeC_id = '1236de5d5b1f5b3a5c1b539c'

export const tradeC = {
  investment: investmentC_id,
  investmentObject: investmentB,
  user: userC_id,
  userObject: userC,
  pair: pairC_id,
  pairObject: pairC,
  market: investmentC.planObject.assetType,
  status: ForecastStatus.PREPARING,
  move: ForecastMove.LONG,
  stake: 10,
  outcome: 15,
  profit: 5,
  percentage: 50,
  investmentPercentage: 5,
  environment: investmentC.environment,
  manualUpdateAmount: false,
  manualMode: false,
}

const id1 = new Types.ObjectId().toString()

// @ts-ignore
export const tradeModelReturn: ITrade = {
  save: jest.fn().mockResolvedValue({
    toObject: jest.fn(),
  }),
  toObject: jest.fn().mockReturnValue({
    _id: id1,
    // @ts-ignore
    collection: {
      name: 'trade',
    },
  }),
  _id: id1,
  // @ts-ignore
  collection: {
    name: 'trade',
  },
}

// @ts-ignore
export const tradeAObj: ITradeObject = {
  ...tradeA,
  // @ts-ignore
  _id: tradeA_id,
}

// @ts-ignore
export const tradeBObj: ITradeObject = {
  ...tradeB,
  // @ts-ignore
  _id: tradeB_id,
}
