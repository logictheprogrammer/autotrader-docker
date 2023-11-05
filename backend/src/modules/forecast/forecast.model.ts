import { IForecast } from '@/modules/forecast/forecast.interface'
import { Schema, Types, model } from 'mongoose'
import { ForecastStatus } from '@/modules/forecast/forecast.enum'
import { PlanMode } from '../plan/plan.enum'

const ForecastSchema = new Schema<IForecast>(
  {
    plan: {
      type: Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    pair: {
      type: Types.ObjectId,
      ref: 'Pair',
      required: true,
    },
    market: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ForecastStatus),
      default: ForecastStatus.PREPARING,
      trim: true,
    },
    move: {
      type: String,
      trim: true,
    },
    percentageProfit: {
      type: Number,
      required: true,
    },
    stakeRate: {
      type: Number,
      required: true,
    },
    openingPrice: {
      type: Number,
    },
    closingPrice: {
      type: Number,
    },
    runTime: {
      type: Number,
      required: true,
      default: 0,
    },
    timeStamps: {
      type: [Number],
      required: true,
    },
    startTime: {
      type: Date,
    },
    mode: {
      type: String,
      required: true,
      enum: Object.values(PlanMode),
      default: PlanMode.AUTOMATIC,
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

const ForecastModel = model<IForecast>('Forecast', ForecastSchema)

export default ForecastModel
