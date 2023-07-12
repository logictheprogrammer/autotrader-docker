import { ITrade } from '@/modules/trade/trade.interface'
import { Schema, Types, model } from 'mongoose'
import { TradeStatus } from '@/modules/trade/trade.enum'

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
      default: TradeStatus.WAITING,
    },
    move: {
      type: String,
      required: true,
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
    startTime: {
      type: Date,
    },
    stopTime: {
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
