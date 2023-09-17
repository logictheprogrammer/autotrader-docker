import HttpException from '../../../modules/http/http.exception'
import UserService from '../../../modules/user/user.service'
import { IUser } from '../user.interface'
import userModel from '../user.model'

import {
  notFoundUser,
  userAObj,
  userA_id,
  userBObj,
  userB_id,
  userModelReturn,
} from './user.payload'

export const fundTransactionUserMock = jest
  .spyOn(UserService.prototype, '_fundTransaction')
  .mockImplementation((userId) => {
    if (
      userId.toString() === userA_id.toString() ||
      userId === userAObj.username
    ) {
      return Promise.resolve({
        object: userAObj,
        instance: {
          model: userModelReturn,
          onFailed: 'return deposit',
          async callback() {},
        },
      })
    }
    if (
      userId.toString() === userB_id.toString() ||
      userId === userBObj.username
    ) {
      return Promise.resolve({
        object: userBObj,
        instance: {
          model: userModelReturn,
          onFailed: 'return deposit',
          async callback() {},
        },
      })
    }
    if (userId === notFoundUser.username) {
      throw new HttpException(
        404,
        `No Recipient with the username of ${notFoundUser.username} was found`
      )
    }
    return Promise.reject('Mock: User not found')
  })
