import { IInvestment } from '@/modules/investment/investment.interface'
import { Schema, Types, model } from 'mongoose'

const InvestmentSchema = new Schema<IInvestment>(
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
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userObject: {
      type: Object,
      required: true,
    },
    account: {
      type: String,
      required: true,
    },
    environment: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    minRunTime: {
      type: Number,
      required: true,
    },
    gas: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    manualMode: {
      type: Boolean,
      required: true,
      default: false,
    },
    runTime: {
      type: Number,
      required: true,
      default: 0,
    },
    tradeStatus: {
      type: String,
    },
    currentTrade: {
      type: Types.ObjectId,
      ref: 'Trade',
    },
    tradeTimeStamps: [
      {
        type: Number,
        required: true,
      },
    ],
    tradeStartTime: {
      type: Date,
    },
  },
  { timestamps: true }
)

export default model<IInvestment>('Investment', InvestmentSchema)
