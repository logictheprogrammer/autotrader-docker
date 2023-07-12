import { Schema, Types, model } from 'mongoose'
import { INotification } from '@/modules/notification/notification.interface'

const NotificationSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
    },
    userObject: {
      type: Object,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
    categoryName: {
      type: String,
      required: true,
    },
    category: {
      type: Types.ObjectId,
      required: true,
    },
    categoryObject: {
      type: Object,
      required: true,
    },
    forWho: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    environment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<INotification>('Notification', NotificationSchema)
