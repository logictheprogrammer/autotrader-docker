import { Schema, model, Types } from 'mongoose'
import { IUser } from '@/modules/user/user.interface'
import Cryptograph from '@/core/cryptograph'

const UserSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    verifield: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      required: true,
    },
    referred: {
      type: Types.ObjectId,
    },
    refer: {
      type: String,
      required: true,
      unique: true,
    },
    mainBalance: {
      type: Number,
      required: true,
    },
    bonusBalance: {
      type: Number,
      required: true,
    },
    referralBalance: {
      type: Number,
      required: true,
    },
    demoBalance: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next()

  this.password = await Cryptograph.setHash(this.password)
  return next()
})

UserSchema.methods.isValidPassword = async function (password: string) {
  return await Cryptograph.isValidHash(password, this.password)
}

export default model<IUser>('User', UserSchema)
