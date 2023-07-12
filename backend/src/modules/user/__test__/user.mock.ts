import UserService from '../../../modules/user/user.service'

import {
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
    return Promise.reject('Mock: User not found')
  })
