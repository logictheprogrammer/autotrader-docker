import { StatusCode } from '../../../core/apiResponse'
import Cryptograph from '../../../core/cryptograph'
import { IControllerRoute } from '../../../core/utils'
import transactionModel from '../../../modules/transaction/transaction.model'
import { transactionController } from '../../../setup'
import { request } from '../../../test'
import { depositB, depositB_id } from '../../deposit/__test__/deposit.payload'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import userModel from '../../user/user.model'
import { transactionA } from './transaction.payload'
import { Types } from 'mongoose'

describe('transaction', () => {
  const baseUrl = '/api/transaction'
  const demoUrl = '/api/demo/transaction'
  const masterUrl = '/api/master/transaction'
  const masterDemoUrl = '/api/master/demo/transaction'
  describe('Validate routes', () => {
    const routes = transactionController.routes as IControllerRoute[]
    it('should expect 5 routes', () => {
      expect(routes.length).toBe(5)
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
  describe('get all users transactions', () => {
    const url = `${masterUrl}/users`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
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
    describe('on success entry', () => {
      it('should return an array of all users transactions', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        await transactionModel.create(transactionA)
        await transactionModel.create({
          ...transactionA,
          category: depositB_id,
          categoryObject: depositB,
          environment: UserEnvironment.DEMO,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.transactions.length).toBe(1)
      })
    })
  })
  describe('get all users demo transactions', () => {
    const url = `${masterDemoUrl}/users`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
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
    describe('on success entry', () => {
      it('should return an array of all users transactions', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        await transactionModel.create(transactionA)
        await transactionModel.create({
          ...transactionA,
          environment: UserEnvironment.DEMO,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.transactions.length).toBe(1)
      })
    })
  })
  describe('delete a transaction', () => {
    // const url = `${baseUrl}/delete/:transactionId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = `${masterUrl}/delete/${new Types.ObjectId()}`
        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given transation those not exist', () => {
      it('should return a 404 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}/delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('it should delete the transaction', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const transaction = await transactionModel.create(transactionA)

        let transactionsCount = await transactionModel.count()

        expect(transactionsCount).toBe(1)

        const url = `${masterUrl}/delete/${transaction._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transaction deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        transactionsCount = await transactionModel.count()
        expect(transactionsCount).toBe(0)
      })
    })
  })
})
