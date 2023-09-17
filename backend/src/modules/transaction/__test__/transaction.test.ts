import transactionModel from '../../../modules/transaction/transaction.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { depositB, depositB_id } from '../../deposit/__test__/deposit.payload'
import { HttpResponseStatus } from '../../http/http.enum'
import { adminA, userA } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import userModel from '../../user/user.model'
import { transactionA } from './transaction.payload'
import { IUser } from '../../user/user.interface'
import { ITransaction } from '../transaction.interface'
import { Types } from 'mongoose'

describe('transaction', () => {
  const baseUrl = '/api/transaction'
  describe('get user transactions', () => {
    // const url = `${baseUrl}/:userid`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = `${baseUrl}`
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of the user transaction', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        await transactionModel.create(transactionA)

        await transactionModel.create({
          ...transactionA,
          user: user._id,
          environment: UserEnvironment.DEMO,
        })

        await transactionModel.create({ ...transactionA, user: user._id })

        const url = `${baseUrl}`
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transactions.length).toBe(1)
      })
    })
  })
  describe('get all users transactions', () => {
    const url = `${baseUrl}/all`
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
    describe('on success entry', () => {
      it('should return an array of all users transactions', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
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
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transactions.length).toBe(1)
      })
    })
  })
  describe('get user demo transactions', () => {
    // const url = `${baseUrl}/demo/:userid`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = `${baseUrl}/demo`
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of the user transaction', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        await transactionModel.create(transactionA)

        await transactionModel.create({
          ...transactionA,
          user: user._id,
          environment: UserEnvironment.DEMO,
        })

        await transactionModel.create({ ...transactionA, user: user._id })

        const url = `${baseUrl}/demo`
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transactions.length).toBe(1)
      })
    })
  })
  describe('get all users demo transactions', () => {
    const url = `${baseUrl}/demo/all`
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
    describe('on success entry', () => {
      it('should return an array of all users transactions', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
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
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transactions.length).toBe(1)
      })
    })
  })
  describe('delete a transaction', () => {
    // const url = `${baseUrl}/delete/:transactionId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const url = `${baseUrl}/delete/transactionId`
        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given transation those not exist', () => {
      it('should return a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = `${baseUrl}/delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('it should delete the transaction', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const transaction = await transactionModel.create(transactionA)

        let transactionsCount = await transactionModel.count()

        expect(transactionsCount).toBe(1)

        const url = `${baseUrl}/delete/${transaction._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transaction deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        transactionsCount = await transactionModel.count()
        expect(transactionsCount).toBe(0)
      })
    })
  })

  describe('force update status', () => {
    const url = `${baseUrl}/force-update-status`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given inputs are not valid', () => {
      it('should return a 400 error', async () => {
        const payload = {
          transactionId: new Types.ObjectId().toString(),
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"status" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given status is not valid', () => {
      it('should return a 400 error', async () => {
        const payload = {
          transactionId: new Types.ObjectId().toString(),
          status: 'invalid status',
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          '"status" must be one of [credited, pending, verifield, failed, awaiting approval, approved, successful, reversed]'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given transation those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          transactionId: new Types.ObjectId().toString(),
          status: 'failed',
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return the transaction payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const transaction = await transactionModel.create(transactionA)

        const payload = {
          transactionId: transaction._id,
          status: 'failed',
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Transaction status updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transaction.status).toBe(payload.status)
      })
    })
  })

  describe('force update amount', () => {
    const url = `${baseUrl}/force-update-amount`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given inputs are not valid', () => {
      it('should return a 400 error', async () => {
        const payload = {
          transactionId: new Types.ObjectId().toString(),
          status: 'successful',
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"amount" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given status is not valid', () => {
      it('should return a 400 error', async () => {
        const payload = {
          transactionId: new Types.ObjectId().toString(),
          status: 'invalid status',
          amount: 1000,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          '"status" must be one of [credited, pending, verifield, failed, awaiting approval, approved, successful, reversed]'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given transation those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          transactionId: new Types.ObjectId().toString(),
          status: 'failed',
          amount: 1000,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return the transaction payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const transaction = await transactionModel.create(transactionA)

        const payload = {
          transactionId: transaction._id,
          status: 'failed',
          amount: 1000,
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Transaction amount updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transaction.status).toBe(payload.status)
        expect(body.data.transaction.amount).toBe(payload.amount)
      })
    })
  })
})
