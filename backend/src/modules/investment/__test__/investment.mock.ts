import { NotFoundError } from '../../../core/apiError'
import InvestmentService from '../investment.service'
import {
  investmentAObj,
  investmentA_id,
  investmentB_id,
  investmentA,
  investmentB,
  investmentC,
  investmentC_id,
} from './investment.payload'

export const fetchInvestmentMock = jest
  .spyOn(InvestmentService.prototype, 'fetch')
  // @ts-ignore
  .mockImplementation(({ _id: key }) => {
    if (key.toString() === investmentA_id.toString()) {
      return Promise.resolve({
        ...investmentA,
        _id: investmentA_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === investmentB_id.toString()) {
      return Promise.resolve({
        ...investmentB,
        _id: investmentB_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === investmentC_id.toString()) {
      return Promise.resolve({
        ...investmentC,
        _id: investmentC_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else {
      throw new NotFoundError('Investment plan not found')
    }
  })

export const fundInvestmentMock = jest
  .spyOn(InvestmentService.prototype, 'fund')
  .mockResolvedValue(investmentAObj)
