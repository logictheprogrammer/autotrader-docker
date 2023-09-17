import { IDepositMethod } from './../depositMethod.interface'
import { request } from '../../../test'
import depositMethodModel from '../../../modules/depositMethod/depositMethod.model'
import { depositMethodA } from './depositMethod.payload'
import { depositMethodService } from '../../../setup'
import { Types } from 'mongoose'

describe('deposit method', () => {
  request
  describe('get deposit method', () => {
    describe('given deposit method those not exist', () => {
      it('should throw an error', async () => {
        await expect(
          depositMethodService.get(new Types.ObjectId())
        ).rejects.toThrow('Deposit method not found')
      })
    })

    describe('given deposit method exist', () => {
      it('should return the depositMethod payload', async () => {
        const depositMethod = await depositMethodModel.create(depositMethodA)

        const result = await depositMethodService.get(depositMethod._id)

        expect(result).toEqual(depositMethod.toObject({ getters: true }))
      })
    })
  })
})
