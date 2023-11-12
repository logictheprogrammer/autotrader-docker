import { ForecastStatus } from '../../../modules/forecast/forecast.enum'
import { pairA_id, pairB_id, pairC_id } from '../../pair/__test__/pair.payload'
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
  pair: pairA_id,
  market: planA.assetType,
  status: ForecastStatus.PREPARING,
  move: undefined,
  percentageProfit: undefined,
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
  pair: pairB_id,
  market: planB.assetType,
  status: ForecastStatus.PREPARING,
  move: undefined,
  percentageProfit: undefined,
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
  pair: pairC_id,
  market: planC.assetType,
  status: ForecastStatus.PREPARING,
  move: undefined,
  percentageProfit: undefined,
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
