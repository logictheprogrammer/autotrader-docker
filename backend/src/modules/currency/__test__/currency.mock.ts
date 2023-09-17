import CurrencyService from '../../../modules/currency/currency.service'
import HttpException from '../../http/http.exception'
import {
  currencyA,
  currencyA_id,
  currencyB,
  currencyB_id,
  currencyC,
  currencyC_id,
} from './currency.payload'

export const getCurrencyMock = jest
  .spyOn(CurrencyService.prototype, 'get')
  // @ts-ignore
  .mockImplementation((key) => {
    if (key.toString() === currencyA_id.toString()) {
      return Promise.resolve({
        ...currencyA,
        _id: currencyA_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === currencyB_id.toString()) {
      return Promise.resolve({
        ...currencyB,
        _id: currencyB_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === currencyC_id.toString()) {
      return Promise.resolve({
        ...currencyC,
        _id: currencyC_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else {
      return Promise.reject(new HttpException(404, 'Currency not found'))
    }
  })
