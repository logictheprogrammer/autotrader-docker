import { NotFoundError } from './../../../core/apiError'
import CurrencyService from '../../../modules/currency/currency.service'
import {
  currencyA,
  currencyA_id,
  currencyB,
  currencyB_id,
  currencyC,
  currencyC_id,
} from './currency.payload'

export const fetchCurrencyMock = jest
  .spyOn(CurrencyService.prototype, 'fetch')
  // @ts-ignore
  .mockImplementation(({ _id: key }) => {
    if (key.toString() === currencyA_id.toString()) {
      return Promise.resolve({
        ...currencyA,
        _id: currencyA_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === currencyB_id.toString()) {
      return Promise.resolve({
        ...currencyB,
        _id: currencyB_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === currencyC_id.toString()) {
      return Promise.resolve({
        ...currencyC,
        _id: currencyC_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else {
      return Promise.reject(new NotFoundError('Currency not found'))
    }
  })
