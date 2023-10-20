import { ObjectId, Schema, Types } from 'mongoose'

export default interface baseObjectInterface {
  _id: ObjectId
  updatedAt: Date
  createdAt: Date
}
