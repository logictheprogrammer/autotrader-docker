import { ITrade } from '@/modules/trade/trade.interface'
import { Schema, Types, model } from 'mongoose'
import { ForecastStatus } from '@/modules/forecast/forecast.enum'

const TradeSchema = new Schema(
  {
    investment: {
      type: Types.ObjectId,
      ref: 'Investment',
      required: true,
    },
    investmentObject: {
      type: Object,
      required: true,
    },
    forecast: {
      type: Types.ObjectId,
      ref: 'Forecast',
      required: true,
    },
    forecastObject: {
      type: Object,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userObject: {
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
    stake: {
      type: Number,
      required: true,
    },
    outcome: {
      type: Number,
      required: true,
    },
    profit: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    investmentPercentage: {
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
    timeStamps: [
      {
        type: Number,
        required: true,
      },
    ],
    startTime: {
      type: Date,
    },
    environment: {
      type: String,
      required: true,
    },
    manualUpdateAmount: {
      type: Boolean,
      required: true,
      default: false,
    },
    manualMode: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
)

export default model<ITrade>('Trade', TradeSchema)
