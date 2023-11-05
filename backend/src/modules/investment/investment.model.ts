import { IInvestment } from '@/modules/investment/investment.interface'
import { Schema, Types, model } from 'mongoose'
import { UserAccount, UserEnvironment } from '../user/user.enum'
import { InvestmentStatus } from './investment.enum'
import { ForecastStatus } from '../forecast/forecast.enum'
import { PlanMode } from '../plan/plan.enum'

const InvestmentSchema = new Schema<IInvestment>(
  {
    plan: {
      type: Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    account: {
      type: String,
      required: true,
      enum: Object.values(UserAccount),
      trim: true,
    },
    environment: {
      type: String,
      required: true,
      enum: Object.values(UserEnvironment),
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(InvestmentStatus),
      trim: true,
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
    mode: {
      type: String,
      required: true,
      enum: Object.values(PlanMode),
      default: PlanMode.AUTOMATIC,
    },
    runTime: {
      type: Number,
      required: true,
      default: 0,
    },
    tradeStatus: {
      type: String,
      enum: Object.values(ForecastStatus),
      trim: true,
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
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v
      },
    },
  }
)

const InvestmentModel = model<IInvestment>('Investment', InvestmentSchema)

export default InvestmentModel
