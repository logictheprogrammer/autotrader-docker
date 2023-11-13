import currencyModel from '../../../modules/currency/currency.model'
import { request } from '../../../test'
import { currencyA } from './currency.payload'
import { currencyService } from '../../../setup'
import { Types } from 'mongoose'
import Helpers from '../../../utils/helpers'

describe('currency', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(currencyService)
      expect(methods).toEqual([
        'currencyModel',
        'create',
        'fetch',
        'fetchAll',
        'count',
      ])
    })
  })
  describe('fetch', () => {
    describe('given currency those not exist', () => {
      it('should throw an error', async () => {
        try {
          await currencyService.fetch(new Types.ObjectId())
        } catch (error: any) {
          expect(error.message).toBe('Currency not found')
        }
      })
    })

    describe('given currency exist', () => {
      it('should return the currency payload', async () => {
        const currency = await currencyModel.create(currencyA)

        const result = await currencyService.fetch({ _id: currency._id })

        expect(result._id).toEqual(currency._id)
      })
    })
  })
})
