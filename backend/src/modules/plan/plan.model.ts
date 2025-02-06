import { Schema, model } from 'mongoose'
import { IPlan } from '@/modules/plan/plan.interface'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { Types } from 'mongoose'

const PlanSchema = new Schema<IPlan>(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(PlanStatus),
      default: PlanStatus.ACTIVE,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    engine: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
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
    dailyPercentageProfit: {
      type: Number,
      required: true,
    },
    potentialPercentageProfit: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    assetType: {
      type: String,
      required: true,
      trim: true,
    },
    assets: [
      {
        type: Types.ObjectId,
        ref: 'Asset',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v
      },
    },
  }
)

const PlanModel = model<IPlan>('Plan', PlanSchema)

export default PlanModel
