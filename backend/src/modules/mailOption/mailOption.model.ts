import { Schema, model } from 'mongoose'
import { IMailOption } from '@/modules/mailOption/mailOption.interface'
import Encryption from '@/utils/encryption'

const MailOptonSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    host: {
      type: String,
      required: true,
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
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

MailOptonSchema.pre<IMailOption>('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  const encrypted = Encryption.encrypt(this.password)
  this.password = encrypted

  next()
})

MailOptonSchema.methods.getPassword = function () {
  return Encryption.decrypt(this.password)
}

export default model<IMailOption>('MailOption', MailOptonSchema)
