import { Schema, model } from 'mongoose'
import { IPlan } from '@/modules/plan/plan.interface'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { Types } from 'mongoose'
import { ForecastStatus } from '../forecast/forecast.enum'

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
    minAmount: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    minPercentageProfit: {
      type: Number,
      required: true,
    },
    maxPercentageProfit: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    dailyForecasts: {
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
    runTime: {
      type: Number,
      required: true,
      default: 0,
    },
    forecastStatus: {
      type: String,
      enum: Object.values(ForecastStatus),
      trim: true,
    },
    currentForecast: {
      type: Types.ObjectId,
      ref: 'Forecast',
    },
    forecastTimeStamps: [
      {
        type: Number,
        required: true,
      },
    ],
    forecastStartTime: {
      type: Date,
    },
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
