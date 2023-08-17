import UserService from '../../../modules/user/user.service'
import AppRepository from '../../app/app.repository'
import { IUser } from '../user.interface'
import userModel from '../user.model'

import {
  userAObj,
  userA_id,
  userBObj,
  userB_id,
  userModelReturn,
} from './user.payload'

const userRepository = new AppRepository<IUser>(userModel)

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
          model: userRepository.toClass(userModelReturn),
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
          model: userRepository.toClass(userModelReturn),
          onFailed: 'return deposit',
          async callback() {},
        },
      })
    }
    return Promise.reject('Mock: User not found')
  })
