import { NotFoundError } from '../../../core/apiError'
import { userService } from '../../../setup'

import {
  notFoundUser,
  userAObj,
  userA_id,
  userBObj,
  userB_id,
} from './user.payload'

export const fundUserMock = jest
  .spyOn(userService, 'fund')
  // @ts-ignore
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
