import { ITrade } from '@/modules/trade/trade.interface'
import { Schema, Types, model } from 'mongoose'
import { ForecastStatus } from '@/modules/forecast/forecast.enum'
import { PlanMode } from '../plan/plan.enum'

const TradeSchema = new Schema<ITrade>(
  {
    investment: {
      type: Types.ObjectId,
      ref: 'Investment',
      required: true,
    },
    forecast: {
      type: Types.ObjectId,
      ref: 'Forecast',
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
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
    stake: {
      type: Number,
      required: true,
    },
    outcome: {
      type: Number,
    },
    profit: {
      type: Number,
    },
    percentage: {
      type: Number,
    },
    percentageProfit: {
      type: Number,
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
      trim: true,
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

const TradeModel = model<ITrade>('Trade', TradeSchema)

export default TradeModel
