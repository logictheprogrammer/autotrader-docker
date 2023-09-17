import HttpException from '../../../modules/http/http.exception'
import WithdrawalMethodService from '../../../modules/withdrawalMethod/withdrawalMethod.service'
import {
  withdrawalMethodA,
  withdrawalMethodA_id,
  withdrawalMethodB,
  withdrawalMethodB_id,
  withdrawalMethodC,
  withdrawalMethodC_id,
} from './withdrawalMethod.payload'

export const getWithdrawalMethodMock = jest
  .spyOn(WithdrawalMethodService.prototype, 'get')
  // @ts-ignore
  .mockImplementation((key) => {
    if (key.toString() === withdrawalMethodA_id.toString()) {
      return Promise.resolve({
        ...withdrawalMethodA,
        _id: withdrawalMethodA_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === withdrawalMethodB_id.toString()) {
      return Promise.resolve({
        ...withdrawalMethodB,
        _id: withdrawalMethodB_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === withdrawalMethodC_id.toString()) {
      return Promise.resolve({
        ...withdrawalMethodC,
        _id: withdrawalMethodC_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else {
      return Promise.reject(
        new HttpException(404, 'Withdrawal method not found')
      )
    }
  })
