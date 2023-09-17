import failedTransactionModel from '../../../modules/failedTransaction/failedTransaction.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import { adminA, userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { failedTransactionA } from './failedTransaction.payload'
import { FailedTransactionStatus } from '../failedTransaction.enum'
import { IFailedTransaction } from '../failedTransaction.interface'
import { IUser } from '../../user/user.interface'
import { Types } from 'mongoose'

describe('failed transaction', () => {
  const baseUrl = '/api/failed-transaction/'
  describe('get one failed transaction', () => {
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${baseUrl}${'anyId'}`

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
    describe('given provded id those not exist', () => {
      it('should return a 404', async () => {
        const url = `${baseUrl}${new Types.ObjectId().toString()}`

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Failed transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given the valid details', () => {
      it('should return a failed transaction payload', async () => {
        const failedTransaction = await failedTransactionModel.create(
          failedTransactionA
        )

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = `${baseUrl}${failedTransaction._id}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Failed transaction fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.failedTransaction._id).toBe(
          failedTransaction._id.toString()
        )
        expect(body.data.failedTransaction.collectionName).toBe(
          failedTransaction.collectionName
        )
        expect(body.data.failedTransaction.message).toBe(
          failedTransaction.message
        )
        expect(body.data.failedTransaction.status).toBe(
          failedTransaction.status
        )
      })
    })
  })

  describe('get all failed transaction', () => {
    const url = `${baseUrl}all`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
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
    describe('given the valid details', () => {
      it('should return an empty array of failed transactions', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Failed transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.failedTransactions).toEqual([])
      })
    })
    describe('given the valid details', () => {
      it('should return an array of failed transactions', async () => {
        const failedTransaction = await failedTransactionModel.create(
          failedTransactionA
        )

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Failed transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.failedTransactions[0]._id).toBe(
          failedTransaction._id.toString()
        )
        expect(body.data.failedTransactions[0].collectionName).toBe(
          failedTransaction.collectionName
        )
        expect(body.data.failedTransactions[0].message).toBe(
          failedTransaction.message
        )
        expect(body.data.failedTransactions[0].status).toBe(
          failedTransaction.status
        )
      })
    })
  })
  describe('update status of failed transaction', () => {
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${baseUrl}update-status/${'anyId'}`

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given provided status those not exsit', () => {
      it('should return a 400', async () => {
        const failedTransaction = await failedTransactionModel.create(
          failedTransactionA
        )

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = `${baseUrl}update-status/${failedTransaction._id}`

        const payload = {
          status: 'unknown status',
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"status" must be one of [success, failed]')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given provded id those not exist', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = `${baseUrl}update-status/${new Types.ObjectId().toHexString()}`

        const payload = {
          status: FailedTransactionStatus.SUCCESS,
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Failed transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given the valid details', () => {
      it('should return a failed transaction payload', async () => {
        const failedTransaction = await failedTransactionModel.create(
          failedTransactionA
        )

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = `${baseUrl}update-status/${failedTransaction._id}`

        const status = FailedTransactionStatus.SUCCESS

        const payload = {
          status,
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'Failed transaction status updated successfully'
        )
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.failedTransaction.status).toBe(status)
      })
    })
  })
  describe('delete a failed transaction', () => {
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${baseUrl}delete/${'anyId'}`

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given provded id those not exist', () => {
      it('should return a 404', async () => {
        const url = `${baseUrl}delete/${new Types.ObjectId().toString()}`

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Failed transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given the valid details', () => {
      it('should return a failed transaction payload', async () => {
        const failedTransaction = await failedTransactionModel.create(
          failedTransactionA
        )

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = `${baseUrl}delete/${failedTransaction._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Failed transaction deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.failedTransaction._id).toBe(
          failedTransaction._id.toString()
        )
        expect(body.data.failedTransaction.collectionName).toBe(
          failedTransaction.collectionName
        )
        expect(body.data.failedTransaction.message).toBe(
          failedTransaction.message
        )
        expect(body.data.failedTransaction.status).toBe(
          failedTransaction.status
        )
      })
    })
  })
})
