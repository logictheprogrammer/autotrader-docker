import { createTransactionNotificationMock } from './../../notification/__test__/notification.mock'
import {
  createTransactionTransactionMock,
  updateStatusTransactionTransactionMock,
} from './../../transaction/__test__/transaction.mock'
import withdrawalModel from '../../../modules/withdrawal/withdrawal.model'
import {
  NotificationCategory,
  NotificationForWho,
} from './../../notification/notification.enum'
import formatNumber from '../../../utils/formats/formatNumber'
import { TransactionCategory } from './../../transaction/transaction.enum'
import { WithdrawalStatus } from '../../../modules/withdrawal/withdrawal.enum'
import {
  withdrawalMethodA,
  withdrawalMethodA_id,
} from './../../withdrawalMethod/__test__/withdrawalMethod.payload'
import { request } from '../../../test'
import {
  adminA,
  userA,
  userA_id,
  userModelReturn,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { getWithdrawalMethodMock } from '../../withdrawalMethod/__test__/withdrawalMethod.mock'

import { executeTransactionManagerMock } from '../../transactionManager/__test__/transactionManager.mock'
import {
  withdrawalA,
  withdrawalA_id,
  withdrawalModelReturn,
  withdrawalAObj,
} from './withdrawal.payload'
import {
  createTransactionWithdrawalMock,
  updateStatusTransactionWithdrawalMock,
} from './withdrawal.mock'
import { HttpResponseStatus } from '../../http/http.enum'
import Encryption from '../../../utils/encryption'
import { transactionModelReturn } from '../../transaction/__test__/transaction.payload'
import { notificationModelReturn } from '../../notification/__test__/notification.payload'
import { fundTransactionUserMock } from '../../user/__test__/user.mock'
import { UserAccount, UserEnvironment } from '../../user/user.enum'

import Helpers from '../../../utils/helpers/helpers'
import { IUser } from '../../user/user.interface'
import { IWithdrawal } from '../withdrawal.interface'
import { ITransaction } from '../../transaction/transaction.interface'
import transactionModel from '../../transaction/transaction.model'
import { INotification } from '../../notification/notification.interface'
import notificationModel from '../../notification/notification.model'
import { Types } from 'mongoose'

describe('withdrawal', () => {
  const baseUrl = '/api/withdrawal/'
  describe('create withdrawal', () => {
    const url = baseUrl + 'create'
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {}
        const { statusCode, body } = await request.post(url).send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          withdrawalMethodId: withdrawalMethodA_id,
          account: UserAccount.MAIN_BALANCE,
          address: '--updated wallet address--',
        }

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"amount" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given withdrawal method those not exits', () => {
      it('should throw a 404 error', async () => {
        const id = new Types.ObjectId().toString()
        const payload = {
          withdrawalMethodId: id,
          account: UserAccount.MAIN_BALANCE,
          address: '--updated wallet address--',
          amount: 30,
        }

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getWithdrawalMethodMock).toHaveBeenCalledTimes(1)
        expect(getWithdrawalMethodMock).toHaveBeenCalledWith(id)

        expect(createTransactionWithdrawalMock).toHaveBeenCalledTimes(0)
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

        const user = await userModel.create({ ...userA, _id: userA_id })
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'Amount is lower than the min withdrawal of the selected withdrawal method'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getWithdrawalMethodMock).toHaveBeenCalledTimes(1)
        expect(getWithdrawalMethodMock).toHaveBeenCalledWith(
          withdrawalMethodA_id.toString()
        )

        expect(fundTransactionUserMock).toHaveBeenCalledTimes(0)

        expect(createTransactionWithdrawalMock).toHaveBeenCalledTimes(0)
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

        const user = await userModel.create({ ...userA, _id: userA_id })
        const { password: _, ...userA1 } = userA

        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal has been registered successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toMatchObject({
          withdrawal: { _id: withdrawalModelReturn._id },
        })

        expect(createTransactionWithdrawalMock).toHaveBeenCalledTimes(1)

        expect(getWithdrawalMethodMock).toHaveBeenCalledTimes(1)
        expect(getWithdrawalMethodMock).toHaveBeenCalledWith(
          withdrawalMethodA_id.toString()
        )

        expect(fundTransactionUserMock).toHaveBeenCalledTimes(1)
        expect(fundTransactionUserMock).toHaveBeenCalledWith(
          user._id,
          payload.account,
          -(payload.amount + withdrawalMethodA.fee),
          undefined
        )

        expect(createTransactionTransactionMock).toHaveBeenCalledTimes(1)
        expect(createTransactionTransactionMock).toHaveBeenCalledWith(
          expect.objectContaining(userA1),
          WithdrawalStatus.PENDING,
          TransactionCategory.WITHDRAWAL,
          expect.any(Object),
          payload.amount,
          UserEnvironment.LIVE,
          undefined
        )

        expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)
        expect(createTransactionNotificationMock).toHaveBeenCalledWith(
          `${
            user.username
          } just made a withdrawal request of ${formatNumber.toDollar(
            payload.amount
          )} awaiting for your approval`,
          NotificationCategory.WITHDRAWAL,
          expect.any(Object),
          NotificationForWho.ADMIN,
          WithdrawalStatus.PENDING,
          UserEnvironment.LIVE,
          undefined
        )

        const userInstance = {
          model: userModelReturn,
          onFailed: 'return withdrawal',
          async callback() {},
        }

        const withdrawalInstance = {
          model: withdrawalModelReturn,
          onFailed: 'delete withdrawal',
          async callback() {},
        }

        const transactionInstance = {
          model: transactionModelReturn,
          onFailed: 'delete transaction',
          async callback() {},
        }

        const notificationInstance = {
          model: notificationModelReturn,
          onFailed: 'delete notification',
          async callback() {},
        }

        expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

        expect(
          JSON.stringify(executeTransactionManagerMock.mock.calls[0][0].length)
        ).toBe(JSON.stringify(4))
      })
    })
  })

  describe('update withdrawal status', () => {
    const url = baseUrl + 'update-status'

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const payload = {
          withdrawalId: '',
          status: '',
        }

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
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const payload = {
          withdrawalId: '',
          status: '',
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"withdrawalId" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      describe('given status was cancelled', () => {
        it('should execute 3 transactions', async () => {
          const admin = await userModel.create(adminA)
          const user = await userModel.create({ ...userA, _id: userA_id })

          const token = Encryption.createToken(admin)

          const withdrawal = await withdrawalModel.create({
            ...withdrawalA,
            _id: withdrawalA_id,
            user: user._id,
          })

          const status = WithdrawalStatus.CANCELLED

          const payload = {
            withdrawalId: withdrawal._id,
            status,
          }

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(HttpResponseStatus.SUCCESS)
          expect(body.data).toEqual({
            withdrawal: {
              _id: withdrawalModelReturn._id,
              collection: withdrawalModelReturn.collection,
            },
          })

          expect(updateStatusTransactionWithdrawalMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTransactionWithdrawalMock).toHaveBeenCalledWith(
            withdrawal._id.toString(),
            status
          )

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(1)
          expect(fundTransactionUserMock).toHaveBeenCalledWith(
            withdrawalAObj.user,
            UserAccount.MAIN_BALANCE,
            +(withdrawalAObj.amount + withdrawalAObj.fee),
            undefined
          )

          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledTimes(
            1
          )
          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledWith(
            withdrawalAObj._id,
            status
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)
          expect(createTransactionNotificationMock).toHaveBeenCalledWith(
            `Your withdrawal of ${formatNumber.toDollar(
              withdrawalAObj.amount
            )} was ${status}`,
            NotificationCategory.WITHDRAWAL,
            withdrawalAObj,
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            expect.any(Object)
          )

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(
            JSON.stringify(
              executeTransactionManagerMock.mock.calls[0][0].length
            )
          ).toBe(JSON.stringify(4))
        })
      })
      describe('given status was approved', () => {
        it('should return a 200 and the withdrawal payload', async () => {
          const admin = await userModel.create(adminA)
          const token = Encryption.createToken(admin)
          const user = await userModel.create({ ...userA, _id: userA_id })

          const withdrawal = await withdrawalModel.create({
            ...withdrawalA,
            _id: withdrawalA_id,
            user: user._id,
          })

          const status = WithdrawalStatus.APPROVED

          const payload = {
            withdrawalId: withdrawal._id,
            status,
          }

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(HttpResponseStatus.SUCCESS)
          expect(body.data).toEqual({
            withdrawal: {
              _id: withdrawalModelReturn._id,
              collection: withdrawalModelReturn.collection,
            },
          })

          expect(updateStatusTransactionWithdrawalMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTransactionWithdrawalMock).toHaveBeenCalledWith(
            withdrawal._id.toString(),
            status
          )

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(0)

          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledTimes(
            1
          )
          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledWith(
            withdrawalAObj._id,
            status
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)
          expect(createTransactionNotificationMock).toHaveBeenCalledWith(
            `Your withdrawal of ${formatNumber.toDollar(
              withdrawalAObj.amount
            )} was ${status}`,
            NotificationCategory.WITHDRAWAL,
            withdrawalAObj,
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            expect.any(Object)
          )

          const withdrawalInstance = {
            model: withdrawalModelReturn,
            onFailed: 'change withdrawal status to old status',
            async callback() {},
          }

          const transactionInstance = {
            model: transactionModelReturn,
            onFailed: 'change transaction status to old status',
            async callback() {},
          }

          const notificationInstance = {
            model: notificationModelReturn,
            onFailed: 'delete notification',
            async callback() {},
          }

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(
            JSON.stringify(executeTransactionManagerMock.mock.calls[0][0])
          ).toEqual(
            JSON.stringify([
              withdrawalInstance,
              transactionInstance,
              notificationInstance,
            ])
          )
        })
      })
    })
  })

  describe('delete withdrawal', () => {
    // const url = baseUrl + `delete/:withdrawalId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const url = baseUrl + `delete/withdrawalId`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given withdrawal id those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = baseUrl + `delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given deposit has not been settled', () => {
      it('should return a 400', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const withdrawal = await withdrawalModel.create(withdrawalA)

        const url = baseUrl + `delete/${withdrawal._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and the withdrawal payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const withdrawal = await withdrawalModel.create({
          ...withdrawalA,
          status: WithdrawalStatus.APPROVED,
        })

        const url = baseUrl + `delete/${withdrawal._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
      })
    })
  })

  describe('get all users withdrawal transactions', () => {
    const url = baseUrl + `master`

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
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
      it('should return a 200 and an empty array of withdrawal payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          withdrawals: [],
        })

        const withdrawalCounts = await withdrawalModel.count()

        expect(withdrawalCounts).toBe(0)
      })
      it('should return a 200 and an array of withdrawal payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        await userModel.create({ ...userA, _id: userA_id })
        const withdrawal = await withdrawalModel.create(withdrawalA)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
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

  describe('get one withdrawal transaction', () => {
    // const url = baseUrl + `:withdrawal`
    describe('given user is not logged in', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = baseUrl + 'withdrawalId'
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given withdrawal those not exist', () => {
      it('should throw a 404 error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = baseUrl + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given withdrawal those not belongs to logged in user', () => {
      it('should throw a 404 error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const withdrawal = await withdrawalModel.create(withdrawalA)

        const url = baseUrl + withdrawal._id

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const withdrawalCounts = await withdrawalModel.count()

        expect(withdrawalCounts).toBe(1)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the withdrawal payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const withdrawal = await withdrawalModel.create({
          ...withdrawalA,
          user: user._id,
        })

        const url = baseUrl + withdrawal._id

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(Helpers.deepClone(body.data.withdrawal)).toEqual(
          Helpers.deepClone(withdrawal.toObject())
        )

        const withdrawalCounts = await withdrawalModel.count()

        expect(withdrawalCounts).toBe(1)
      })
    })
  })

  describe('get one user withdrawal transaction', () => {
    // const url = baseUrl + `master/:withdrawal`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = baseUrl + `master/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given withdrawal those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = baseUrl + `master/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the withdrawal payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const withdrawal = await withdrawalModel.create(withdrawalA)
        const url = baseUrl + `master/${withdrawal._id}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        body.data.withdrawal.user = withdrawal.user.toString()
        expect(Helpers.deepClone(body.data)).toEqual(
          Helpers.deepClone({
            withdrawal: withdrawal.toObject(),
          })
        )
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
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the an empty array of withdrawal payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.withdrawals).toEqual([])
      })

      it('should return a 200 and the an array of withdrawal payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const withdrawal = await withdrawalModel.create({
          ...withdrawalA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.withdrawals.length).toBe(1)
        expect(body.data.withdrawals[0].account).toBe(withdrawal.account)
        expect(body.data.withdrawals[0].amount).toBe(withdrawal.amount)
        expect(body.data.withdrawals[0].status).toBe(withdrawal.status)
        expect(body.data.withdrawals[0].user).toBe(user._id.toString())
      })
    })
  })
})
