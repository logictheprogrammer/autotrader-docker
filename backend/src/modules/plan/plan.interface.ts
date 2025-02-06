import { PlanStatus } from '@/modules/plan/plan.enum'
import { AssetType } from '@/modules/asset/asset.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import { IAsset } from '../asset/asset.interface'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface IPlanObject extends baseObjectInterface {
  icon: string
  name: string
  engine: string
  duration: number
  minAmount: number
  maxAmount: number
  dailyPercentageProfit: number
  potentialPercentageProfit: number
  description: string
  assetType: AssetType
  assets: IAsset['_id'][]
  status: PlanStatus
}

// @ts-ignore
export interface IPlan extends baseModelInterface, IPlanObject {}

export interface IPlanService {
  create(
    icon: string,
    name: string,
    engine: string,
    duration: number,
    minAmount: number,
    maxAmount: number,
    dailyPercentageProfit: number,
    description: string,
    assetType: AssetType,
    assets: ObjectId[]
  ): Promise<IPlanObject>

  update(
    filter: FilterQuery<IPlan>,
    icon: string,
    name: string,
    engine: string,
    duration: number,
    minAmount: number,
    maxAmount: number,
    dailyPercentageProfit: number,
    description: string,
    assetType: AssetType,
    assets: ObjectId[]
  ): Promise<IPlanObject>

  updateStatus(
    filter: FilterQuery<IPlan>,
    status: PlanStatus
  ): Promise<IPlanObject>

  fetch(filter: FilterQuery<IPlan>): Promise<IPlanObject>

  count(filter: FilterQuery<IPlan>): Promise<number>

  delete(filter: FilterQuery<IPlan>): Promise<IPlanObject>

  fetchAll(filter: FilterQuery<IPlan>): Promise<IPlanObject[]>
}
