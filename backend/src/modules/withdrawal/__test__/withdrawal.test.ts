import Helpers from '../../../utils/helpers'
import Cryptograph from '../../../core/cryptograph'
import { createNotificationMock } from './../../notification/__test__/notification.mock'
import {
  createTransactionMock,
  updateTransactionStatusMock,
} from './../../transaction/__test__/transaction.mock'
import withdrawalModel from '../../../modules/withdrawal/withdrawal.model'
import {
  NotificationCategory,
  NotificationForWho,
} from './../../notification/notification.enum'
import { TransactionCategory } from './../../transaction/transaction.enum'
import { WithdrawalStatus } from '../../../modules/withdrawal/withdrawal.enum'
import {
  withdrawalMethodA,
  withdrawalMethodA_id,
} from './../../withdrawalMethod/__test__/withdrawalMethod.payload'
import { request } from '../../../test'
import {
  adminAInput,
  userA,
  userAInput,
  userA_id,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { fetchWithdrawalMethodMock } from '../../withdrawalMethod/__test__/withdrawalMethod.mock'
import {
  withdrawalA,
  withdrawalA_id,
  withdrawalAObj,
} from './withdrawal.payload'

import { fundUserMock } from '../../user/__test__/user.mock'
import { UserAccount, UserEnvironment } from '../../user/user.enum'
import { Types } from 'mongoose'
import { StatusCode } from '../../../core/apiResponse'

describe('withdrawal', () => {
  const baseUrl = '/api/withdrawal/'
  const masterUrl = '/api/master/withdrawal/'
  describe('create withdrawal', () => {
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
          withdrawalMethodId: withdrawalMethodA_id,
          account: UserAccount.MAIN_BALANCE,
          address: '--updated wallet address--',
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

    describe('given withdrawal amount is lower than min withdrawal of selected method', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          withdrawalMethodId: withdrawalMethodA_id,
          account: UserAccount.MAIN_BALANCE,
          address: '--updated wallet address--',
          amount: 30,
        }

        const user = await userModel.create({ ...userAInput, _id: userA_id })
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'Amount is lower than the min withdrawal of the selected withdrawal method'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchWithdrawalMethodMock).toHaveBeenCalledTimes(1)
        expect(fetchWithdrawalMethodMock).toHaveBeenCalledWith({
          _id: withdrawalMethodA_id.toString(),
        })

        expect(fundUserMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 201 and the withdrawal payload', async () => {
        const payload = {
          withdrawalMethodId: withdrawalMethodA_id,
          account: UserAccount.MAIN_BALANCE,
          address: '--updated wallet address--',
          amount: 40,
        }

        const user = await userModel.create({ ...userAInput, _id: userA_id })
        const { ...userA1 } = userA

        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal registered successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.withdrawal.account).toBe(payload.account)
        expect(body.data.withdrawal.address).toBe(payload.address)
        expect(body.data.withdrawal.amount).toBe(payload.amount)

        const withdrawalCount = await withdrawalModel.count({
          _id: body.data.withdrawal._id,
        })
        expect(withdrawalCount).toBe(1)

        expect(fetchWithdrawalMethodMock).toHaveBeenCalledTimes(1)
        expect(fetchWithdrawalMethodMock).toHaveBeenCalledWith({
          _id: withdrawalMethodA_id.toString(),
        })

        expect(fundUserMock).toHaveBeenCalledTimes(1)
        expect(fundUserMock).toHaveBeenCalledWith(
          { _id: user._id },
          payload.account,
          -(payload.amount + withdrawalMethodA.fee)
        )

        expect(createTransactionMock).toHaveBeenCalledTimes(1)
        expect(createTransactionMock).toHaveBeenCalledWith(
          expect.objectContaining(userA1),
          WithdrawalStatus.PENDING,
          TransactionCategory.WITHDRAWAL,
          expect.any(Object),
          payload.amount,
          UserEnvironment.LIVE
        )

        expect(createNotificationMock).toHaveBeenCalledTimes(1)
        expect(createNotificationMock).toHaveBeenCalledWith(
          `${
            user.username
          } just made a withdrawal request of ${Helpers.toDollar(
            payload.amount
          )} awaiting for your approval`,
          NotificationCategory.WITHDRAWAL,
          expect.any(Object),
          NotificationForWho.ADMIN,
          WithdrawalStatus.PENDING,
          UserEnvironment.LIVE
        )
      })
    })
  })

  describe('update withdrawal status', () => {
    // const url = masterUrl + `update-status/:withdrawalId`

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

        expect(body.message).toBe('"status" must be one of [approved, failed]')
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

          const withdrawal = await withdrawalModel.create({
            ...withdrawalA,
            _id: withdrawalA_id,
            user: user._id,
          })

          const status = WithdrawalStatus.CANCELLED

          const payload = {
            status,
          }

          const url = masterUrl + `update-status/${withdrawal._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)
          expect(body.data.withdrawal._id).toBe(withdrawal._id.toString())
          expect(body.data.withdrawal.status).toBe(payload.status)

          const withdrawalCount = await withdrawalModel.count({
            _id: body.data.withdrawal._id,
            status: payload.status,
          })
          expect(withdrawalCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(1)
          expect(fundUserMock).toHaveBeenCalledWith(
            withdrawalAObj.user,
            UserAccount.MAIN_BALANCE,
            +(withdrawalAObj.amount + withdrawalAObj.fee)
          )

          expect(updateTransactionStatusMock).toHaveBeenCalledTimes(1)
          expect(updateTransactionStatusMock).toHaveBeenCalledWith(
            { category: withdrawalAObj._id },
            status
          )

          expect(createNotificationMock).toHaveBeenCalledTimes(1)
          expect(createNotificationMock).toHaveBeenCalledWith(
            `Your withdrawal of ${Helpers.toDollar(
              withdrawalAObj.amount
            )} was ${status}`,
            NotificationCategory.WITHDRAWAL,
            expect.objectContaining({
              _id: withdrawal._id,
            }),
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            expect.any(Object)
          )
        })
      })
      describe('given status was approved', () => {
        it('should return a 200 and the withdrawal payload', async () => {
          const admin = await userModel.create(adminAInput)
          const token = Cryptograph.createToken(admin)
          const user = await userModel.create({ ...userAInput, _id: userA_id })

          const withdrawal = await withdrawalModel.create({
            ...withdrawalA,
            _id: withdrawalA_id,
            user: user._id,
          })

          const status = WithdrawalStatus.APPROVED

          const payload = {
            status,
          }

          const url = masterUrl + `update-status/${withdrawal._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)
          expect(body.data.withdrawal._id).toBe(withdrawal._id.toString())
          expect(body.data.withdrawal.status).toBe(payload.status)

          const withdrawalCount = await withdrawalModel.count({
            _id: body.data.withdrawal._id,
            status: payload.status,
          })
          expect(withdrawalCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(0)

          expect(updateTransactionStatusMock).toHaveBeenCalledTimes(1)
          expect(updateTransactionStatusMock).toHaveBeenCalledWith(
            { category: withdrawalAObj._id },
            status
          )

          expect(createNotificationMock).toHaveBeenCalledTimes(1)
          expect(createNotificationMock).toHaveBeenCalledWith(
            `Your withdrawal of ${Helpers.toDollar(
              withdrawalAObj.amount
            )} was ${status}`,
            NotificationCategory.WITHDRAWAL,
            expect.objectContaining({
              _id: withdrawal._id,
            }),
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            expect.any(Object)
          )
        })
      })
    })
  })

  describe('delete withdrawal', () => {
    // const url = masterUrl + `delete/:withdrawalId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = masterUrl + `delete/withdrawalId`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given withdrawal id those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given deposit has not been settled', () => {
      it('should return a 400', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const withdrawal = await withdrawalModel.create(withdrawalA)

        const url = masterUrl + `delete/${withdrawal._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and the withdrawal payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const withdrawal = await withdrawalModel.create({
          ...withdrawalA,
          status: WithdrawalStatus.APPROVED,
        })

        const url = masterUrl + `delete/${withdrawal._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal transaction deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        const withdrawalCount = await withdrawalModel.count()
        expect(withdrawalCount).toBe(0)
      })
    })
  })

  describe('get all users withdrawal transactions', () => {
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
      it('should return a 200 and an empty array of withdrawal payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawals fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          withdrawals: [],
        })

        const withdrawalCounts = await withdrawalModel.count()

        expect(withdrawalCounts).toBe(0)
      })
      it('should return a 200 and an array of withdrawal payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        await userModel.create({ ...userAInput, _id: userA_id })
        const withdrawal = await withdrawalModel.create(withdrawalA)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawals fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.withdrawals.length).toBe(1)
        expect(body.data.withdrawals[0].account).toBe(withdrawal.account)
        expect(body.data.withdrawals[0].amount).toBe(withdrawal.amount)
        expect(body.data.withdrawals[0].status).toBe(withdrawal.status)
        expect(body.data.withdrawals[0].user._id).toBe(userA_id.toString())
        expect(body.data.withdrawals[0].user.username).toBe(userA.username)

        const withdrawalCounts = await withdrawalModel.count()

        expect(withdrawalCounts).toBe(1)
      })
    })
  })

  describe('get current user withdrawal transaction', () => {
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
      it('should return a 200 and the an empty array of withdrawal payload', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawals fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.withdrawals).toEqual([])
      })

      it('should return a 200 and the an array of withdrawal payload', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const withdrawal = await withdrawalModel.create({
          ...withdrawalA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawals fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.withdrawals.length).toBe(1)
        expect(body.data.withdrawals[0].account).toBe(withdrawal.account)
        expect(body.data.withdrawals[0].amount).toBe(withdrawal.amount)
        expect(body.data.withdrawals[0].status).toBe(withdrawal.status)
        expect(body.data.withdrawals[0].user._id).toBe(user._id.toString())
      })
    })
  })
})
