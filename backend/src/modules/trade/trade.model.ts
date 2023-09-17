import { ITrade } from '@/modules/trade/trade.interface'
import { Schema, Types, model } from 'mongoose'
import { TradeStatus } from '@/modules/trade/trade.enum'

const TradeSchema = new Schema(
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
      default: TradeStatus.PREPARING,
    },
    move: {
      type: String,
    },
    outcome: {
      type: Number,
      required: true,
    },
    openingPrice: {
      type: Number,
    },
    closingPrice: {
      type: Number,
    },
    change: {
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

export default model<ITrade>('Trade', TradeSchema)
