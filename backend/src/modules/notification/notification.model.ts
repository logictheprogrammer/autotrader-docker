import { Schema, Types, model } from 'mongoose'
import { INotification } from '@/modules/notification/notification.interface'
import { NotificationCategory, NotificationForWho } from './notification.enum'
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
    categoryName: {
      type: String,
      required: true,
      enum: Object.values(NotificationCategory),
      trim: true,
    },
    category: {
      type: Types.ObjectId,
      required: true,
    },
    forWho: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
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
