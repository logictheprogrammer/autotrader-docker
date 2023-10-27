import { WithdrawalMethodStatus } from '../../../modules/withdrawalMethod/withdrawalMethod.enum'
import withdrawalMethodModel from '../../../modules/withdrawalMethod/withdrawalMethod.model'
import { request } from '../../../test'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import {
  withdrawalMethodA,
  withdrawalMethodB,
  withdrawalMethodC,
  withdrawalMethodUpdated,
} from './withdrawalMethod.payload'
import { currencyA_id } from '../../currency/__test__/currency.payload'
import { fetchCurrencyMock } from '../../currency/__test__/currency.mock'
import { Types } from 'mongoose'
import Cryptograph from '../../../core/cryptograph'
import { StatusCode } from '../../../core/apiResponse'

describe('withdrawal method', () => {
  const baseUrl = '/api/withdrawal-method/'
  const masterUrl = '/api/master/withdrawal-method/'
  describe('create withdrawal method', () => {
    const url = masterUrl + 'create'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodA.network,
          minWithdrawal: withdrawalMethodA.minWithdrawal,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"fee" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given fee is greater than min withdrawal', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodA.network,
          fee: 10,
          minWithdrawal: 5,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Min withdrawal must be greater than the fee')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given currency those not exist', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          currencyId: new Types.ObjectId().toString(),
          network: withdrawalMethodA.network,
          fee: withdrawalMethodA.fee,
          minWithdrawal: withdrawalMethodA.minWithdrawal,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Currency not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
        expect(fetchCurrencyMock).toHaveBeenCalledTimes(1)
        expect(fetchCurrencyMock).toHaveBeenCalledWith({
          _id: payload.currencyId,
        })
      })
    })
    describe('given withdrawal method already exist', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodA.network,
          fee: withdrawalMethodA.fee,
          minWithdrawal: withdrawalMethodA.minWithdrawal,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('This withdrawal method already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)

        const withdrawalMethodCounts = await withdrawalMethodModel.count()

        expect(withdrawalMethodCounts).toBe(1)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 201', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodA.network,
          fee: withdrawalMethodA.fee,
          minWithdrawal: withdrawalMethodA.minWithdrawal,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal method created successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.withdrawalMethod.network).toBe(payload.network)
        expect(body.data.withdrawalMethod.fee).toBe(payload.fee)
        expect(body.data.withdrawalMethod.minWithdrawal).toBe(
          payload.minWithdrawal
        )

        expect(fetchCurrencyMock).toHaveBeenCalledTimes(1)
        expect(fetchCurrencyMock).toHaveBeenCalledWith({
          _id: payload.currencyId.toString(),
        })

        const withdrawalMethodCounts = await withdrawalMethodModel.count({
          _id: body.data.withdrawalMethod._id,
        })

        expect(withdrawalMethodCounts).toBe(1)
      })
    })
  })

  describe('update status of withdrawal method', () => {
    // const url = masterUrl + `update-status/:withdrawalMethodId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = masterUrl + `update-status/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {}

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update-status/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"status" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given withdrawal method those not exist', () => {
      it('should throw a 404 error', async () => {
        await withdrawalMethodModel.create(withdrawalMethodA)

        const payload = {
          status: WithdrawalMethodStatus.DISABLED,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update-status/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        const withdrawalMethodCounts = await withdrawalMethodModel.count()

        expect(withdrawalMethodCounts).toBe(1)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200', async () => {
        const wm = await withdrawalMethodModel.create(withdrawalMethodA)

        const payload = {
          status: WithdrawalMethodStatus.DISABLED,
        }

        let withdrawalMethodCounts: number

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update-status/${wm._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Status updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.withdrawalMethod._id).toBe(wm._id.toString())
        expect(body.data.withdrawalMethod.status).toBe(payload.status)

        withdrawalMethodCounts = await withdrawalMethodModel.count({
          _id: wm._id,
          status: WithdrawalMethodStatus.ENABLED,
        })

        expect(withdrawalMethodCounts).toBe(0)

        withdrawalMethodCounts = await withdrawalMethodModel.count({
          _id: wm._id,
          status: WithdrawalMethodStatus.DISABLED,
        })

        expect(withdrawalMethodCounts).toBe(1)

        // secondly
        // /////////////////////////
        const payload2 = {
          status: WithdrawalMethodStatus.ENABLED,
        }

        const url2 = masterUrl + `update-status/${wm._id}`

        const { statusCode: statusCode2, body: body2 } = await request
          .patch(url2)
          .set('Authorization', `Bearer ${token}`)
          .send(payload2)

        expect(body2.message).toBe('Status updated successfully')
        expect(statusCode2).toBe(200)
        expect(body2.status).toBe(StatusCode.SUCCESS)

        expect(body2.data.withdrawalMethod._id).toBe(wm._id.toString())
        expect(body2.data.withdrawalMethod.status).toBe(payload2.status)

        withdrawalMethodCounts = await withdrawalMethodModel.count({
          status: WithdrawalMethodStatus.ENABLED,
          _id: wm._id,
        })

        expect(withdrawalMethodCounts).toBe(1)

        withdrawalMethodCounts = await withdrawalMethodModel.count({
          status: WithdrawalMethodStatus.DISABLED,
          _id: wm._id,
        })

        expect(withdrawalMethodCounts).toBe(0)
      })
    })
  })

  describe('update withdrawal method', () => {
    // const url = masterUrl + `update/:depositMethodId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = masterUrl + `update/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodUpdated.network,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"fee" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given fee is greater than min withdrawal', () => {
      it('should throw a 400 error', async () => {
        await withdrawalMethodModel.create(withdrawalMethodA)
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodUpdated.network,
          fee: 10,
          minWithdrawal: 9,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Min withdrawal must be greater than the fee')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given withdrawal method those not exist', () => {
      it('should throw a 404 error', async () => {
        await withdrawalMethodModel.create(withdrawalMethodA)
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodUpdated.network,
          fee: withdrawalMethodUpdated.fee,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given currency those not exist', () => {
      it('should throw a 404 error', async () => {
        const wm = await withdrawalMethodModel.create(withdrawalMethodA)
        const payload = {
          currencyId: new Types.ObjectId().toString(),
          network: withdrawalMethodUpdated.network,
          fee: withdrawalMethodUpdated.fee,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${wm._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Currency not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given withdrawal method already exist', () => {
      it('should throw a 404 error', async () => {
        const wm = await withdrawalMethodModel.create(withdrawalMethodA)
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodUpdated.network,
          fee: withdrawalMethodUpdated.fee,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
        }
        await withdrawalMethodModel.create({ ...withdrawalMethodA, ...payload })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${wm._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('This withdrawal method already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)

        const withdrawalMethodCounts = await withdrawalMethodModel.count()

        expect(withdrawalMethodCounts).toBe(2)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and updated withdrawal method', async () => {
        const wm = await withdrawalMethodModel.create(withdrawalMethodA)
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodUpdated.network,
          fee: withdrawalMethodUpdated.fee,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${wm._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal method updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.withdrawalMethod._id).toBe(wm._id.toString())
        expect(body.data.withdrawalMethod.network).toBe(payload.network)
        expect(body.data.withdrawalMethod.fee).toBe(payload.fee)
        expect(body.data.withdrawalMethod.minWithdrawal).toBe(
          payload.minWithdrawal
        )

        const withdrawalMethodCount = await withdrawalMethodModel.count({
          _id: wm._id,
          network: payload.network,
          fee: payload.fee,
          minWithdrawal: payload.minWithdrawal,
        })

        expect(withdrawalMethodCount).toBe(1)
      })
    })
  })

  describe('get all withdrawal methods', () => {
    const url = masterUrl
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
    describe('given all validations passed', () => {
      it('should return a 200 and an empty array', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal methods fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          withdrawalMethods: [],
        })
      })
      it('should return a 200 and array', async () => {
        const wm1 = await withdrawalMethodModel.create(withdrawalMethodA)
        const wm2 = await withdrawalMethodModel.create(withdrawalMethodB)
        const wm3 = await withdrawalMethodModel.create({
          ...withdrawalMethodC,
          status: WithdrawalMethodStatus.DISABLED,
        })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal methods fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          withdrawalMethods: [
            expect.objectContaining({
              _id: wm1._id.toString(),
            }),
            expect.objectContaining({
              _id: wm2._id.toString(),
            }),
            expect.objectContaining({
              _id: wm3._id.toString(),
            }),
          ],
        })
      })
    })
  })

  describe('get enabled withdrawal methods', () => {
    const url = baseUrl
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized error', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and an empty array', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal methods fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          withdrawalMethods: [],
        })
      })
      it('should return a 200 and array', async () => {
        const wm1 = await withdrawalMethodModel.create(withdrawalMethodA)
        const wm2 = await withdrawalMethodModel.create(withdrawalMethodB)
        const wm3 = await withdrawalMethodModel.create({
          ...withdrawalMethodC,
          status: WithdrawalMethodStatus.DISABLED,
        })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal methods fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          withdrawalMethods: [
            expect.objectContaining({
              _id: wm1._id.toString(),
            }),
            expect.objectContaining({
              _id: wm2._id.toString(),
            }),
          ],
        })
      })
    })
  })

  describe('delete withdrawal method', () => {
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const url = `${masterUrl}delete/id`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given withdrawal method those not exist', () => {
      it('should return a 404 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const withdrawalMethod = await withdrawalMethodModel.create(
          withdrawalMethodA
        )

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}delete/${withdrawalMethod._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal method deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        const withdrawalMethodCount = await withdrawalMethodModel.count()
        expect(withdrawalMethodCount).toBe(0)
      })
    })
  })
})
