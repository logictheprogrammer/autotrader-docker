import { userBInput } from './../../user/__test__/user.payload'
import Helpers from '../../../utils/helpers'
import Cryptograph from '../../../core/cryptograph'
import { createNotificationMock } from '../../notification/__test__/notification.mock'
import { createTransactionMock } from '../../transaction/__test__/transaction.mock'
import transferModel from '../../transfer/transfer.model'
import {
  NotificationTitle,
  NotificationForWho,
} from '../../notification/notification.enum'
import { TransactionTitle } from '../../transaction/transaction.enum'
import { TransferStatus } from '../../transfer/transfer.enum'
import { request } from '../../../test'
import {
  adminAInput,
  notFoundUser,
  userA,
  userAInput,
  userAObj,
  userA_id,
  userB,
  userBObj,
  userB_id,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'

import { transferA, transferA_id, transferAObj } from './transfer.payload'

import { fundUserMock } from '../../user/__test__/user.mock'
import { UserAccount, UserEnvironment } from '../../user/user.enum'

import transferSettingsModel from '../../transferSettings/transferSettings.model'
import {
  transferSettingsA,
  transferSettingsB,
} from '../../transferSettings/__test__/transferSettings.payload'

import { Types } from 'mongoose'
import { StatusCode } from '../../../core/apiResponse'

describe('transfer', () => {
  const baseUrl = '/api/transfer/'
  const masterUrl = '/api/master/transfer/'
  describe('create transfer', () => {
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
          toUserUsername: userB.username,
          account: UserAccount.MAIN_BALANCE,
          // amount: 1000,
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
    describe('given the recipient was not found', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          toUserUsername: notFoundUser.username,
          account: UserAccount.MAIN_BALANCE,
          amount: 1000,
        }

        await transferSettingsModel.create(transferSettingsA)

        const user = await userModel.create({ ...userAInput, _id: userA_id })
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(`User not found`)
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
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

        const user = await userModel.create({ ...userAInput, _id: userA_id })
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('You can not transfer to your own account')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
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

          const user = await userModel.create({ ...userAInput, _id: userA_id })
          const user2 = await userModel.create({ ...userBInput, _id: userB_id })

          const fromUser = userAObj
          const toUser = userBObj

          const token = Cryptograph.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Transfer registered successfully')
          expect(statusCode).toBe(201)
          expect(body.status).toBe(StatusCode.SUCCESS)
          expect(body.data.transfer.amount).toBe(payload.amount)
          expect(body.data.transfer.account).toBe(payload.account)
          expect(body.data.transfer.toUser.username).toBe(
            payload.toUserUsername
          )
          expect(body.data.transfer.fromUser.username).toBe(user.username)

          const transferCount = await transferModel.count({
            _id: body.data.transfer._id,
          })

          expect(transferCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(2)
          expect(fundUserMock.mock.calls[0]).toEqual([
            { _id: user._id },
            payload.account,
            -(payload.amount + transferSettingsA.fee),
          ])
          expect(fundUserMock.mock.calls[1]).toEqual([
            { _id: user2._id },
            UserAccount.MAIN_BALANCE,
            payload.amount,
          ])

          expect(createTransactionMock).toHaveBeenCalledTimes(2)
          expect(createTransactionMock.mock.calls[0]).toEqual([
            expect.objectContaining(fromUser),
            TransactionTitle.TRANSFER_SENT,
            expect.any(Object),
            payload.amount,
            UserEnvironment.LIVE,
            undefined,
          ])
          expect(createTransactionMock.mock.calls[1]).toEqual([
            expect.objectContaining(toUser),
            TransactionTitle.TRANSFER_RECIEVED,
            expect.any(Object),
            payload.amount,
            UserEnvironment.LIVE,
            undefined,
          ])

          expect(createNotificationMock).toHaveBeenCalledTimes(3)
          expect(createNotificationMock.mock.calls[0]).toEqual([
            `Your transfer of ${Helpers.toDollar(payload.amount)} to ${
              payload.toUserUsername
            } was successful.`,
            NotificationTitle.TRANSFER_SENT,
            expect.any(Object),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            fromUser,
          ])

          expect(createNotificationMock.mock.calls[1]).toEqual([
            `${fromUser.username} just sent you ${Helpers.toDollar(
              payload.amount
            )}.`,
            NotificationTitle.TRANSFER_RECIEVED,
            expect.any(Object),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            toUser,
          ])

          expect(createNotificationMock.mock.calls[2]).toEqual([
            `${
              fromUser.username
            } just made a successful transfer of ${Helpers.toDollar(
              payload.amount
            )} to ${toUser.username}`,
            NotificationTitle.TRANSFER_SENT,
            expect.any(Object),
            NotificationForWho.ADMIN,
            UserEnvironment.LIVE,
            undefined,
          ])
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

          await userModel.create(userBInput)
          const user = await userModel.create({ ...userAInput, _id: userA_id })

          const fromUser = userAObj
          const toUser = userBObj

          const token = Cryptograph.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Transfer registered successfully')
          expect(statusCode).toBe(201)
          expect(body.status).toBe(StatusCode.SUCCESS)

          expect(body.data.transfer.amount).toBe(payload.amount)
          expect(body.data.transfer.account).toBe(payload.account)
          expect(body.data.transfer.toUser.username).toBe(
            payload.toUserUsername
          )
          expect(body.data.transfer.fromUser.username).toBe(user.username)

          const transferCount = await transferModel.count({
            _id: body.data.transfer._id,
          })

          expect(transferCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(1)
          expect(fundUserMock.mock.calls[0]).toEqual([
            { _id: user._id },
            payload.account,
            -(payload.amount + transferSettingsB.fee),
          ])

          expect(createTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionMock.mock.calls[0]).toEqual([
            expect.objectContaining(fromUser),
            TransactionTitle.TRANSFER_SENT,
            expect.any(Object),
            payload.amount,
            UserEnvironment.LIVE,
          ])

          expect(createNotificationMock).toHaveBeenCalledTimes(2)
          expect(createNotificationMock.mock.calls[0]).toEqual([
            `Your transfer of ${Helpers.toDollar(payload.amount)} to ${
              payload.toUserUsername
            } is ongoing.`,
            NotificationTitle.TRANSFER_SENT,
            expect.any(Object),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            fromUser,
          ])

          expect(createNotificationMock.mock.calls[1]).toEqual([
            `${
              fromUser.username
            } just made a transfer request of ${Helpers.toDollar(
              payload.amount
            )} to ${toUser.username} awaiting for your approver`,
            NotificationTitle.TRANSFER_SENT,
            expect.any(Object),
            NotificationForWho.ADMIN,
            UserEnvironment.LIVE,
            undefined,
          ])
        })
      })
    })
  })

  describe('update transfer status', () => {
    // const url = masterUrl + `update-status/:transferId`

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

        expect(body.message).toBe(
          '"status" must be one of [successful, reversed]'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given all validations passed', () => {
      describe('given status was reversed', () => {
        it('should execute 3 transactions', async () => {
          const admin = await userModel.create(adminAInput)
          const user = await userModel.create({ ...userAInput, _id: userA_id })

          const token = Cryptograph.createToken(admin)

          const transfer = await transferModel.create({
            ...transferA,
            _id: transferA_id,
            fromUser: user._id,
          })

          const status = TransferStatus.REVERSED

          const payload = {
            status,
          }

          const url = masterUrl + `update-status/${transfer._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)
          expect(body.data.transfer._id).toBe(transfer._id.toString())
          expect(body.data.transfer.status).toBe(status)

          const transferCount = await transferModel.count({
            _id: body.data.transfer._id,
            status: payload.status,
          })

          expect(transferCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(1)
          expect(fundUserMock).toHaveBeenCalledWith(
            transferAObj.fromUser,
            transferAObj.account,
            +(transferAObj.amount + transferAObj.fee)
          )

          expect(createTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionMock.mock.calls[0]).toEqual([
            expect.objectContaining({ _id: userA_id }),
            TransactionTitle.TRANSFER_REVERSED,
            expect.any(Object),
            transfer.amount,
            UserEnvironment.LIVE,
          ])

          expect(createNotificationMock).toHaveBeenCalledTimes(1)
          expect(createNotificationMock).toHaveBeenCalledWith(
            `Your transfer of ${Helpers.toDollar(
              transferAObj.amount
            )} was not successful`,
            NotificationTitle.TRANSFER_REVERSED,
            expect.objectContaining({
              _id: transfer._id,
            }),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            expect.any(Object)
          )
        })
      })
      describe('given status was successful', () => {
        it('should return a 200 and the transfer payload', async () => {
          const admin = await userModel.create(adminAInput)
          const token = Cryptograph.createToken(admin)
          const user = await userModel.create({ ...userAInput, _id: userA_id })
          const user2 = await userModel.create({ ...userBInput, _id: userB_id })

          const transfer = await transferModel.create({
            ...transferA,
            _id: transferA_id,
            fromUser: user._id,
          })

          const status = TransferStatus.SUCCESSFUL

          const payload = {
            status,
          }

          const url = masterUrl + `update-status/${transfer._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)
          expect(body.data.transfer._id).toBe(transfer._id.toString())
          expect(body.data.transfer.status).toBe(payload.status)

          const transferCount = await transferModel.count({
            _id: body.data.transfer._id,
            status: payload.status,
          })

          expect(transferCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(1)
          expect(fundUserMock).toHaveBeenCalledWith(
            transferAObj.toUser,
            UserAccount.MAIN_BALANCE,
            +transferAObj.amount
          )

          expect(createNotificationMock).toHaveBeenCalledTimes(1)
          expect(createNotificationMock).toHaveBeenNthCalledWith(
            1,
            `${userAInput.username} just sent you ${Helpers.toDollar(
              transfer.amount
            )}.`,
            NotificationTitle.TRANSFER_RECIEVED,
            expect.any(Object),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            expect.any(Object)
          )
        })
      })
    })
  })

  describe('delete transfer', () => {
    // const url = masterUrl + `delete/:transferId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = masterUrl + `delete/transferId`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given transfer id those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given transfer has not been settled', () => {
      it('should return a 400', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const transfer = await transferModel.create(transferA)

        const url = masterUrl + `delete/${transfer._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and the transfer payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const transfer = await transferModel.create({
          ...transferA,
          status: TransferStatus.SUCCESSFUL,
        })

        const url = masterUrl + `delete/${transfer._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
      })
    })
  })

  describe('get all users transfer transactions', () => {
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
      it('should return a 200 and an empty array of transfer payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          transfers: [],
        })

        const transferCounts = await transferModel.count()

        expect(transferCounts).toBe(0)
      })
      it('should return a 200 and an array of transfer payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        await userModel.create({ ...userAInput, _id: userA_id })
        await userModel.create({ ...userBInput, _id: userB_id })
        const transfer = await transferModel.create(transferA)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.transfers.length).toBe(1)
        expect(body.data.transfers[0].account).toBe(transfer.account)
        expect(body.data.transfers[0].amount).toBe(transfer.amount)
        expect(body.data.transfers[0].status).toBe(transfer.status)
        expect(body.data.transfers[0].fromUser._id).toBe(
          transfer.fromUser.toString()
        )
        expect(body.data.transfers[0].fromUser.username).toBe(
          userAInput.username
        )
        expect(body.data.transfers[0].toUser._id).toBe(
          transfer.toUser.toString()
        )
        expect(body.data.transfers[0].toUser.username).toBe(userBInput.username)

        const transferCounts = await transferModel.count()

        expect(transferCounts).toBe(1)
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
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the an empty array of transfer payload', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Transfer fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.transfers).toEqual([])
      })

      it('should return a 200 and the an array of transfer payload', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
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

        expect(body.message).toBe('Transfer fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.transfers.length).toBe(3)
      })
    })
  })
})
