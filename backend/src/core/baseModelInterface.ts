import { Document } from 'mongoose'

export default interface baseModelInterface extends Document {
  __v: number
}
