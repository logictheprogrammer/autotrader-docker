import { IInvestment } from '@/modules/investment/investment.interface'
import { Schema, Types, model } from 'mongoose'

const InvestmentSchema = new Schema(
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
    tradeStatus: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    timeLeft: {
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
    tradeStart: {
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

export default model<IInvestment>('Investment', InvestmentSchema)
