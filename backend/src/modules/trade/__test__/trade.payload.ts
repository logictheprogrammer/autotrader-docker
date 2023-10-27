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
import { userA_id, userB_id, userC_id } from '../../user/__test__/user.payload'
import { pairA_id, pairB_id, pairC_id } from '../../pair/__test__/pair.payload'
import { Types } from 'mongoose'
import { planA, planB, planC } from '../../plan/__test__/plan.payload'
import {
  forecastA_id,
  forecastB_id,
  forecastC_id,
} from '../../forecast/__test__/forecast.payload'

export const tradeA_id = '1236de5d5b1f5b3a5c1b539a'

export const tradeA = {
  investment: investmentA_id,
  forecast: forecastA_id,
  user: userA_id,
  pair: pairA_id,
  market: planA.assetType,
  status: ForecastStatus.PREPARING,
  move: ForecastMove.LONG,
  stake: 10,
  outcome: 15,
  profit: 5,
  percentage: 50,
  percentageProfit: 5,
  openingPrice: 100,
  closingPrice: 102,
  runTime: 0,
  timeStamps: [],
  startTime: new Date(),
  environment: investmentA.environment,
  manualMode: false,
}

export const tradeB_id = '1236de5d5b1f5b3a5c1b539b'

export const tradeB = {
  investment: investmentB_id,
  forecast: forecastB_id,
  user: userB_id,
  pair: pairB_id,
  market: planB.assetType,
  status: ForecastStatus.PREPARING,
  move: ForecastMove.LONG,
  stake: 10,
  outcome: 15,
  profit: 5,
  percentage: 50,
  percentageProfit: 5,
  openingPrice: 100,
  closingPrice: 102,
  runTime: 0,
  timeStamps: [],
  startTime: new Date(),
  environment: investmentB.environment,
  manualMode: false,
}

export const tradeC_id = '1236de5d5b1f5b3a5c1b539c'

export const tradeC = {
  investment: investmentC_id,
  forecast: forecastC_id,
  user: userC_id,
  pair: pairC_id,
  market: planC.assetType,
  status: ForecastStatus.PREPARING,
  move: ForecastMove.LONG,
  stake: 10,
  outcome: 15,
  profit: 5,
  percentage: 50,
  percentageProfit: 5,
  openingPrice: 100,
  closingPrice: 102,
  runTime: 0,
  timeStamps: [],
  startTime: new Date(),
  environment: investmentC.environment,
  manualMode: false,
}

const id1 = new Types.ObjectId().toString()

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
