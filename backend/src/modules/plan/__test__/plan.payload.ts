import { IPlanObject } from './../plan.interface'
import {
  assetA_id,
  assetB_id,
  assetC_id,
} from '../../asset/__test__/asset.payload'
import { AssetType } from '../../asset/asset.enum'
import { PlanMode, PlanStatus } from '../plan.enum'
import { Types } from 'mongoose'

export const planA_id = new Types.ObjectId('6145de5d5c4f5b3abc1b539a')
// @ts-ignore
export const planA: IPlanObject = {
  name: 'plana',
  icon: 'icon.png',
  engine: 'enginea',
  minAmount: 50,
  maxAmount: 200,
  minPercentageProfit: 0.1,
  maxPercentageProfit: 0.15,
  winRate: 0.85,
  tradingDays: 5,
  dailyForecasts: 2,
  gas: 200,
  description: 'this is plan a',
  assetType: AssetType.CRYPTO,
  assets: [assetA_id, assetB_id],
  status: PlanStatus.ACTIVE,
  mode: PlanMode.AUTOMATIC,
  investors: [],
  dummyInvestors: 0,
  currentForecast: undefined,
  forecastStatus: undefined,
  forecastStartTime: undefined,
  forecastTimeStamps: [],
}

export const planB_id = new Types.ObjectId('6145de5d5c4f5b3abc1b539b')
// @ts-ignore
export const planB: IPlanObject = {
  name: 'planb',
  icon: 'icon.png',
  engine: 'engineb',
  minAmount: 70,
  maxAmount: 300,
  minPercentageProfit: 0.12,
  maxPercentageProfit: 0.19,
  winRate: 0.85,
  tradingDays: 7,
  dailyForecasts: 3,
  gas: 300,
  description: 'this is plan b',
  assetType: AssetType.CRYPTO,
  assets: [assetB_id, assetC_id],
  status: PlanStatus.ACTIVE,
  mode: PlanMode.AUTOMATIC,
  investors: [],
  dummyInvestors: 0,
  currentForecast: undefined,
  forecastStatus: undefined,
  forecastStartTime: undefined,
  forecastTimeStamps: [],
}

export const planC_id = new Types.ObjectId('6145de5d5c4f5b3abc1b539c')
// @ts-ignore
export const planC: IPlanObject = {
  name: 'planc',
  icon: 'icon.png',
  engine: 'enginec',
  minAmount: 80,
  maxAmount: 350,
  minPercentageProfit: 0.15,
  maxPercentageProfit: 0.25,
  winRate: 0.85,
  tradingDays: 14,
  dailyForecasts: 6,
  gas: 500,
  description: 'this is plan c',
  assetType: AssetType.CRYPTO,
  assets: [assetC_id, assetA_id],
  status: PlanStatus.ACTIVE,
  mode: PlanMode.AUTOMATIC,
  investors: [],
  dummyInvestors: 0,
  currentForecast: undefined,
  forecastStatus: undefined,
  forecastStartTime: undefined,
  forecastTimeStamps: [],
}
