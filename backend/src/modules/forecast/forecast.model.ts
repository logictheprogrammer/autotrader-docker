import { IForecast } from '@/modules/forecast/forecast.interface'
import { Schema, Types, model } from 'mongoose'
import { ForecastStatus } from '@/modules/forecast/forecast.enum'

const ForecastSchema = new Schema(
  {
    plan: {
      type: Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    planObject: {
      type: Object,
      required: true,
    },
    pair: {
      type: Types.ObjectId,
      ref: 'Pair',
      required: true,
    },
    pairObject: {
      type: Object,
      required: true,
    },
    market: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: ForecastStatus.PREPARING,
    },
    move: {
      type: String,
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
    manualMode: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
)

export default model<IForecast>('Forecast', ForecastSchema)
