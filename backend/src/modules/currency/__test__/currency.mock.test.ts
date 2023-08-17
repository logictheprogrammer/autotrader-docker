import AppRepository from '../../../modules/app/app.repository'
import { ICurrency } from './../currency.interface'
import currencyModel from '../../../modules/currency/currency.model'
import { request } from '../../../test'
import { currencyA } from './currency.payload'
import { currencyService } from '../../../setup'
import AppObjectId from '../../app/app.objectId'

const currencyRepository = new AppRepository<ICurrency>(currencyModel)

describe('currency', () => {
  request
  describe('get', () => {
    describe('given currency those not exist', () => {
      it('should throw an error', async () => {
        await expect(currencyService.get(new AppObjectId())).rejects.toThrow(
          'Currency not found'
        )
      })
    })

    describe('given currency exist', () => {
      it('should return the currency payload', async () => {
        const currency = await currencyRepository.create(currencyA).save()

        const result = await currencyService.get(currency._id)

        expect(result).toEqual(currencyRepository.toObject(currency))
      })
    })
  })
})
