import { ITransferSettings } from '../../../modules/transferSettings/transferSettings.interface'
import { createTransactionNotificationMock } from '../../notification/__test__/notification.mock'
import {
  createTransactionTransactionMock,
  updateStatusTransactionTransactionMock,
} from '../../transaction/__test__/transaction.mock'
import transferModel from '../../transfer/transfer.model'
import {
  NotificationCategory,
  NotificationForWho,
} from '../../notification/notification.enum'
import formatNumber from '../../../utils/formats/formatNumber'
import { TransactionCategory } from '../../transaction/transaction.enum'
import { TransferStatus } from '../../transfer/transfer.enum'
import { request } from '../../../test'
import {
  adminA,
  notFoundUser,
  userA,
  userAObj,
  userA_id,
  userB,
  userBObj,
  userB_id,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'

import { executeTransactionManagerMock } from '../../transactionManager/__test__/transactionManager.mock'
import {
  transferA,
  transferA_id,
  transferModelReturn,
  transferAObj,
} from './transfer.payload'
import {
  createTransactionTransferMock,
  updateStatusTransactionTransferMock,
} from './transfer.mock'
import { HttpResponseStatus } from '../../http/http.enum'
import Encryption from '../../../utils/encryption'
import { fundTransactionUserMock } from '../../user/__test__/user.mock'
import { UserAccount, UserEnvironment } from '../../user/user.enum'

import Helpers from '../../../utils/helpers/helpers'
import transferSettingsModel from '../../transferSettings/transferSettings.model'
import {
  transferSettingsA,
  transferSettingsB,
} from '../../transferSettings/__test__/transferSettings.payload'
import { IUser } from '../../user/user.interface'
import { ITransfer } from '../transfer.interface'
import { Types } from 'mongoose'

describe('transfer', () => {
  const baseUrl = '/api/transfer/'
  describe('create transfer', () => {
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
          toUserUsername: userB.username,
          account: UserAccount.MAIN_BALANCE,
          // amount: 1000,
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
    describe('given the recipient was not found', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          toUserUsername: notFoundUser.username,
          account: UserAccount.MAIN_BALANCE,
          amount: 1000,
        }

        await transferSettingsModel.create(transferSettingsA)

        const user = await userModel.create({ ...userA, _id: userA_id })
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          `No Recipient with the username of ${notFoundUser.username} was found`
        )
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given the user tried transferring to its own account', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          toUserUsername: userA.username,
          account: UserAccount.MAIN_BALANCE,
          amount: 1000,
        }

        await transferSettingsModel.create(transferSettingsA)

        const user = await userModel.create({ ...userA, _id: userA_id })
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('You can not transfer to your own account')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given all validations passed', () => {
      describe('given transfer approval is disabled', () => {
        it('should return a 201 and a successful transfer payload', async () => {
          // payload
          const payload = {
            toUserUsername: userB.username,
            account: UserAccount.MAIN_BALANCE,
            amount: 1000,
          }

          await transferSettingsModel.create(transferSettingsA)

          const status = TransferStatus.SUCCESSFUL

          const user = await userModel.create({ ...userA, _id: userA_id })

          const fromUser = userAObj
          const toUser = userBObj

          const token = Encryption.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Transfer has been registered successfully')
          expect(statusCode).toBe(201)
          expect(body.status).toBe(HttpResponseStatus.SUCCESS)

          expect(createTransactionTransferMock).toHaveBeenCalledTimes(1)

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(2)
          expect(fundTransactionUserMock.mock.calls[0]).toEqual([
            user._id,
            payload.account,
            -(payload.amount + transferSettingsA.fee),
          ])
          expect(fundTransactionUserMock.mock.calls[1]).toEqual([
            payload.toUserUsername,
            UserAccount.MAIN_BALANCE,
            payload.amount,
            expect.any(String),
          ])

          expect(createTransactionTransactionMock).toHaveBeenCalledTimes(2)

          expect(createTransactionTransactionMock.mock.calls[0]).toEqual([
            expect.objectContaining(fromUser),
            status,
            TransactionCategory.TRANSFER_OUT,
            expect.any(Object),
            payload.amount,
            UserEnvironment.LIVE,
            undefined,
          ])
          expect(createTransactionTransactionMock.mock.calls[1]).toEqual([
            expect.objectContaining(toUser),
            status,
            TransactionCategory.TRANSFER_IN,
            expect.any(Object),
            payload.amount,
            UserEnvironment.LIVE,
            undefined,
          ])

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(3)
          expect(createTransactionNotificationMock.mock.calls[0]).toEqual([
            `Your transfer of ${formatNumber.toDollar(payload.amount)} to ${
              payload.toUserUsername
            } was successful.`,
            NotificationCategory.TRANSFER,
            expect.any(Object),
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            fromUser,
          ])

          expect(createTransactionNotificationMock.mock.calls[1]).toEqual([
            `${fromUser.username} just sent you ${formatNumber.toDollar(
              payload.amount
            )}.`,
            NotificationCategory.TRANSFER,
            expect.any(Object),
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            toUser,
          ])

          expect(createTransactionNotificationMock.mock.calls[2]).toEqual([
            `${
              fromUser.username
            } just made a successful transfer of ${formatNumber.toDollar(
              payload.amount
            )} to ${toUser.username}`,
            NotificationCategory.TRANSFER,
            expect.any(Object),
            NotificationForWho.ADMIN,
            status,
            UserEnvironment.LIVE,
            undefined,
          ])

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(executeTransactionManagerMock.mock.calls[0][0].length).toBe(8)
        })
      })
      describe('given transfer approval is enabled', () => {
        it('should return a 201 and a pending transfer payload', async () => {
          // payload
          const payload = {
            toUserUsername: userB.username,
            account: UserAccount.MAIN_BALANCE,
            amount: 1000,
          }

          await transferSettingsModel.create(transferSettingsB)

          const status = TransferStatus.PENDING

          await userModel.create(userB)
          const user = await userModel.create({ ...userA, _id: userA_id })

          const fromUser = userAObj
          const toUser = userBObj

          const token = Encryption.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Transfer has been registered successfully')
          expect(statusCode).toBe(201)
          expect(body.status).toBe(HttpResponseStatus.SUCCESS)

          expect(createTransactionTransferMock).toHaveBeenCalledTimes(1)

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(1)
          expect(fundTransactionUserMock.mock.calls[0]).toEqual([
            user._id,
            payload.account,
            -(payload.amount + transferSettingsB.fee),
          ])

          expect(createTransactionTransactionMock).toHaveBeenCalledTimes(1)

          expect(createTransactionTransactionMock.mock.calls[0]).toEqual([
            expect.objectContaining(fromUser),
            status,
            TransactionCategory.TRANSFER_OUT,
            expect.any(Object),
            payload.amount,
            UserEnvironment.LIVE,
            undefined,
          ])

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(2)
          expect(createTransactionNotificationMock.mock.calls[0]).toEqual([
            `Your transfer of ${formatNumber.toDollar(payload.amount)} to ${
              payload.toUserUsername
            } is ongoing.`,
            NotificationCategory.TRANSFER,
            expect.any(Object),
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            fromUser,
          ])

          expect(createTransactionNotificationMock.mock.calls[1]).toEqual([
            `${
              fromUser.username
            } just made a transfer request of ${formatNumber.toDollar(
              payload.amount
            )} to ${toUser.username} awaiting for your approver`,
            NotificationCategory.TRANSFER,
            expect.any(Object),
            NotificationForWho.ADMIN,
            status,
            UserEnvironment.LIVE,
            undefined,
          ])

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(executeTransactionManagerMock.mock.calls[0][0].length).toBe(5)
        })
      })
    })
  })

  describe('update transfer status', () => {
    const url = baseUrl + 'update-status'

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const payload = {
          transferId: '',
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
          transferId: '',
          status: '',
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"transferId" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      describe('given status was reversed', () => {
        it('should execute 3 transactions', async () => {
          const admin = await userModel.create(adminA)
          const user = await userModel.create({ ...userA, _id: userA_id })

          const token = Encryption.createToken(admin)

          const transfer = await transferModel.create({
            ...transferA,
            _id: transferA_id,
            fromUser: user._id,
          })

          const status = TransferStatus.REVERSED

          const payload = {
            transferId: transfer._id,
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
            transfer: {
              _id: transferModelReturn._id,
              collection: transferModelReturn.collection,
            },
          })

          expect(updateStatusTransactionTransferMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTransactionTransferMock).toHaveBeenCalledWith(
            transfer._id.toString(),
            status
          )

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(1)
          expect(fundTransactionUserMock).toHaveBeenCalledWith(
            transferAObj.fromUser,
            transferAObj.account,
            +(transferAObj.amount + transferAObj.fee),
            undefined
          )

          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledTimes(
            1
          )
          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledWith(
            transferAObj._id,
            status
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)
          expect(createTransactionNotificationMock).toHaveBeenCalledWith(
            `Your transfer of ${formatNumber.toDollar(
              transferAObj.amount
            )} was ${status}`,
            NotificationCategory.TRANSFER,
            transferAObj,
            NotificationForWho.USER,
            TransferStatus.REVERSED,
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
      describe('given status was successful', () => {
        it('should return a 200 and the transfer payload', async () => {
          const admin = await userModel.create(adminA)
          const token = Encryption.createToken(admin)
          const user = await userModel.create({ ...userA, _id: userA_id })

          const transfer = await transferModel.create({
            ...transferA,
            _id: transferA_id,
            fromUser: user._id,
          })

          const status = TransferStatus.SUCCESSFUL

          const payload = {
            transferId: transfer._id,
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
            transfer: {
              _id: transferModelReturn._id,
              collection: transferModelReturn.collection,
            },
          })

          expect(updateStatusTransactionTransferMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTransactionTransferMock).toHaveBeenCalledWith(
            transfer._id.toString(),
            status
          )

          expect(fundTransactionUserMock).toHaveBeenCalledTimes(1)
          expect(fundTransactionUserMock).toHaveBeenCalledWith(
            transferAObj.toUser,
            UserAccount.MAIN_BALANCE,
            +transferAObj.amount,
            undefined
          )

          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledTimes(
            1
          )
          expect(updateStatusTransactionTransactionMock).toHaveBeenCalledWith(
            transferAObj._id,
            status
          )

          expect(createTransactionNotificationMock).toHaveBeenCalledTimes(2)
          expect(createTransactionNotificationMock.mock.calls[0]).toEqual([
            `${
              transferAObj.fromUserObject.username
            } just sent you ${formatNumber.toDollar(transfer.amount)}.`,
            NotificationCategory.TRANSFER,
            expect.any(Object),
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            expect.any(Object),
          ])
          expect(createTransactionNotificationMock.mock.calls[1]).toEqual([
            `Your transfer of ${formatNumber.toDollar(
              transferAObj.amount
            )} was ${status}`,
            NotificationCategory.TRANSFER,
            transferAObj,
            NotificationForWho.USER,
            status,
            UserEnvironment.LIVE,
            expect.any(Object),
          ])

          expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

          expect(executeTransactionManagerMock.mock.calls[0][0].length).toBe(6)
        })
      })
    })
  })

  describe('delete transfer', () => {
    // const url = baseUrl + `delete/:transferId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const url = baseUrl + `delete/transferId`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given transfer id those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = baseUrl + `delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given transfer has not been settled', () => {
      it('should return a 400', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const transfer = await transferModel.create(transferA)

        const url = baseUrl + `delete/${transfer._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and the transfer payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const transfer = await transferModel.create({
          ...transferA,
          status: TransferStatus.SUCCESSFUL,
        })

        const url = baseUrl + `delete/${transfer._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
      })
    })
  })

  describe('get all users transfer transactions', () => {
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
      it('should return a 200 and an empty array of transfer payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          transfers: [],
        })

        const transferCounts = await transferModel.count()

        expect(transferCounts).toBe(0)
      })
      it('should return a 200 and an array of transfer payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await userModel.create({ ...userA, _id: userA_id })
        await userModel.create({ ...userB, _id: userB_id })
        const transfer = await transferModel.create(transferA)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transfers.length).toBe(1)
        expect(body.data.transfers[0].account).toBe(transfer.account)
        expect(body.data.transfers[0].amount).toBe(transfer.amount)
        expect(body.data.transfers[0].status).toBe(transfer.status)
        expect(body.data.transfers[0].fromUser._id).toBe(
          transfer.fromUser.toString()
        )
        expect(body.data.transfers[0].fromUser.username).toBe(
          transfer.fromUserObject.username
        )
        expect(body.data.transfers[0].toUser._id).toBe(
          transfer.toUser.toString()
        )
        expect(body.data.transfers[0].toUser.username).toBe(
          transfer.toUserObject.username
        )

        const transferCounts = await transferModel.count()

        expect(transferCounts).toBe(1)
      })
    })
  })

  describe('get one transfer transaction', () => {
    // const url = baseUrl + `:transfer`
    describe('given user is not logged in', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = baseUrl + 'transferId'
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given transfer those not exist', () => {
      it('should throw a 404 error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = baseUrl + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given transfer those not belongs to logged in user', () => {
      it('should throw a 404 error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const transfer = await transferModel.create(transferA)

        const url = baseUrl + transfer._id

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const transferCounts = await transferModel.count()

        expect(transferCounts).toBe(1)
      })
    })

    describe('given all validations passed', () => {
      describe('given from user', () => {
        it('should return a 200 and the transfer payload', async () => {
          const user = await userModel.create(userA)
          const token = Encryption.createToken(user)
          const transfer = await transferModel.create({
            ...transferA,
            fromUser: user._id,
          })

          const url = baseUrl + transfer._id

          const { statusCode, body } = await request
            .get(url)
            .set('Authorization', `Bearer ${token}`)

          expect(body.message).toBe('Transfer history fetched successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(HttpResponseStatus.SUCCESS)

          body.data.transfer.id = transfer._id.toString()

          expect(Helpers.deepClone(body.data.transfer)).toEqual(
            Helpers.deepClone(transfer.toObject({ getters: true }))
          )

          const transferCounts = await transferModel.count()

          expect(transferCounts).toBe(1)
        })
      })
      describe('given to user', () => {
        it('should return a 200 and the transfer payload', async () => {
          const user = await userModel.create(userA)
          const token = Encryption.createToken(user)
          const transfer = await transferModel.create({
            ...transferA,
            toUser: user._id,
          })

          const url = baseUrl + transfer._id

          const { statusCode, body } = await request
            .get(url)
            .set('Authorization', `Bearer ${token}`)

          expect(body.message).toBe('Transfer history fetched successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(HttpResponseStatus.SUCCESS)

          body.data.transfer.id = transfer._id.toString()
          expect(Helpers.deepClone(body.data.transfer)).toEqual(
            Helpers.deepClone(transfer.toObject({ getters: true }))
          )

          const transferCounts = await transferModel.count()

          expect(transferCounts).toBe(1)
        })
      })
    })
  })

  describe('get one user transfer transaction', () => {
    // const url = baseUrl + `master/:transfer`
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

    describe('given transfer those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = baseUrl + `master/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer transaction not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the transfer payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const transfer = await transferModel.create(transferA)
        const url = baseUrl + `master/${transfer._id}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        body.data.transfer.id = transfer._id.toString()

        expect(Helpers.deepClone(body.data)).toEqual(
          Helpers.deepClone({
            transfer: transfer.toObject({ getters: true }),
          })
        )
      })
    })
  })

  describe('get current user transfer transactions', () => {
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
      it('should return a 200 and the an empty array of transfer payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.transfers).toEqual([])
      })

      it('should return a 200 and the an array of transfer payload', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        await transferModel.create({
          ...transferA,
          fromUser: user._id,
        })

        await transferModel.create({
          ...transferA,
          toUser: user._id,
        })

        await transferModel.create({
          ...transferA,
          toUser: user._id,
          status: TransferStatus.SUCCESSFUL,
        })

        await transferModel.create({
          ...transferA,
          fromUser: new Types.ObjectId().toString(),
        })

        await transferModel.create({
          ...transferA,
          toUser: new Types.ObjectId().toString(),
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.transfers.length).toBe(2)
      })
    })
  })
})
