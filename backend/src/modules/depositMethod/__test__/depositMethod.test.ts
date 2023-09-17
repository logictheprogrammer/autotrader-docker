import { DepositMethodStatus } from '../../../modules/depositMethod/depositMethod.enum'
import depositMethodModel from '../../../modules/depositMethod/depositMethod.model'
import { request } from '../../../test'
import { adminA, userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import {
  depositMethodA,
  depositMethodB,
  depositMethodC,
  depositMethodUpdated,
} from './depositMethod.payload'
import { currencyA_id } from '../../currency/__test__/currency.payload'
import { getCurrencyMock } from '../../currency/__test__/currency.mock'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import { IUser } from '../../user/user.interface'
import { IDepositMethod } from '../depositMethod.interface'
import { Types } from 'mongoose'

describe('deposit method', () => {
  const baseUrl = '/api/deposit-method/'
  describe('create deposit method', () => {
    const url = baseUrl + 'create'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodA.network,
          fee: depositMethodA.fee,
          minDeposit: depositMethodA.minDeposit,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"address" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given fee is greater than min deposit', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodA.network,
          fee: 10,
          minDeposit: 5,
          address: depositMethodA.address,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Min deposit must be greater than the fee')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given currency those not exist', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          currencyId: new Types.ObjectId(),
          network: depositMethodA.network,
          fee: depositMethodA.fee,
          minDeposit: depositMethodA.minDeposit,
          address: depositMethodA.address,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Currency not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(getCurrencyMock).toHaveBeenCalledTimes(1)
        expect(getCurrencyMock).toHaveBeenCalledWith(
          payload.currencyId.toString()
        )
      })
    })

    describe('given deposit method already exist', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodA.network,
          fee: depositMethodA.fee,
          minDeposit: depositMethodA.minDeposit,
          address: depositMethodA.address,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('This deposit method already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const depositMethodCounts = await depositMethodModel.count()

        expect(depositMethodCounts).toBe(1)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 201', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodA.network,
          fee: depositMethodA.fee,
          minDeposit: depositMethodA.minDeposit,
          address: depositMethodA.address,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method added successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.depositMethod.network).toBe(
          depositMethodA.network.toString()
        )

        expect(getCurrencyMock).toHaveBeenCalledTimes(1)
        expect(getCurrencyMock).toHaveBeenCalledWith(
          payload.currencyId.toString()
        )

        const depositMethodCounts = await depositMethodModel.count()

        expect(depositMethodCounts).toBe(1)
      })
    })
  })

  describe('update status of deposit method', () => {
    const url = baseUrl + 'update-status'
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
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          depositMethodId: new Types.ObjectId(),
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

    describe('given deposit method those not exist', () => {
      it('should throw a 404 error', async () => {
        await depositMethodModel.create(depositMethodA)

        const payload = {
          depositMethodId: new Types.ObjectId(),
          status: DepositMethodStatus.DISABLED,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const depositMethodCounts = await depositMethodModel.count()

        expect(depositMethodCounts).toBe(1)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200', async () => {
        const dm = await depositMethodModel.create(depositMethodA)

        const payload = {
          depositMethodId: dm._id,
          status: DepositMethodStatus.DISABLED,
        }

        let depositMethodCounts: number

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Status updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.depositMethod.network).toBe(
          depositMethodA.network.toString()
        )
        expect(body.data.depositMethod.status).toBe(payload.status)

        depositMethodCounts = await depositMethodModel.count({
          status: DepositMethodStatus.ENABLED,
        })

        expect(depositMethodCounts).toBe(0)

        depositMethodCounts = await depositMethodModel.count({
          status: DepositMethodStatus.DISABLED,
        })

        expect(depositMethodCounts).toBe(1)

        // secondly
        // /////////////////////////
        const payload2 = {
          depositMethodId: dm._id,
          status: DepositMethodStatus.ENABLED,
        }

        const { statusCode: statusCode2, body: body2 } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload2)

        expect(body2.message).toBe('Status updated successfully')
        expect(statusCode2).toBe(200)
        expect(body2.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body2.data.depositMethod.network).toBe(
          depositMethodA.network.toString()
        )
        expect(body2.data.depositMethod.status).toBe(payload2.status)

        depositMethodCounts = await depositMethodModel.count({
          status: DepositMethodStatus.ENABLED,
        })

        expect(depositMethodCounts).toBe(1)

        depositMethodCounts = await depositMethodModel.count({
          status: DepositMethodStatus.DISABLED,
        })

        expect(depositMethodCounts).toBe(0)
      })
    })
  })

  describe('update price', () => {
    const url = baseUrl + 'update-price'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {
          depositMethodId: new Types.ObjectId().toString(),
          price: 200,
        }
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
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const payload = {
          depositMethodId: new Types.ObjectId().toString(),
          price: '',
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"price" must be a number')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given depositMethod those not exist', () => {
      it('should throw a 404 not found', async () => {
        await depositMethodModel.create(depositMethodA)
        const payload = {
          depositMethodId: new Types.ObjectId().toString(),
          price: 1000,
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const depositMethodCount = await depositMethodModel.count()

        expect(depositMethodCount).toBe(1)
      })
    })
    describe('given deposit method is in auto mode', () => {
      it('should return a 400 error', async () => {
        const depositMethod = await depositMethodModel.create(depositMethodA)

        const payload = {
          depositMethodId: depositMethod._id,
          price: 1000,
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'Can not update a deposit method price that is on auto update mode'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const depositMethodCount = await depositMethodModel.count()

        expect(depositMethodCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and depositMethod payload', async () => {
        const depositMethod = await depositMethodModel.create({
          ...depositMethodA,
          autoUpdate: false,
        })

        const payload = {
          depositMethodId: depositMethod._id,
          price: 1000,
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method price updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          depositMethod: {
            ...depositMethodA,
            autoUpdate: false,
            price: 1000,
            __v: expect.any(Number),
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const depositMethodCount = await depositMethodModel.count()

        expect(depositMethodCount).toBe(1)
      })
    })
  })

  describe('update mode', () => {
    const url = baseUrl + 'update-mode'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {
          depositMethodId: new Types.ObjectId().toString(),
          autoUpdate: true,
        }
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
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const payload = {
          depositMethodId: new Types.ObjectId().toString(),
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"autoUpdate" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given depositMethod those not exist', () => {
      it('should throw a 404 not found', async () => {
        await depositMethodModel.create(depositMethodA)
        const payload = {
          depositMethodId: new Types.ObjectId().toString(),
          autoUpdate: false,
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const depositMethodCount = await depositMethodModel.count()

        expect(depositMethodCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and depositMethod payload', async () => {
        const depositMethod = await depositMethodModel.create(depositMethodA)

        const payload = {
          depositMethodId: depositMethod._id,
          autoUpdate: false,
        }
        const payload2 = {
          depositMethodId: depositMethod._id,
          autoUpdate: true,
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'Deposit method price updating is now on manual mode'
        )
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          depositMethod: {
            ...depositMethodA,
            autoUpdate: false,
            __v: expect.any(Number),
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const { statusCode: statusCode2, body: body2 } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload2)

        expect(body2.message).toBe(
          'Deposit method price updating is now on auto mode'
        )
        expect(statusCode2).toBe(200)
        expect(body2.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body2.data).toEqual({
          depositMethod: {
            ...depositMethodA,
            autoUpdate: true,
            __v: expect.any(Number),
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const depositMethodCount = await depositMethodModel.count()

        expect(depositMethodCount).toBe(1)
      })
    })
  })

  describe('update deposit method', () => {
    const url = baseUrl + 'update'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          depositMethodId: new Types.ObjectId(),
          currencyId: currencyA_id,
          network: depositMethodUpdated.network,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"address" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given fee is greater than min deposit', () => {
      it('should throw a 400 error', async () => {
        await depositMethodModel.create(depositMethodA)
        const payload = {
          depositMethodId: new Types.ObjectId(),
          currencyId: currencyA_id,
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: 10,
          minDeposit: 9,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Min deposit must be greater than the fee')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given deposit method those not exist', () => {
      it('should throw a 404 error', async () => {
        await depositMethodModel.create(depositMethodA)
        const payload = {
          depositMethodId: new Types.ObjectId(),
          currencyId: currencyA_id,
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given currency those not exist', () => {
      it('should throw a 404 error', async () => {
        const dm = await depositMethodModel.create(depositMethodA)
        const payload = {
          depositMethodId: dm._id,
          currencyId: new Types.ObjectId(),
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Currency not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given deposit method already exist', () => {
      it('should throw a 404 error', async () => {
        const dm = await depositMethodModel.create(depositMethodA)
        const payload = {
          depositMethodId: dm._id,
          currencyId: currencyA_id,
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
        }
        await depositMethodModel.create({ ...depositMethodA, ...payload })

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('This deposit method already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const depositMethodCounts = await depositMethodModel.count()

        expect(depositMethodCounts).toBe(2)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and updated deposit method', async () => {
        const dm = await depositMethodModel.create(depositMethodA)
        const payload = {
          depositMethodId: dm._id,
          currencyId: currencyA_id,
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        body.data.depositMethod.currencyObject = null
        expect(body.data.depositMethod).toEqual({
          ...depositMethodA,
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
          currencyObject: null,
          __v: expect.any(Number),
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          status: DepositMethodStatus.ENABLED,
        })
      })
    })
  })

  describe('get all deposit methods', () => {
    const url = baseUrl + 'master'
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
    describe('given all validations passed', () => {
      it('should return a 200 and an empty array', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit method fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          depositMethods: [],
        })
      })
      it('should return a 200 and array', async () => {
        await depositMethodModel.create(depositMethodA)
        await depositMethodModel.create(depositMethodB)
        await depositMethodModel.create({
          ...depositMethodC,
          status: DepositMethodStatus.DISABLED,
        })

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit method fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          depositMethods: [
            {
              ...depositMethodA,
              __v: expect.any(Number),
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
            {
              ...depositMethodB,
              __v: expect.any(Number),
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
            {
              ...depositMethodC,
              __v: expect.any(Number),
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              status: DepositMethodStatus.DISABLED,
            },
          ],
        })
      })
    })
  })

  describe('get enabled deposit methods', () => {
    const url = baseUrl
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized error', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and an empty array', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit method fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          depositMethods: [],
        })
      })
      it('should return a 200 and array', async () => {
        await depositMethodModel.create(depositMethodA)
        await depositMethodModel.create(depositMethodB)
        await depositMethodModel.create({
          ...depositMethodC,
          status: DepositMethodStatus.DISABLED,
        })

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit method fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          depositMethods: [
            {
              ...depositMethodA,
              __v: expect.any(Number),
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
            {
              ...depositMethodB,
              __v: expect.any(Number),
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          ],
        })
      })
    })
  })

  describe('delete deposit method', () => {
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = `${baseUrl}delete/id`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given deposit method those not exist', () => {
      it('should return a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const depositMethod = await depositMethodModel.create(depositMethodA)

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}delete/${depositMethod._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit method deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        const depositMethodCount = await depositMethodModel.count()

        expect(depositMethodCount).toBe(0)
      })
    })
  })
})
