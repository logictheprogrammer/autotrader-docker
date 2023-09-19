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
import {
  planA,
  planA_id,
  planB,
  planB_id,
  planC,
  planC_id,
} from '../../plan/__test__/plan.payload'

export const forecastA_id = '1236de5d5b1f5b3a5c1b539a'

export const forecastA = {
  plan: planA_id,
  planObject: planA,
  pair: pairA_id,
  pairObject: pairA,
  market: planA.assetType,
  status: ForecastStatus.PREPARING,
  move: undefined,
  percentageProfit: 2.5,
  stakeRate: 0.1,
  openingPrice: undefined,
  closingPrice: undefined,
  runTime: 0,
  timeStamps: [],
  startTime: undefined,
  manualMode: false,
}

export const forecastB_id = '1236de5d5b1f5b3a5c1b539b'

export const forecastB = {
  plan: planB_id,
  planObject: planB,
  pair: pairB_id,
  pairObject: pairB,
  market: planB.assetType,
  status: ForecastStatus.PREPARING,
  move: undefined,
  percentageProfit: 2.5,
  stakeRate: 0.1,
  openingPrice: undefined,
  closingPrice: undefined,
  runTime: 0,
  timeStamps: [],
  startTime: undefined,
  manualMode: false,
}

export const forecastC_id = '1236de5d5b1f5b3a5c1b539c'

export const forecastC = {
  plan: planC_id,
  planObject: planC,
  pair: pairC_id,
  pairObject: pairC,
  market: planC.assetType,
  status: ForecastStatus.PREPARING,
  move: undefined,
  percentageProfit: 2.5,
  stakeRate: 0.1,
  openingPrice: undefined,
  closingPrice: undefined,
  runTime: 0,
  timeStamps: [],
  startTime: undefined,
  manualMode: false,
}

const id1 = new Types.ObjectId().toString()

// @ts-ignore
export const forecastModelReturn: IForecast = {
  save: jest.fn().mockResolvedValue({
    toObject: jest.fn(),
  }),
  toObject: jest.fn().mockReturnValue({
    _id: id1,
    // @ts-ignore
    collection: {
      name: 'forecast',
    },
  }),
  _id: id1,
  // @ts-ignore
  collection: {
    name: 'forecast',
  },
}

// @ts-ignore
export const forecastAObj: IForecastObject = {
  ...forecastA,
  // @ts-ignore
  _id: forecastA_id,
}

// @ts-ignore
export const forecastBObj: IForecastObject = {
  ...forecastB,
  // @ts-ignore
  _id: forecastB_id,
}
