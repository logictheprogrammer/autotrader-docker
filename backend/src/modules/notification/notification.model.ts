import { Schema, Types, model } from 'mongoose'
import { INotification } from '@/modules/notification/notification.interface'
import { NotificationTitle } from './notification.enum'
import { UserEnvironment } from '../user/user.enum'

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
    title: {
      type: String,
      required: true,
      enum: Object.values(NotificationTitle),
      trim: true,
    },
    object: {
      type: Object,
      required: true,
    },
    forWho: {
      type: Number,
      required: true,
    },
    environment: {
      type: String,
      required: true,
      enum: Object.values(UserEnvironment),
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

const NotificationModel = model<INotification>(
  'Notification',
  NotificationSchema
)

export default NotificationModel
