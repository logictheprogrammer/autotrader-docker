import { IDeposit } from '../deposit.interface'
import depositModel from '../deposit.model'
import DepositService from '../deposit.service'
import {
  depositAObj,
  depositA_id,
  depositBObj,
  depositB_id,
  depositModelReturn,
} from './deposit.payload'

export const depositInstance = {
  model: depositModelReturn,
  onFailed: 'delete deposit',
  async callback() {},
}

export const createTransactionDepositMock = jest
  .spyOn(DepositService.prototype, '_createTransaction')
  .mockResolvedValue({
    object: depositAObj,
    instance: {
      model: depositModelReturn,
      onFailed: 'delete deposit',
      async callback() {},
    },
  })

export const updateStatusTransactionDepositMock = jest
  .spyOn(DepositService.prototype, '_updateStatusTransaction')
  .mockImplementation((depositId) => {
    if (depositId.toString() === depositA_id.toString()) {
      return Promise.resolve({
        object: depositAObj,
        instance: {
          model: depositModelReturn,
          onFailed: 'change deposit status to old status',
          async callback() {},
        },
      })
    }
    if (depositId.toString() === depositB_id.toString()) {
      return Promise.resolve({
        object: depositBObj,
        instance: {
          model: depositModelReturn,
          onFailed: 'change deposit status to old status',
          async callback() {},
        },
      })
    }
    return Promise.reject()
  })
