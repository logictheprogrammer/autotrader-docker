import { Schema, model } from 'mongoose'
import { ICurrency } from '@/modules/currency/currency.interface'

const CurrencySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    symbol: {
      type: String,
      required: true,
      unique: true,
    },
    logo: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<ICurrency>('Currency', CurrencySchema)
