import { userBInput } from './../../user/__test__/user.payload'
import Helpers from '../../../utils/helpers'
import { createNotificationMock } from './../../notification/__test__/notification.mock'
import { createTransactionMock } from './../../transaction/__test__/transaction.mock'
import depositModel from '../../../modules/deposit/deposit.model'
import {
  NotificationTitle,
  NotificationForWho,
} from './../../notification/notification.enum'
import { TransactionTitle } from './../../transaction/transaction.enum'
import { DepositStatus } from '../../../modules/deposit/deposit.enum'
import { depositMethodA_id } from './../../depositMethod/__test__/depositMethod.payload'
import { request } from '../../../test'
import {
  userA,
  userA_id,
  userB_id,
  userAObj,
  userBObj,
  userAInput,
  adminAInput,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { fetchDepositMethodMock } from '../../depositMethod/__test__/depositMethod.mock'
import {
  depositA,
  depositA_id,
  depositB_id,
  depositAObj,
  depositB,
  depositBObj,
} from './deposit.payload'
import { fundUserMock } from '../../user/__test__/user.mock'
import { UserAccount, UserEnvironment } from '../../user/user.enum'
import { createReferralMock } from '../../referral/__test__/referral.mock'

import { ReferralTypes } from '../../referral/referral.enum'
import { Types } from 'mongoose'
import { StatusCode } from '../../../core/apiResponse'
import Cryptograph from '../../../core/cryptograph'
import { DepositMethodStatus } from '../../depositMethod/depositMethod.enum'
import { IControllerRoute } from '../../../core/utils'
import { depositController } from '../../../setup'

describe('deposit', () => {
  const baseUrl = '/api/deposit/'
  const masterUrl = '/api/master/deposit/'
  describe('Validate routes', () => {
    const routes = depositController.routes as IControllerRoute[]
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
  describe('create deposit', () => {
    const url = baseUrl + 'create'
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {}
        const { statusCode, body } = await request.post(url).send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          depositMethodId: depositMethodA_id,
        }

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"amount" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given deposit method those not exits', () => {
      it('should throw a 404 error', async () => {
        const id = new Types.ObjectId().toString()
        const payload = {
          depositMethodId: id,
          amount: 30,
        }

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchDepositMethodMock).toHaveBeenCalledTimes(1)
        expect(fetchDepositMethodMock).toHaveBeenCalledWith({
          _id: id,
          status: DepositMethodStatus.ENABLED,
        })
      })
    })
    describe('given deposit amount is lower than min deposit of selected method', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          depositMethodId: depositMethodA_id,
          amount: 30,
        }

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'Amount is lower than the min deposit of the selected deposit method'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchDepositMethodMock).toHaveBeenCalledTimes(1)
        expect(fetchDepositMethodMock).toHaveBeenCalledWith({
          _id: depositMethodA_id.toString(),
          status: DepositMethodStatus.ENABLED,
        })
      })
    })
    describe('given all validations passed', () => {
      it('should return a 201 and the deposit payload', async () => {
        const payload = {
          depositMethodId: depositMethodA_id,
          amount: 40,
        }

        const user = await userModel.create(userAInput)
        const { ...userA1 } = userA

        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit registered successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.deposit.amount).toBe(payload.amount)
        expect(body.data.deposit.user._id).toBe(user._id.toString())

        const depositCount = await depositModel.count({
          _id: body.data.deposit._id,
          amount: body.data.deposit.amount,
          depositMethod: payload.depositMethodId,
        })

        expect(depositCount).toBe(1)

        expect(fetchDepositMethodMock).toHaveBeenCalledTimes(1)
        expect(fetchDepositMethodMock).toHaveBeenCalledWith({
          _id: depositMethodA_id.toString(),
          status: DepositMethodStatus.ENABLED,
        })

        expect(createNotificationMock).toHaveBeenCalledTimes(1)
        expect(createNotificationMock).toHaveBeenCalledWith(
          `${user.username} just made a deposit request of ${Helpers.toDollar(
            payload.amount
          )} awaiting for your approval`,
          NotificationTitle.DEPOSIT_MADE,
          expect.any(Object),
          NotificationForWho.ADMIN,
          UserEnvironment.LIVE
        )
      })
    })
  })

  describe('update deposit status', () => {
    // const url = masterUrl + `update-status/${}`

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const payload = {
          status: '',
        }

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

    describe('given payload is not valid', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const payload = {
          status: '',
        }

        const url = masterUrl + `update-status/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"status" must be one of [verified, failed]')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given all validations passed', () => {
      describe('given status was cancelled', () => {
        it('should execute 3 transactions', async () => {
          const admin = await userModel.create(adminAInput)
          const user = await userModel.create({ ...userAInput, _id: userA_id })

          const token = Cryptograph.createToken(admin)

          const deposit = await depositModel.create({
            ...depositA,
            _id: depositA_id,
            user: user._id,
          })

          const status = DepositStatus.CANCELLED

          const payload = {
            status,
          }

          const url = masterUrl + `update-status/${deposit._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)
          expect(body.data.deposit.status).toBe(status)
          expect(body.data.deposit._id).toBe(deposit._id.toString())

          const depositCount = await depositModel.count({
            _id: body.data.deposit._id,
            status: DepositStatus.CANCELLED,
          })

          expect(depositCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(0)

          expect(createReferralMock).toHaveBeenCalledTimes(0)

          expect(createTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionMock).toHaveBeenCalledWith(
            expect.objectContaining({ _id: userA_id }),
            TransactionTitle.DEPOSIT_FAILED,
            expect.any(Object),
            deposit.amount,
            UserEnvironment.LIVE
          )

          expect(createNotificationMock).toHaveBeenCalledTimes(1)
          expect(createNotificationMock).toHaveBeenCalledWith(
            `Your deposit of ${Helpers.toDollar(
              depositAObj.amount
            )} was not successful`,
            NotificationTitle.DEPOSIT_FAILED,
            expect.objectContaining({ _id: deposit._id }),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            expect.any(Object)
          )
        })
      })
      describe('given status was approved but no referrer', () => {
        it('should return a 200 and the deposit payload', async () => {
          const admin = await userModel.create(adminAInput)
          const token = Cryptograph.createToken(admin)

          const deposit = await depositModel.create({
            ...depositA,
            _id: depositA_id,
          })

          await userModel.create({ ...userAInput, _id: userA_id })

          const status = DepositStatus.APPROVED

          const payload = {
            status,
          }

          const url = masterUrl + `update-status/${deposit._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)
          expect(body.data.deposit._id).toBe(deposit._id.toString())
          expect(body.data.deposit.status).toBe(status)

          const depositCount = await depositModel.count({
            _id: body.data.deposit._id,
            status: body.data.deposit.status,
          })

          expect(depositCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(1)
          expect(fundUserMock).toHaveBeenCalledWith(
            { _id: depositAObj.user },
            UserAccount.MAIN_BALANCE,
            depositAObj.amount - depositAObj.fee
          )

          expect(createReferralMock).toHaveBeenCalledTimes(1)

          expect(createTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionMock).toHaveBeenCalledWith(
            expect.objectContaining({ _id: userA_id }),
            TransactionTitle.DEPOSIT_SUCCESSFUL,
            expect.any(Object),
            deposit.amount,
            UserEnvironment.LIVE
          )

          expect(createNotificationMock).toHaveBeenCalledTimes(1)
          expect(createNotificationMock).toHaveBeenCalledWith(
            `Your deposit of ${Helpers.toDollar(
              depositAObj.amount
            )} was successful`,
            NotificationTitle.DEPOSIT_SUCCESSFUL,
            expect.objectContaining({ _id: deposit._id }),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            userAObj
          )
        })
      })
      describe('given status was approved and there is a referrer', () => {
        it('should return a 200 and the deposit payload', async () => {
          const admin = await userModel.create(adminAInput)
          const token = Cryptograph.createToken(admin)

          await userModel.create({ ...userBInput, _id: userB_id })

          const deposit = await depositModel.create({
            ...depositB,
            _id: depositB_id,
          })

          const status = DepositStatus.APPROVED

          const payload = {
            status,
          }

          const url = masterUrl + `update-status/${deposit._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)
          expect(body.data.deposit._id).toBe(deposit._id.toString())
          expect(body.data.deposit.status).toBe(status)

          const depositCount = await depositModel.count({
            _id: body.data.deposit._id,
            status: body.data.deposit.status,
          })

          expect(depositCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(1)
          expect(fundUserMock.mock.calls[0]).toEqual([
            { _id: depositBObj.user },
            UserAccount.MAIN_BALANCE,
            depositBObj.amount - depositBObj.fee,
          ])

          expect(createReferralMock).toHaveBeenCalledTimes(1)

          expect(createReferralMock).toHaveBeenCalledWith(
            ReferralTypes.DEPOSIT,
            userBObj,
            deposit.amount
          )

          expect(createTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionMock).toHaveBeenCalledWith(
            expect.objectContaining({ _id: userB_id }),
            TransactionTitle.DEPOSIT_SUCCESSFUL,
            expect.any(Object),
            deposit.amount,
            UserEnvironment.LIVE
          )

          expect(createNotificationMock).toHaveBeenCalledTimes(1)

          expect(createNotificationMock).toHaveBeenCalledWith(
            `Your deposit of ${Helpers.toDollar(
              depositBObj.amount
            )} was successful`,
            NotificationTitle.DEPOSIT_SUCCESSFUL,
            expect.objectContaining({ _id: deposit._id }),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            userBObj
          )
        })
      })
    })
  })

  describe('delete deposit', () => {
    // const url = masterUrl + `delete/:depositId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = masterUrl + `delete/depositId`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given deposit id those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given deposit has not been settled', () => {
      it('should return a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const deposit = await depositModel.create(depositA)

        const url = masterUrl + `delete/${deposit._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the deposit payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const deposit = await depositModel.create({
          ...depositA,
          status: DepositStatus.APPROVED,
        })

        const url = masterUrl + `delete/${deposit._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit transcation deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        const depositCount = await depositModel.count()

        expect(depositCount).toBe(0)
      })
    })
  })

  describe('get all users deposit transactions', () => {
    const url = masterUrl

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
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
      it('should return a 200 and an empty array of deposit payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          deposits: [],
        })

        const depositCounts = await depositModel.count()

        expect(depositCounts).toBe(0)
      })
      it('should return a 200 and an array of deposit payload', async () => {
        const admin = await userModel.create(adminAInput)
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(admin)
        const deposit = await depositModel.create({
          ...depositA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.deposits.length).toBe(1)
        expect(body.data.deposits[0].amount).toBe(deposit.amount)
        expect(body.data.deposits[0].status).toBe(deposit.status)
        expect(body.data.deposits[0].user._id).toBe(user._id.toString())
        expect(body.data.deposits[0].user.username).toBe(user.username)

        const depositCounts = await depositModel.count()

        expect(depositCounts).toBe(1)
      })
    })
  })

  describe('get current user deposit transaction', () => {
    const url = baseUrl
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the an empty array of deposit payload', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.deposits).toEqual([])
      })

      it('should return a 200 and the an array of deposit payload', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const deposit = await depositModel.create({
          ...depositA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit transactions fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.deposits.length).toBe(1)
        expect(body.data.deposits[0].amount).toBe(deposit.amount)
        expect(body.data.deposits[0].status).toBe(deposit.status)
      })
    })
  })
})
