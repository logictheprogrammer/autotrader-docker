import { ICurrency } from './../currency.interface'
import currencyModel from '../../../modules/currency/currency.model'
import { request } from '../../../test'
import { currencyA } from './currency.payload'
import { currencyService } from '../../../setup'
import { Types } from 'mongoose'

describe('currency', () => {
  request
  describe('get', () => {
    describe('given currency those not exist', () => {
      it('should throw an error', async () => {
        await expect(currencyService.get(new Types.ObjectId())).rejects.toThrow(
          'Currency not found'
        )
      })
    })

    describe('given currency exist', () => {
      it('should return the currency payload', async () => {
        const currency = await currencyModel.create(currencyA)

        const result = await currencyService.get(currency._id)

        expect(result).toEqual(currency.toObject({ getters: true }))
      })
    })
  })
})
