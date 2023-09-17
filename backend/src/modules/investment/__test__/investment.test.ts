import { createTransactionNotificationMock } from '../../notification/__test__/notification.mock'
import {
  createTransactionTransactionMock,
  updateAmountTransactionTransactionMock,
} from '../../transaction/__test__/transaction.mock'
import investmentModel from '../../investment/investment.model'
import {
  NotificationCategory,
  NotificationForWho,
} from '../../notification/notification.enum'
import formatNumber from '../../../utils/formats/formatNumber'
import { TransactionCategory } from '../../transaction/transaction.enum'
import { InvestmentStatus } from '../../investment/investment.enum'
import { request } from '../../../test'
import {
  adminA,
  userA,
  userA_id,
  userB,
  userAObj,
  userBObj,
  userB_id,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'

import { executeTransactionManagerMock } from '../../transactionManager/__test__/transactionManager.mock'
import {
  investmentA,
  investmentA_id,
  investmentB_id,
  investmentModelReturn,
  investmentAObj,
  investmentB,
  investmentBObj,
} from './investment.payload'
import {
  createTransactionInvestmentMock,
  updateStatusTransactionInvestmentMock,
} from './investment.mock'
import { HttpResponseStatus } from '../../http/http.enum'
import Encryption from '../../../utils/encryption'
import { fundTransactionUserMock } from '../../user/__test__/user.mock'
import { UserAccount, UserEnvironment } from '../../user/user.enum'
import { createTransactionReferralMock } from '../../referral/__test__/referral.mock'
import { referralA } from '../../referral/__test__/referral.payoad'
import { ReferralTypes } from '../../referral/referral.enum'
import { planA, planA_id } from '../../plan/__test__/plan.payload'
import { getPlanMock } from '../../plan/__test__/plan.mock'
import FormatNumber from '../../../utils/formats/formatNumber'
import transactionModel from '../../transaction/transaction.model'
import { IInvestment } from '../investment.interface'
import { IUser } from '../../user/user.interface'
import { ITransaction } from '../../transaction/transaction.interface'
import { Types } from 'mongoose'

describe('investment', () => {
  const baseUrl = '/api/investment/'
  describe('create investment on live mode and demo', () => {
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
          planId: planA_id,
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
    describe('given plan those not exits', () => {
      it('should throw a 404 error', async () => {
        const id = new Types.ObjectId().toString()
        const payload = {
          planId: id,
          account: UserAccount.MAIN_BALANCE,
          amount: investmentA.amount,
        }

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('The selected plan no longer exist')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getPlanMock).toHaveBeenCalledTimes(1)
        expect(getPlanMock).toHaveBeenCalledWith(id)

        expect(createTransactionInvestmentMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given investment amount is lower than min investment of selected plan', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          planId: planA_id,
          account: UserAccount.MAIN_BALANCE,
          amount: planA.minAmount - 10,
        }

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          `The amount allowed in this plan is between ${FormatNumber.toDollar(
            planA.minAmount
          )} and ${FormatNumber.toDollar(planA.maxAmount)}.`
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getPlanMock).toHaveBeenCalledTimes(1)
        expect(getPlanMock).toHaveBeenCalledWith(planA_id.toString())

        expect(createTransactionInvestmentMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given all validations passed', () => {
      describe('given user those not have a referral', () => {
        it('should return a 201 and the investment payload', async () => {
          const payload = {
            planId: planA_id,
            amount: planA.minAmount,
            account: UserAccount.MAIN_BALANCE,
          }

          const user = await userModel.create({ ...userA, _id: userA_id })

          const { password: _, ...userA1 } = userA

          const token = Encryption.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe(
            'Investment has been registered successfully'
          )
          expect(statusCode).toBe(201)
          expect(body.status).toBe(HttpResponseStatus.SUCCESS)

          expect(body.data).toMatchObject({
            investment: { _id: investmentModelReturn._id },
          })

          expect(getPlanMock).toHaveBeenCalledTimes(1)
          expect(getPlanMock).toHaveBeenCalledWith(planA_id.toString())

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(1)

          expect(fundTransactionUserMock).toHaveBeenCalledWith(
            user._id,
            payload.account,
            payload.amount,
            undefined
          )

          expect(createTransactionInvestmentMock).toHaveBeenCalledTimes(1)

          expect(createTransactionInvestmentMock).toHaveBeenCalledWith(
            expect.objectContaining(userA1),
            expect.objectContaining(planA),
            payload.amount,
            payload.account,
            UserEnvironment.LIVE
          )

          expect(createTransactionTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionTransactionMock).toHaveBeenCalledWith(
            expect.objectContaining(userA1),
            InvestmentStatus.RUNNING,
            TransactionCategory.INVESTMENT,
            expect.any(Object),
            payload.amount,
            UserEnvironment.LIVE,
            payload.amount
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(2)
          expect(createTransactionNotificationMock.mock.calls[0]).toEqual([
            `Your investment of ${formatNumber.toDollar(
              payload.amount
            )} on the ${planA.name} plan is up and running`,
            NotificationCategory.INVESTMENT,
            expect.any(Object),
            NotificationForWho.USER,
            InvestmentStatus.RUNNING,
            UserEnvironment.LIVE,
            { ...userA, _id: userA_id },
          ])

          expect(createTransactionNotificationMock.mock.calls[1]).toEqual([
            `${user.username} just invested in the ${
              planA.name
            } plan with the sum of ${formatNumber.toDollar(
              payload.amount
            )}, on his ${UserEnvironment.LIVE} account`,
            NotificationCategory.INVESTMENT,
            expect.any(Object),
            NotificationForWho.ADMIN,
            InvestmentStatus.RUNNING,
            UserEnvironment.LIVE,
            undefined,
          ])

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(executeTransactionManagerMock.mock.calls[0][0].length).toEqual(
            5
          )
        })
      })
      describe('given user was referred', () => {
        it('should return a 201 and the investment payload', async () => {
          const payload = {
            planId: planA_id,
            amount: planA.minAmount,
            account: UserAccount.MAIN_BALANCE,
          }

          const user = await userModel.create({ ...userB, _id: userB_id })

          const { password: _, ...userA1 } = userA

          const token = Encryption.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe(
            'Investment has been registered successfully'
          )
          expect(statusCode).toBe(201)
          expect(body.status).toBe(HttpResponseStatus.SUCCESS)

          expect(body.data).toMatchObject({
            investment: { _id: investmentModelReturn._id },
          })

          expect(getPlanMock).toHaveBeenCalledTimes(1)
          expect(getPlanMock).toHaveBeenCalledWith(planA_id.toString())

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(2)

          expect(fundTransactionUserMock).toHaveBeenCalledWith(
            user._id,
            payload.account,
            payload.amount,
            undefined
          )

          expect(fundTransactionUserMock).toHaveBeenCalledWith(
            userA_id,
            UserAccount.REFERRAL_BALANCE,
            referralA.amount,
            undefined
          )

          expect(createTransactionInvestmentMock).toHaveBeenCalledTimes(1)

          expect(createTransactionInvestmentMock).toHaveBeenCalledWith(
            expect.objectContaining(userB),
            expect.objectContaining(planA),
            payload.amount,
            payload.account,
            UserEnvironment.LIVE
          )

          expect(createTransactionReferralMock).toHaveBeenCalledTimes(1)

          expect(createTransactionTransactionMock).toHaveBeenCalledTimes(2)
          expect(createTransactionTransactionMock.mock.calls[1]).toEqual([
            expect.objectContaining(userB),
            InvestmentStatus.RUNNING,
            TransactionCategory.INVESTMENT,
            expect.any(Object),
            payload.amount,
            UserEnvironment.LIVE,
            payload.amount,
          ])

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(4)
          expect(createTransactionNotificationMock.mock.calls[2]).toEqual([
            `Your investment of ${formatNumber.toDollar(
              payload.amount
            )} on the ${planA.name} plan is up and running`,
            NotificationCategory.INVESTMENT,
            expect.any(Object),
            NotificationForWho.USER,
            InvestmentStatus.RUNNING,
            UserEnvironment.LIVE,
            { ...userB, _id: userB_id, referred: userA_id },
          ])

          expect(createTransactionNotificationMock.mock.calls[3]).toEqual([
            `${user.username} just invested in the ${
              planA.name
            } plan with the sum of ${formatNumber.toDollar(
              payload.amount
            )}, on his ${UserEnvironment.LIVE} account`,
            NotificationCategory.INVESTMENT,
            expect.any(Object),
            NotificationForWho.ADMIN,
            InvestmentStatus.RUNNING,
            UserEnvironment.LIVE,
            undefined,
          ])

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(executeTransactionManagerMock.mock.calls[0][0].length).toEqual(
            10
          )
        })
      })
    })
    describe('given a demo account', () => {
      const url = baseUrl + 'demo/create'
      describe('given account is not demo', () => {
        it('should throw a 400 error', async () => {
          const payload = {
            planId: planA_id,
            account: UserAccount.MAIN_BALANCE,
            amount: planA.minAmount,
          }

          const user = await userModel.create(userA)
          const token = Encryption.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe(`\"account\" must be [demoBalance]`)
          expect(statusCode).toBe(400)
          expect(body.status).toBe(HttpResponseStatus.ERROR)
        })
      })
      describe('on success entry', () => {
        it('should return a 201 and the investment payload', async () => {
          const payload = {
            planId: planA_id,
            amount: planA.minAmount,
            account: UserAccount.DEMO_BALANCE,
          }

          const user = await userModel.create({ ...userA, _id: userA_id })

          const { password: _, ...userA1 } = userA

          const token = Encryption.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe(
            'Investment has been registered successfully'
          )
          expect(statusCode).toBe(201)
          expect(body.status).toBe(HttpResponseStatus.SUCCESS)

          expect(body.data).toMatchObject({
            investment: { _id: investmentModelReturn._id },
          })

          expect(getPlanMock).toHaveBeenCalledTimes(1)
          expect(getPlanMock).toHaveBeenCalledWith(planA_id.toString())

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(1)

          expect(fundTransactionUserMock).toHaveBeenCalledWith(
            user._id,
            payload.account,
            payload.amount,
            undefined
          )

          expect(createTransactionInvestmentMock).toHaveBeenCalledTimes(1)

          expect(createTransactionInvestmentMock).toHaveBeenCalledWith(
            expect.objectContaining(userA1),
            expect.objectContaining(planA),
            payload.amount,
            payload.account,
            UserEnvironment.DEMO
          )

          expect(createTransactionTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionTransactionMock).toHaveBeenCalledWith(
            expect.objectContaining(userA1),
            InvestmentStatus.RUNNING,
            TransactionCategory.INVESTMENT,
            expect.any(Object),
            payload.amount,
            UserEnvironment.DEMO,
            payload.amount
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(2)
          expect(createTransactionNotificationMock.mock.calls[0]).toEqual([
            `Your investment of ${formatNumber.toDollar(
              payload.amount
            )} on the ${planA.name} plan is up and running`,
            NotificationCategory.INVESTMENT,
            expect.any(Object),
            NotificationForWho.USER,
            InvestmentStatus.RUNNING,
            UserEnvironment.DEMO,
            { ...userA, _id: userA_id },
          ])

          expect(createTransactionNotificationMock.mock.calls[1]).toEqual([
            `${user.username} just invested in the ${
              planA.name
            } plan with the sum of ${formatNumber.toDollar(
              payload.amount
            )}, on his ${UserEnvironment.DEMO} account`,
            NotificationCategory.INVESTMENT,
            expect.any(Object),
            NotificationForWho.ADMIN,
            InvestmentStatus.RUNNING,
            UserEnvironment.DEMO,
            undefined,
          ])

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(executeTransactionManagerMock.mock.calls[0][0].length).toEqual(
            5
          )
        })
      })
    })
  })

  describe('update investment status', () => {
    const url = baseUrl + 'update-status'

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const payload = {
          investmentId: '',
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
          investmentId: '',
          status: '',
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"investmentId" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      describe('given status was suspended', () => {
        it('should execute 2 transactions', async () => {
          const admin = await userModel.create(adminA)
          const user = await userModel.create({ ...userA, _id: userA_id })

          // const { password: _, ...userA1 } = userA
          const token = Encryption.createToken(admin)

          const investment = await investmentModel.create({
            ...investmentA,
            _id: investmentA_id,
            user: user._id,
          })

          const status = InvestmentStatus.SUSPENDED

          const payload = {
            investmentId: investment._id,
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
            investment: {
              _id: investmentModelReturn._id,
              collection: investmentModelReturn.collection,
            },
          })

          expect(updateStatusTransactionInvestmentMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTransactionInvestmentMock).toHaveBeenCalledWith(
            investment._id.toString(),
            status
          )

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(0)

          expect(createTransactionReferralMock).toHaveBeenCalledTimes(0)

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)
          expect(createTransactionNotificationMock.mock.calls[0][0]).toBe(
            `Your investment package has been ${status}`
          )
          expect(createTransactionNotificationMock.mock.calls[0][1]).toBe(
            NotificationCategory.INVESTMENT
          )
          expect(createTransactionNotificationMock.mock.calls[0][3]).toBe(
            NotificationForWho.USER
          )
          expect(createTransactionNotificationMock.mock.calls[0][4]).toBe(
            status
          )

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(executeTransactionManagerMock.mock.calls[0][0].length).toBe(2)
        })
      })
      describe('given status was set to completed but no referrer', () => {
        it('should return a 200 and the investment payload', async () => {
          const admin = await userModel.create(adminA)
          const token = Encryption.createToken(admin)

          const investment = await investmentModel.create({
            ...investmentA,
            _id: investmentA_id,
          })

          await transactionModel.create({
            user: investment.user,
            userObject: investment.userObject,
            status: InvestmentStatus.RUNNING,
            category: investment._id,
            categoryName: TransactionCategory.INVESTMENT,
            categoryObject: investment,
            amount: investment.amount,
            stake: investment.amount,
            environment: investment.environment,
          })

          const status = InvestmentStatus.COMPLETED

          const payload = {
            investmentId: investment._id,
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
            investment: {
              _id: investmentModelReturn._id,
              collection: investmentModelReturn.collection,
            },
          })

          expect(updateStatusTransactionInvestmentMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTransactionInvestmentMock).toHaveBeenCalledWith(
            investment._id.toString(),
            status
          )

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(1)
          expect(fundTransactionUserMock).toHaveBeenCalledWith(
            investmentAObj.user,
            UserAccount.MAIN_BALANCE,
            investmentAObj.balance,
            undefined
          )

          expect(createTransactionReferralMock).toHaveBeenCalledTimes(0)

          expect(updateAmountTransactionTransactionMock).toHaveBeenCalledTimes(
            1
          )
          expect(updateAmountTransactionTransactionMock).toHaveBeenCalledWith(
            // @ts-ignore
            investmentAObj._id,
            InvestmentStatus.COMPLETED,
            investmentAObj.balance
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)
          investmentAObj.status = status
          expect(createTransactionNotificationMock).toHaveBeenCalledWith(
            `Your investment package has been ${status}`,
            NotificationCategory.INVESTMENT,
            investmentAObj,
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            userAObj
          )

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(executeTransactionManagerMock.mock.calls[0][0].length).toBe(4)
        })
      })
      describe('given status was set to completed but there is a referrer', () => {
        it('should return a 200 and the investment payload', async () => {
          const admin = await userModel.create(adminA)
          const token = Encryption.createToken(admin)

          const investment = await investmentModel.create({
            ...investmentB,
            _id: investmentB_id,
          })

          await transactionModel.create({
            user: investment.user,
            userObject: investment.userObject,
            status: InvestmentStatus.RUNNING,
            category: investment._id,
            categoryName: TransactionCategory.INVESTMENT,
            categoryObject: investment,
            amount: investment.amount,
            stake: investment.amount,
            environment: investment.environment,
          })

          const status = InvestmentStatus.COMPLETED

          const { password: _, ...userA1 } = userA

          const payload = {
            investmentId: investment._id,
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
            investment: {
              _id: investmentModelReturn._id,
              collection: investmentModelReturn.collection,
            },
          })

          expect(updateStatusTransactionInvestmentMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTransactionInvestmentMock).toHaveBeenCalledWith(
            investment._id.toString(),
            status
          )

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(2)
          expect(fundTransactionUserMock).toHaveBeenNthCalledWith(
            1,
            investmentBObj.user,
            UserAccount.MAIN_BALANCE,
            investmentBObj.balance,
            undefined
          )

          expect(createTransactionReferralMock).toHaveBeenCalledTimes(1)

          expect(createTransactionReferralMock).toHaveBeenCalledWith(
            userAObj,
            userBObj,
            ReferralTypes.COMPLETED_PACKAGE_EARNINGS,
            referralA.rate,
            referralA.amount
          )

          expect(createTransactionTransactionMock).toHaveBeenCalledTimes(1)

          expect(updateAmountTransactionTransactionMock).toHaveBeenCalledTimes(
            1
          )
          expect(updateAmountTransactionTransactionMock).toHaveBeenCalledWith(
            // @ts-ignore
            investmentBObj._id,
            InvestmentStatus.COMPLETED,
            investmentBObj.balance
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(3)
          investmentBObj.status = status
          expect(createTransactionNotificationMock).toHaveBeenNthCalledWith(
            3,
            `Your investment package has been ${status}`,
            NotificationCategory.INVESTMENT,
            investmentBObj,
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            userBObj
          )

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(executeTransactionManagerMock.mock.calls[0][0].length).toBe(9)
        })
      })
    })
  })

  describe('fund', () => {
    const url = `${baseUrl}fund`
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
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          investmentId: new Types.ObjectId().toString(),
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
    describe('given investment those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          investmentId: new Types.ObjectId().toString(),
          amount: 100,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Investment plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should return a 200 and an investment payload', async () => {
        const investment = await investmentModel.create(investmentA)

        const payload = {
          investmentId: investment._id,
          amount: 100,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Investment has been funded successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.investment._id).toBe(investment._id.toString())

        expect(body.data.investment.balance).toBe(
          payload.amount + investmentA.balance
        )
      })
    })
  })

  describe('delete investment', () => {
    // const url = baseUrl + `delete/:investmentId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const url = baseUrl + `delete/investmentId`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given investment id those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = baseUrl + `delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given investment has not been settled', () => {
      it('should return a 400 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const investment = await investmentModel.create(investmentA)

        const url = baseUrl + `delete/${investment._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the investment payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const investment = await investmentModel.create({
          ...investmentA,
          status: InvestmentStatus.COMPLETED,
        })

        const url = baseUrl + `delete/${investment._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
      })
    })
  })

  describe('get users real investment plan', () => {
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
      it('should return a 200 and an empty array of investment payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          investments: [],
        })

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(0)
      })
      it('should return a 200 and an array of investment payload', async () => {
        const admin = await userModel.create(adminA)
        const user = await userModel.create(userA)
        const token = Encryption.createToken(admin)
        const investment = await investmentModel.create({
          ...investmentA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.investments.length).toBe(1)
        expect(body.data.investments[0].environment).toBe(
          investment.environment
        )
        expect(body.data.investments[0].planObject.name).toBe(
          investment.planObject.name
        )
        expect(body.data.investments[0].balance).toBe(investment.balance)
        expect(body.data.investments[0].status).toBe(investment.status)
        expect(body.data.investments[0].user._id).toBe(
          investment.user.toString()
        )
        expect(body.data.investments[0].user.username).toBe(
          investment.userObject.username
        )

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(1)
      })
    })
  })

  describe('get users demo investment plan', () => {
    const url = baseUrl + `master/demo`

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
      it('should return a 200 and an empty array of investment payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          investments: [],
        })

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(0)
      })
      it('should return a 200 and an array of investment payload', async () => {
        const admin = await userModel.create(adminA)
        const user = await userModel.create(userA)
        const token = Encryption.createToken(admin)
        const investment = await investmentModel.create({
          ...investmentA,
          user: user._id,
          environment: UserEnvironment.DEMO,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.investments.length).toBe(1)
        expect(body.data.investments[0].environment).toBe(
          investment.environment
        )
        expect(body.data.investments[0].planObject.name).toBe(
          investment.planObject.name
        )
        expect(body.data.investments[0].balance).toBe(investment.balance)
        expect(body.data.investments[0].status).toBe(investment.status)
        expect(body.data.investments[0].user._id).toBe(
          investment.user.toString()
        )
        expect(body.data.investments[0].user.username).toBe(
          investment.userObject.username
        )

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(1)
      })
    })
  })

  describe('get real investment plan', () => {
    const url = baseUrl

    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and an empty array of investment payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          investments: [],
        })

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(0)
      })
      it('should return a 200 and an array of investment payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        await investmentModel.create(investmentB)
        const investment = await investmentModel.create({
          ...investmentA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.investments.length).toBe(1)
        expect(body.data.investments[0].environment).toBe(
          investment.environment
        )
        expect(body.data.investments[0].planObject.name).toBe(
          investment.planObject.name
        )
        expect(body.data.investments[0].balance).toBe(investment.balance)
        expect(body.data.investments[0].status).toBe(investment.status)
        expect(body.data.investments[0].user).toBe(investment.user.toString())
        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(2)
      })
    })
  })

  describe('get demo investment plan', () => {
    const url = baseUrl + 'demo'

    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and an empty array of investment payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          investments: [],
        })

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(0)
      })
      it('should return a 200 and an array of investment payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        await investmentModel.create({ ...investmentB, user: user._id })
        const investment = await investmentModel.create({
          ...investmentA,
          user: user._id,
          environment: UserEnvironment.DEMO,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.investments.length).toBe(1)
        expect(body.data.investments[0].environment).toBe(
          investment.environment
        )
        expect(body.data.investments[0].planObject.name).toBe(
          investment.planObject.name
        )
        expect(body.data.investments[0].balance).toBe(investment.balance)
        expect(body.data.investments[0].status).toBe(investment.status)
        expect(body.data.investments[0].user).toBe(investment.user.toString())

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(2)
      })
    })
  })
})
