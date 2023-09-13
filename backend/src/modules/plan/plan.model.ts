import { Schema, model } from 'mongoose'
import { IPlan } from '@/modules/plan/plan.interface'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { Types } from 'mongoose'

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
    pairs: {
      type: Types.ObjectId,
      ref: 'Pair',
    },
    manualMode: {
      type: Boolean,
      required: true,
      default: false,
    },
    investors: [
      {
        type: Types.ObjectId,
        ref: 'Investment',
      },
    ],
    dummyInvestors: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
)

export default model<IPlan>('Plan', PlanSchema)
