import HttpException from '../../../modules/http/http.exception'
import InvestmentService from '../investment.service'
import {
  investmentAObj,
  investmentA_id,
  investmentBObj,
  investmentB_id,
  investmentInstance,
  investmentModelReturn,
  investmentA,
  investmentB,
  investmentC,
  investmentC_id,
} from './investment.payload'

export const getInvestmentMock = jest
  .spyOn(InvestmentService.prototype, 'get')
  .mockImplementation((key) => {
    if (key.toString() === investmentA_id.toString()) {
      return Promise.resolve({
        ...investmentA,
        _id: investmentA_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else if (key.toString() === investmentB_id.toString()) {
      return Promise.resolve({
        ...investmentB,
        _id: investmentB_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else if (key.toString() === investmentC_id.toString()) {
      return Promise.resolve({
        ...investmentC,
        _id: investmentC_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else {
      throw new HttpException(404, 'Investment plan not found')
    }
  })

export const createTransactionInvestmentMock = jest
  .spyOn(InvestmentService.prototype, '_createTransaction')
  .mockResolvedValue({
    object: investmentAObj,
    instance: investmentInstance,
  })

export const fundTransactionInvestmentMock = jest
  .spyOn(InvestmentService.prototype, '_fundTransaction')
  .mockResolvedValue({
    object: investmentAObj,
    instance: investmentInstance,
  })

export const updateStatusTransactionInvestmentMock = jest
  .spyOn(InvestmentService.prototype, '_updateStatusTransaction')
  .mockImplementation((investmentId, status) => {
    if (investmentId.toString() === investmentA_id.toString()) {
      return Promise.resolve({
        object: { ...investmentAObj, status },
        instance: {
          model: investmentModelReturn,
          onFailed: 'change investment status to old status',
          async callback() {},
        },
      })
    }
    if (investmentId.toString() === investmentB_id.toString()) {
      return Promise.resolve({
        object: { ...investmentBObj, status },
        instance: {
          model: investmentModelReturn,
          onFailed: 'change investment status to old status',
          async callback() {},
        },
      })
    }
    return Promise.reject('Mock: unknown investment status')
  })
