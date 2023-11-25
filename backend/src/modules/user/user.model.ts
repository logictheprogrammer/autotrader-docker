import { Schema, model, Types } from 'mongoose'
import { IUser } from '@/modules/user/user.interface'
import Cryptograph from '@/core/cryptograph'

const UserSchema = new Schema<IUser>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
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
      trim: true,
    },
    profile: {
      type: String,
      trim: true,
    },
    cover: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    verifield: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
      required: true,
      trim: true,
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
      trim: true,
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        delete ret.password
        delete ret.key
        delete ret.__v
      },
    },
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

const UserModel = model<IUser>('User', UserSchema)

export default UserModel
