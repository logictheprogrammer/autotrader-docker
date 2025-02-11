import { IInvestment } from '@/modules/investment/investment.interface'
import { Schema, Types, model } from 'mongoose'
import { UserAccount, UserEnvironment } from '../user/user.enum'
import { InvestmentStatus } from './investment.enum'

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
    amount: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    extraProfit: {
      type: Number,
      required: true,
      default: 0,
    },
    expectedRunTime: {
      type: Number,
      required: true,
    },
    runTime: {
      type: Number,
      required: true,
      default: 0,
    },
    resumeTime: {
      required: true,
      type: Date,
    },
    assetType: {
      type: String,
      trim: true,
    },
    assets: [
      {
        type: Types.ObjectId,
        ref: 'Asset',
      },
    ],
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
