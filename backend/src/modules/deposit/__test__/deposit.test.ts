import { createTransactionNotificationMock } from './../../notification/__test__/notification.mock'
import {
  createTransactionTransactionMock,
  updateStatusTransactionTransactionMock,
} from './../../transaction/__test__/transaction.mock'
import depositModel from '../../../modules/deposit/deposit.model'
import {
  NotificationCategory,
  NotificationForWho,
} from './../../notification/notification.enum'
import formatNumber from '../../../utils/formats/formatNumber'
import { TransactionCategory } from './../../transaction/transaction.enum'
import { DepositStatus } from '../../../modules/deposit/deposit.enum'
import { depositMethodA_id } from './../../depositMethod/__test__/depositMethod.payload'
import { request } from '../../../test'
import {
  adminA,
  userA,
  userA_id,
  userB,
  userModelReturn,
  userAObj,
  userBObj,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { getDepositMethodMock } from '../../depositMethod/__test__/depositMethod.mock'

import { executeTransactionManagerMock } from '../../transactionManager/__test__/transactionManager.mock'
import {
  depositA,
  depositA_id,
  depositB_id,
  depositModelReturn,
  depositAObj,
  depositB,
  depositBObj,
} from './deposit.payload'
import {
  createTransactionDepositMock,
  updateStatusTransactionDepositMock,
} from './deposit.mock'
import { HttpResponseStatus } from '../../http/http.enum'
import Encryption from '../../../utils/encryption'
import { transactionModelReturn } from '../../transaction/__test__/transaction.payload'
import { notificationModelReturn } from '../../notification/__test__/notification.payload'
import { fundTransactionUserMock } from '../../user/__test__/user.mock'
import { UserAccount, UserEnvironment } from '../../user/user.enum'
import { createTransactionReferralMock } from '../../referral/__test__/referral.mock'
import {
  referralA,
  referralAObj,
  referralModelReturn,
} from '../../referral/__test__/referral.payoad'
import { ReferralStatus, ReferralTypes } from '../../referral/referral.enum'
import FormatString from '../../../utils/formats/formatString'
import { IDeposit } from '../deposit.interface'
import { INotification } from '../../notification/notification.interface'
import notificationModel from '../../notification/notification.model'
import { IReferral } from '../../referral/referral.interface'
import referralModel from '../../referral/referral.model'
import { ITransaction } from '../../transaction/transaction.interface'
import transactionModel from '../../transaction/transaction.model'
import { IUser } from '../../user/user.interface'
import { Types } from 'mongoose'

describe('deposit', () => {
  const baseUrl = '/api/deposit/'
  describe('create deposit', () => {
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
          depositMethodId: depositMethodA_id,
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
    describe('given deposit method those not exits', () => {
      it('should throw a 404 error', async () => {
        const id = new Types.ObjectId().toString()
        const payload = {
          depositMethodId: id,
          amount: 30,
        }

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getDepositMethodMock).toHaveBeenCalledTimes(1)
        expect(getDepositMethodMock).toHaveBeenCalledWith(id)

        expect(createTransactionDepositMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given deposit amount is lower than min deposit of selected method', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          depositMethodId: depositMethodA_id,
          amount: 30,
        }

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'Amount is lower than the min deposit of the selected deposit method'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getDepositMethodMock).toHaveBeenCalledTimes(1)
        expect(getDepositMethodMock).toHaveBeenCalledWith(
          depositMethodA_id.toString()
        )

        expect(createTransactionDepositMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 201 and the deposit payload', async () => {
        const payload = {
          depositMethodId: depositMethodA_id,
          amount: 40,
        }

        const user = await userModel.create(userA)
        const { password: _, ...userA1 } = userA

        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit has been registered successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toMatchObject({
          deposit: { _id: depositModelReturn._id.toString() },
        })

        expect(createTransactionDepositMock).toHaveBeenCalledTimes(1)

        expect(getDepositMethodMock).toHaveBeenCalledTimes(1)
        expect(getDepositMethodMock).toHaveBeenCalledWith(
          depositMethodA_id.toString()
        )

        expect(createTransactionTransactionMock).toHaveBeenCalledTimes(1)
        expect(createTransactionTransactionMock).toHaveBeenCalledWith(
          expect.objectContaining(userA1),
          DepositStatus.PENDING,
          TransactionCategory.DEPOSIT,
          expect.any(Object),
          payload.amount,
          UserEnvironment.LIVE,
          undefined
        )

        expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)
        expect(createTransactionNotificationMock).toHaveBeenCalledWith(
          `${
            user.username
          } just made a deposit request of ${formatNumber.toDollar(
            payload.amount
          )} awaiting for your approval`,
          NotificationCategory.DEPOSIT,
          expect.any(Object),
          NotificationForWho.ADMIN,
          DepositStatus.PENDING,
          UserEnvironment.LIVE,
          undefined
        )

        const depositInstance = {
          model: depositModelReturn,
          onFailed: 'delete deposit',
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
          JSON.stringify(executeTransactionManagerMock.mock.calls[0][0])
        ).toEqual(
          JSON.stringify([
            depositInstance,
            transactionInstance,
            notificationInstance,
          ])
        )
      })
    })
  })

  describe('update deposit status', () => {
    const url = baseUrl + 'update-status'

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const payload = {
          depositId: '',
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
          depositId: '',
          status: '',
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"depositId" is not allowed to be empty')
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

          const deposit = await depositModel.create({
            ...depositA,
            _id: depositA_id,
            user: user._id,
          })

          const status = DepositStatus.CANCELLED

          const payload = {
            depositId: deposit._id,
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
            deposit: {
              _id: depositModelReturn._id.toString(),
              collection: depositModelReturn.collection,
            },
          })

          expect(updateStatusTransactionDepositMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTransactionDepositMock).toHaveBeenCalledWith(
            deposit._id.toString(),
            status
          )

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(0)

          expect(createTransactionReferralMock).toHaveBeenCalledTimes(0)

          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledTimes(
            1
          )
          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledWith(
            depositAObj._id,
            status
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)
          expect(createTransactionNotificationMock).toHaveBeenCalledWith(
            `Your deposit of ${formatNumber.toDollar(
              depositAObj.amount
            )} was ${status}`,
            NotificationCategory.DEPOSIT,
            depositAObj,
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            expect.any(Object)
          )

          const depositInstance = {
            model: depositModelReturn,
            onFailed: 'change deposit status to old status',
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
              depositInstance,
              transactionInstance,
              notificationInstance,
            ])
          )
        })
      })
      describe('given status was approved but no referrer', () => {
        it('should return a 200 and the deposit payload', async () => {
          const admin = await userModel.create(adminA)
          const token = Encryption.createToken(admin)

          const deposit = await depositModel.create({
            ...depositA,
            _id: depositA_id,
          })

          const status = DepositStatus.APPROVED

          const payload = {
            depositId: deposit._id,
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
            deposit: {
              _id: depositModelReturn._id.toString(),
              collection: depositModelReturn.collection,
            },
          })

          expect(updateStatusTransactionDepositMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTransactionDepositMock).toHaveBeenCalledWith(
            deposit._id.toString(),
            status
          )

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(1)
          expect(fundTransactionUserMock).toHaveBeenCalledWith(
            depositAObj.user,
            UserAccount.MAIN_BALANCE,
            depositAObj.amount - depositAObj.fee,
            undefined
          )

          expect(createTransactionReferralMock).toHaveBeenCalledTimes(0)

          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledTimes(
            1
          )
          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledWith(
            depositAObj._id,
            status
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)
          expect(createTransactionNotificationMock).toHaveBeenCalledWith(
            `Your deposit of ${formatNumber.toDollar(
              depositAObj.amount
            )} was ${status}`,
            NotificationCategory.DEPOSIT,
            depositAObj,
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            userAObj
          )

          const depositInstance = {
            model: depositModelReturn,
            onFailed: 'change deposit status to old status',
            async callback() {},
          }

          const userInstance = {
            model: userModelReturn,
            onFailed: 'return deposit',
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
              depositInstance,
              userInstance,
              transactionInstance,
              notificationInstance,
            ])
          )
        })
      })
      describe('given status was approved and there is a referrer', () => {
        it('should return a 200 and the deposit payload', async () => {
          const admin = await userModel.create(adminA)
          const token = Encryption.createToken(admin)

          const deposit = await depositModel.create({
            ...depositB,
            _id: depositB_id,
          })

          const status = DepositStatus.APPROVED

          const payload = {
            depositId: deposit._id,
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
            deposit: {
              _id: depositModelReturn._id.toString(),
              collection: depositModelReturn.collection,
            },
          })

          expect(updateStatusTransactionDepositMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTransactionDepositMock).toHaveBeenCalledWith(
            deposit._id.toString(),
            status
          )

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(2)
          expect(fundTransactionUserMock.mock.calls[0]).toEqual([
            depositBObj.user,
            UserAccount.MAIN_BALANCE,
            depositBObj.amount - depositBObj.fee,
          ])
          expect(fundTransactionUserMock.mock.calls[1]).toEqual([
            userA_id,
            UserAccount.REFERRAL_BALANCE,
            referralA.amount,
          ])

          expect(createTransactionReferralMock).toHaveBeenCalledTimes(1)

          expect(createTransactionReferralMock).toHaveBeenCalledWith(
            userAObj,
            userBObj,
            ReferralTypes.DEPOSIT,
            referralA.rate,
            referralA.amount
          )

          expect(createTransactionTransactionMock).toHaveBeenCalledTimes(1)

          expect(createTransactionTransactionMock).toHaveBeenCalledWith(
            userAObj,
            ReferralStatus.SUCCESS,
            TransactionCategory.REFERRAL,
            referralAObj,
            referralA.amount,
            UserEnvironment.LIVE,
            undefined
          )

          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledTimes(
            1
          )
          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledWith(
            depositBObj._id,
            status
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(3)

          expect(createTransactionNotificationMock.mock.calls[0]).toEqual([
            `Your referral account has been credited with ${formatNumber.toDollar(
              referralA.amount
            )}, from ${userB.username} ${FormatString.fromCamelToTitleCase(
              ReferralTypes.DEPOSIT
            )} of ${formatNumber.toDollar(depositB.amount)}`,
            NotificationCategory.REFERRAL,
            referralAObj,
            NotificationForWho.USER,
            ReferralStatus.SUCCESS,
            UserEnvironment.LIVE,
            userAObj,
          ])

          expect(createTransactionNotificationMock.mock.calls[1]).toEqual([
            `${
              userAObj.username
            } referral account has been credited with ${formatNumber.toDollar(
              referralAObj.amount
            )}, from ${userBObj.username} ${
              NotificationCategory.DEPOSIT
            } of ${formatNumber.toDollar(depositB.amount)}`,
            NotificationCategory.REFERRAL,
            referralAObj,
            NotificationForWho.ADMIN,
            ReferralStatus.SUCCESS,
            UserEnvironment.LIVE,
            undefined,
          ])

          expect(createTransactionNotificationMock.mock.calls[2]).toEqual([
            `Your deposit of ${formatNumber.toDollar(
              depositBObj.amount
            )} was ${status}`,
            NotificationCategory.DEPOSIT,
            depositBObj,
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            userBObj,
          ])

          const depositInstance = {
            model: depositModelReturn,
            onFailed: 'change deposit status to old status',
            async callback() {},
          }

          const userInstance = {
            model: userModelReturn,
            onFailed: 'return deposit',
            async callback() {},
          }

          const userReferrerInstance = {
            model: userModelReturn,
            onFailed: 'return deposit',
            async callback() {},
          }

          const transactionInstance = {
            model: transactionModelReturn,
            onFailed: 'change transaction status to old status',
            async callback() {},
          }

          const userReferrerTransactionInstance = {
            model: transactionModelReturn,
            onFailed: 'delete transaction',
            async callback() {},
          }

          const referralTransactionInstance = {
            model: referralModelReturn,
            onFailed: 'delete referral',
            async callback() {},
          }

          const notificationInstance = {
            model: notificationModelReturn,
            onFailed: 'delete notification',
            async callback() {},
          }

          const userReferrerNotificationInstance = {
            model: notificationModelReturn,
            onFailed: 'delete notification',
            async callback() {},
          }

          const adminNotificationInstance = {
            model: notificationModelReturn,
            onFailed: 'delete notification',
            async callback() {},
          }

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(
            JSON.stringify(executeTransactionManagerMock.mock.calls[0][0])
          ).toEqual(
            JSON.stringify([
              depositInstance,
              userInstance,
              userReferrerInstance,
              referralTransactionInstance,
              userReferrerNotificationInstance,
              adminNotificationInstance,
              userReferrerTransactionInstance,
              transactionInstance,
              notificationInstance,
            ])
          )
        })
      })
    })
  })

  describe('delete deposit', () => {
    // const url = baseUrl + `delete/:depositId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const url = baseUrl + `delete/depositId`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given deposit id those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = baseUrl + `delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given deposit has not been settled', () => {
      it('should return a 400 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const deposit = await depositModel.create(depositA)

        const url = baseUrl + `delete/${deposit._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the deposit payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const deposit = await depositModel.create({
          ...depositA,
          status: DepositStatus.APPROVED,
        })

        const url = baseUrl + `delete/${deposit._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
      })
    })
  })

  describe('get all users deposit transactions', () => {
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
      it('should return a 200 and an empty array of deposit payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          deposits: [],
        })

        const depositCounts = await depositModel.count()

        expect(depositCounts).toBe(0)
      })
      it('should return a 200 and an array of deposit payload', async () => {
        const admin = await userModel.create(adminA)
        const user = await userModel.create(userA)
        const token = Encryption.createToken(admin)
        const deposit = await depositModel.create({
          ...depositA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.deposits.length).toBe(1)
        expect(body.data.deposits[0].amount).toBe(deposit.amount)
        expect(body.data.deposits[0].status).toBe(deposit.status)

        expect(body.data.deposits[0].depositMethodObject.address).toBe(
          deposit.depositMethodObject.address
        )
        expect(body.data.deposits[0].user._id).toBe(deposit.user.toString())
        expect(body.data.deposits[0].user.username).toBe(
          deposit.userObject.username
        )

        const depositCounts = await depositModel.count()

        expect(depositCounts).toBe(1)
      })
    })
  })

  describe('get one deposit transaction', () => {
    // const url = baseUrl + `:deposit`
    describe('given user is not logged in', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = baseUrl + 'depositId'
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given deposit those not exist', () => {
      it('should throw a 404 error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = baseUrl + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given deposit those not belongs to logged in user', () => {
      it('should throw a 404 error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const deposit = await depositModel.create(depositA)

        const url = baseUrl + deposit._id

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const depositCounts = await depositModel.count()

        expect(depositCounts).toBe(1)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the deposit payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const deposit = await depositModel.create({
          ...depositA,
          user: user._id,
        })

        const url = baseUrl + deposit._id

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.deposit.amount).toBe(deposit.amount)
        expect(body.data.deposit.status).toBe(deposit.status)

        expect(body.data.deposit.depositMethodObject.address).toBe(
          deposit.depositMethodObject.address
        )

        const depositCounts = await depositModel.count()

        expect(depositCounts).toBe(1)
      })
    })
  })

  describe('get one user deposit transaction', () => {
    // const url = baseUrl + `master/:deposit`
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

    describe('given deposit those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = baseUrl + `master/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the deposit payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const deposit = await depositModel.create(depositA)
        const url = baseUrl + `master/${deposit._id}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.deposit.amount).toBe(deposit.amount)
        expect(body.data.deposit.status).toBe(deposit.status)

        expect(body.data.deposit.depositMethodObject.address).toBe(
          deposit.depositMethodObject.address
        )
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
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the an empty array of deposit payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.deposits).toEqual([])
      })

      it('should return a 200 and the an array of deposit payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const deposit = await depositModel.create({
          ...depositA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.deposits.length).toBe(1)
        expect(body.data.deposits[0].amount).toBe(deposit.amount)
        expect(body.data.deposits[0].status).toBe(deposit.status)

        expect(body.data.deposits[0].depositMethodObject.address).toBe(
          deposit.depositMethodObject.address
        )
      })
    })
  })
})
