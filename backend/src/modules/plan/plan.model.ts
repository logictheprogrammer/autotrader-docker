import { Schema, model } from 'mongoose'
import { IPlan } from '@/modules/plan/plan.interface'
import { PlanStatus } from '@/modules/plan/plan.enum'

const PlanSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      default: PlanStatus.ACTIVE,
    },
    icon: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    engine: {
      type: String,
      required: true,
    },
    minAmount: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    minProfit: {
      type: Number,
      required: true,
    },
    maxProfit: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    dailyTrades: {
      type: Number,
      required: true,
    },
    gas: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assetType: {
      type: String,
      required: true,
    },
    assets: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IPlan>('Plan', PlanSchema)
