import { NotFoundError } from '../../../core/apiError'
import { depositMethodService } from '../../../setup'
import {
  depositMethodA,
  depositMethodA_id,
  depositMethodB,
  depositMethodB_id,
  depositMethodC,
  depositMethodC_id,
} from './depositMethod.payload'

export const fetchDepositMethodMock = jest
  .spyOn(depositMethodService, 'fetch')
  // @ts-ignore
  .mockImplementation(({ _id: key }) => {
    if (key.toString() === depositMethodA_id.toString()) {
      return Promise.resolve({
        ...depositMethodA,
        _id: depositMethodA_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === depositMethodB_id.toString()) {
      return Promise.resolve({
        ...depositMethodB,
        _id: depositMethodB_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === depositMethodC_id.toString()) {
      return Promise.resolve({
        ...depositMethodC,
        _id: depositMethodC_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else {
      return Promise.reject(new NotFoundError('Deposit method not found'))
    }
  })
