import { IWithdrawal } from '../withdrawal.interface'
import withdrawalModel from '../withdrawal.model'
import WithdrawalService from '../withdrawal.service'
import {
  withdrawalAObj,
  withdrawalA_id,
  withdrawalBObj,
  withdrawalB_id,
  withdrawalInstance,
  withdrawalModelReturn,
} from './withdrawal.payload'

export const createTransactionWithdrawalMock = jest
  .spyOn(WithdrawalService.prototype, '_createTransaction')
  .mockResolvedValue({
    object: withdrawalAObj,
    instance: {
      model: withdrawalModelReturn,
      onFailed: 'delete withdrawal',
      async callback() {},
    },
  })

export const updateStatusTransactionWithdrawalMock = jest
  .spyOn(WithdrawalService.prototype, '_updateStatusTransaction')
  .mockImplementation((withdrawalId) => {
    if (withdrawalId.toString() === withdrawalA_id.toString()) {
      return Promise.resolve({
        object: withdrawalAObj,
        instance: {
          model: withdrawalModelReturn,
          onFailed: 'change withdrawal status to old status',
          async callback() {},
        },
      })
    }
    if (withdrawalId.toString() === withdrawalB_id.toString()) {
      return Promise.resolve({
        object: withdrawalBObj,
        instance: {
          model: withdrawalModelReturn,
          onFailed: 'change withdrawal status to old status',
          async callback() {},
        },
      })
    }
    return Promise.reject()
  })
