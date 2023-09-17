import currencyModel from '../../../modules/currency/currency.model'
import { request } from '../../../test'
import { adminA, userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { currencyA, currencyB } from './currency.payload'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import { IUser } from '../../user/user.interface'
import { ICurrency } from '../currency.interface'

describe('currency', () => {
  const baseUrl = '/api/currency/'
  describe('create', () => {
    const url = baseUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(currencyA)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ ...currencyA, name: '' })

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given currency already exist', () => {
      it('should throw a 409', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await currencyModel.create(currencyA)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(currencyA)

        expect(body.message).toBe('Currency already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const currencyCount = await currencyModel.count()

        expect(currencyCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and currency payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await currencyModel.create(currencyB)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(currencyA)

        expect(body.message).toBe('Currency added successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          currency: {
            ...currencyA,
            __v: 0,
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const currencyCount = await currencyModel.count()

        expect(currencyCount).toBe(2)
      })
    })
  })

  describe('get currencies', () => {
    const url = baseUrl
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given no currencycurrencies available', () => {
      it('should return an empty array of currency', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Currencies fetch successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          currencies: [],
        })
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and currencies payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const currency = await currencyModel.create(currencyA)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Currencies fetch successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.currencies[0].logo).toBe(currency.logo)
        expect(body.data.currencies[0].name).toBe(currency.name)
        expect(body.data.currencies[0].symbol).toBe(currency.symbol)
      })
    })
  })
})
