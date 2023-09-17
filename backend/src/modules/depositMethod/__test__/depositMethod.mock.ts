import HttpException from '../../../modules/http/http.exception'
import DepositMethodService from '../../../modules/depositMethod/depositMethod.service'
import {
  depositMethodA,
  depositMethodA_id,
  depositMethodB,
  depositMethodB_id,
  depositMethodC,
  depositMethodC_id,
} from './depositMethod.payload'

export const getDepositMethodMock = jest
  .spyOn(DepositMethodService.prototype, 'get')
  // @ts-ignore
  .mockImplementation((key) => {
    if (key.toString() === depositMethodA_id.toString()) {
      return Promise.resolve({
        ...depositMethodA,
        _id: depositMethodA_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === depositMethodB_id.toString()) {
      return Promise.resolve({
        ...depositMethodB,
        _id: depositMethodB_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === depositMethodC_id.toString()) {
      return Promise.resolve({
        ...depositMethodC,
        _id: depositMethodC_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else {
      return Promise.reject(new HttpException(404, 'Deposit method not found'))
    }
  })
