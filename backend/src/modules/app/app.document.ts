import { Document } from 'mongoose'

export default class AppDocument<
  T = any,
  TQueryHelpers = any,
  DocType = any
> extends Document {
  constructor() {
    super()
  }
}
