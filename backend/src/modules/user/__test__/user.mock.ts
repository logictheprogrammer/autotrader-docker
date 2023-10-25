import { NotFoundError } from '../../../core/apiError'
import UserService from '../../../modules/user/user.service'
import { IUser } from '../user.interface'
import userModel from '../user.model'

import {
  notFoundUser,
  userAObj,
  userA_id,
  userBObj,
  userB_id,
} from './user.payload'

export const fundUserMock = jest
  .spyOn(UserService.prototype, 'fund')
  .mockImplementation(({ _id: userId, username }) => {
    if (
      userId.toString() === userA_id.toString() ||
      username === userAObj.username
    ) {
      return Promise.resolve(userAObj)
    }
    if (
      userId.toString() === userB_id.toString() ||
      username === userBObj.username
    ) {
      return Promise.resolve(userBObj)
    }
    if (username === notFoundUser.username) {
      throw new NotFoundError(
        `No Recipient with the username of ${notFoundUser.username} was found`
      )
    }
    return Promise.reject('Mock: User not found')
  })
