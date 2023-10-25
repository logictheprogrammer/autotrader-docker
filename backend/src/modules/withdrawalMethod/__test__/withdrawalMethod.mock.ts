import WithdrawalMethodService from '../../../modules/withdrawalMethod/withdrawalMethod.service'
import {
  withdrawalMethodA,
  withdrawalMethodA_id,
  withdrawalMethodB,
  withdrawalMethodB_id,
  withdrawalMethodC,
  withdrawalMethodC_id,
} from './withdrawalMethod.payload'

export const fetchWithdrawalMethodMock = jest
  .spyOn(WithdrawalMethodService.prototype, 'fetch')
  // @ts-ignore
  .mockImplementation(({ _id: key }) => {
    if (key.toString() === withdrawalMethodA_id.toString()) {
      return Promise.resolve({
        ...withdrawalMethodA,
        _id: withdrawalMethodA_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === withdrawalMethodB_id.toString()) {
      return Promise.resolve({
        ...withdrawalMethodB,
        _id: withdrawalMethodB_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === withdrawalMethodC_id.toString()) {
      return Promise.resolve({
        ...withdrawalMethodC,
        _id: withdrawalMethodC_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else {
      return Promise.reject('Mock: Withdrawal method not found')
    }
  })
