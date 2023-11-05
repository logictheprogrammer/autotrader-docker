import { IDepositMethod } from './../depositMethod.interface'
import { request } from '../../../test'
import depositMethodModel from '../../../modules/depositMethod/depositMethod.model'
import { depositMethodA } from './depositMethod.payload'
import { depositMethodService } from '../../../setup'
import { Types } from 'mongoose'

describe('deposit method', () => {
  request
  describe('fetch deposit method', () => {
    describe('given deposit method those not exist', () => {
      it('should throw an error', async () => {
        try {
          await depositMethodService.fetch({ _id: new Types.ObjectId() })
        } catch (error: any) {
          expect(error.message).toBe('Deposit method not found')
        }
      })
    })

    describe('given deposit method exist', () => {
      it('should return the depositMethod payload', async () => {
        const depositMethod = await depositMethodModel.create(depositMethodA)

        const result = await depositMethodService.fetch({
          _id: depositMethod._id,
        })

        expect(result._id).toEqual(depositMethod._id)
      })
    })
  })
})
