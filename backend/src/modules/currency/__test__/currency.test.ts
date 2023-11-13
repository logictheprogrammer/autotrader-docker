import { StatusCode } from '../../../core/apiResponse'
import Cryptograph from '../../../core/cryptograph'
import { IControllerRoute } from '../../../core/utils'
import currencyModel from '../../../modules/currency/currency.model'
import { currencyController } from '../../../setup'
import { request } from '../../../test'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { currencyA, currencyB } from './currency.payload'

describe('currency', () => {
  const baseUrl = '/api/currency/'
  const masterUrl = '/api/master/currency/'
  describe('Validate routes', () => {
    const routes = currencyController.routes as IControllerRoute[]
    it('should expect 2 routes', () => {
      expect(routes.length).toBe(2)
    })
    test.each(routes)(
      'should have only one occurance for method - (%s) and url - (%s)',
      (method, url) => {
        const occurance = routes.filter(
          ([method1, url1]) => method === method1 && url === url1
        )
        expect(occurance.length).toBe(1)
      }
    )
    test.each(routes)(
      'The last middleware should only be called once where method - (%s) and url - (%s)',
      (...middlewares) => {
        const occurance = routes.filter((middlewares1) => {
          return (
            middlewares[middlewares.length - 1].toString() ===
            middlewares1[middlewares1.length - 1].toString()
          )
        })
        expect(occurance.length).toBe(1)
      }
    )
  })
  describe('create', () => {
    const url = masterUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(currencyA)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ ...currencyA, name: '' })

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given currency already exist', () => {
      it('should throw a 409', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        await currencyModel.create(currencyA)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(currencyA)

        expect(body.message).toBe('Currency already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)

        const currencyCount = await currencyModel.count()

        expect(currencyCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and currency payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const currency = await currencyModel.create(currencyB)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(currencyA)

        expect(body.message).toBe('Currency created succesfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.currency.name).toEqual(currencyA.name)
        expect(body.data.currency.logo).toEqual(currencyA.logo)
        expect(body.data.currency.symbol).toEqual(currencyA.symbol)

        const savedCurrency = await currencyModel.count({ _id: currency._id })

        expect(savedCurrency).toBe(1)

        const currencyCount = await currencyModel.count()

        expect(currencyCount).toBe(2)
      })
    })
  })

  describe('fetch currencies', () => {
    const url = masterUrl
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given no currencycurrencies available', () => {
      it('should return an empty array of currency', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Currencies fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          currencies: [],
        })
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and currencies payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const currency = await currencyModel.create(currencyA)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Currencies fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.currencies[0].logo).toBe(currency.logo)
        expect(body.data.currencies[0].name).toBe(currency.name)
        expect(body.data.currencies[0].symbol).toBe(currency.symbol)
      })
    })
  })
})
