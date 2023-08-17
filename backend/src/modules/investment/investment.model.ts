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
    status: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    engine: {
      type: String,
      required: true,
    },
    minProfit: {
      type: Number,
      required: true,
    },
    maxProfit: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    dailyTrades: {
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
    },
    assets: {
      type: Array,
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
    dateSuspended: {
      type: Date,
    },
  },
  { timestamps: true }
)

export default model<IInvestment>('Investment', InvestmentSchema)
