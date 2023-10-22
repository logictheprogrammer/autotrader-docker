import { Schema, model } from 'mongoose'
import { IMailOption } from '@/modules/mailOption/mailOption.interface'
import Cryptograph from '@/core/cryptograph'

const MailOptonSchema = new Schema<IMailOption>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    host: {
      type: String,
      required: true,
      trim: true,
    },
    port: {
      type: Number,
      required: true,
    },
    tls: {
      type: Boolean,
      required: true,
    },
    secure: {
      type: Boolean,
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
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
        delete ret.password
      },
    },
  }
)

MailOptonSchema.pre<IMailOption>('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  const encrypted = Cryptograph.encrypt(this.password)
  this.password = encrypted

  next()
})

MailOptonSchema.methods.getPassword = function () {
  return Cryptograph.decrypt(this.password)
}

const MailOptionModel = model<IMailOption>('MailOption', MailOptonSchema)

export default MailOptionModel
