import transactionModel from '../../../modules/transaction/transaction.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { depositB, depositB_id } from '../../deposit/__test__/deposit.payload'
import { HttpResponseStatus } from '../../http/http.enum'
import { adminA, userA } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import userModel from '../../user/user.model'
import { transactionA } from './transaction.payload'
import { Types } from 'mongoose'
import { IUser } from '../../user/user.interface'
import { ITransaction } from '../transaction.interface'
import AppRepository from '../../app/app.repository'

const userRepository = new AppRepository<IUser>(userModel)
const transactionRepository = new AppRepository<ITransaction>(transactionModel)

describe('transaction', () => {
  const baseUrl = '/api/transaction'
  describe('get user transactions', () => {
    // const url = `${baseUrl}/:userid`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = `${baseUrl}/userid`
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of the user transaction', async () => {
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        await transactionRepository.create(transactionA).save()

        await transactionRepository
          .create({
            ...transactionA,
            user: user._id,
            environment: UserEnvironment.DEMO,
          })
          .save()

        await transactionRepository
          .create({ ...transactionA, user: user._id })
          .save()

        const url = `${baseUrl}/${user._id}`
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transactions[0].environment).toBe(UserEnvironment.LIVE)
        expect(body.data.transactions.length).toBe(1)
      })
    })
  })
  describe('get all users transactions', () => {
    const url = `${baseUrl}/all`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userRepository.create(userA).save()
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)
        await transactionRepository.create(transactionA).save()
        await transactionRepository
          .create({
            ...transactionA,
            category: depositB_id,
            categoryObject: depositB,
            environment: UserEnvironment.DEMO,
          })
          .save()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transactions[0].environment).toBe(UserEnvironment.LIVE)
        expect(body.data.transactions.length).toBe(1)
      })
    })
  })
  describe('get user demo transactions', () => {
    // const url = `${baseUrl}/demo/:userid`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = `${baseUrl}/demo/userid`
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of the user transaction', async () => {
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        await transactionRepository.create(transactionA).save()

        await transactionRepository
          .create({
            ...transactionA,
            user: user._id,
            environment: UserEnvironment.DEMO,
          })
          .save()

        await transactionRepository
          .create({ ...transactionA, user: user._id })
          .save()

        const url = `${baseUrl}/demo/${user._id}`
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transactions[0].environment).toBe(UserEnvironment.DEMO)
        expect(body.data.transactions.length).toBe(1)
      })
    })
  })
  describe('get all users demo transactions', () => {
    const url = `${baseUrl}/demo/all`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userRepository.create(userA).save()
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)
        await transactionRepository.create(transactionA).save()
        await transactionRepository
          .create({
            ...transactionA,
            environment: UserEnvironment.DEMO,
          })
          .save()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transactions[0].environment).toBe(UserEnvironment.DEMO)
        expect(body.data.transactions.length).toBe(1)
      })
    })
  })
  describe('delete a transaction', () => {
    // const url = `${baseUrl}/delete/:transactionId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userRepository.create(userA).save()
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
        const admin = await userRepository.create(adminA).save()
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)
        const transaction = await transactionRepository
          .create(transactionA)
          .save()

        let transactionsCount = await transactionRepository.count()

        expect(transactionsCount).toBe(1)

        const url = `${baseUrl}/delete/${transaction._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transaction deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        transactionsCount = await transactionRepository.count()
        expect(transactionsCount).toBe(0)
      })
    })
  })

  describe('force update status', () => {
    const url = `${baseUrl}/force-update-status`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userRepository.create(userA).save()
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

        const admin = await userRepository.create(adminA).save()
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

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          '"status" must be one of [success, pending, approved, cancelled, successful, reversed]'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given transation those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          transactionId: new Types.ObjectId().toString(),
          status: 'cancelled',
        }

        const admin = await userRepository.create(adminA).save()
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const transaction = await transactionRepository
          .create(transactionA)
          .save()

        const payload = {
          transactionId: transaction._id,
          status: 'cancelled',
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

        const user = await userRepository.create(userA).save()
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
          status: 'success',
        }

        const admin = await userRepository.create(adminA).save()
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

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          '"status" must be one of [success, pending, approved, cancelled, successful, reversed]'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given transation those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          transactionId: new Types.ObjectId().toString(),
          status: 'cancelled',
          amount: 1000,
        }

        const admin = await userRepository.create(adminA).save()
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const transaction = await transactionRepository
          .create(transactionA)
          .save()

        const payload = {
          transactionId: transaction._id,
          status: 'cancelled',
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
