import { Schema, model } from 'mongoose'
import { ICurrency } from '@/modules/currency/currency.interface'

const CurrencySchema = new Schema<ICurrency>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
      trim: true,
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

const CurrencyModel = model<ICurrency>('Currency', CurrencySchema)

export default CurrencyModel
