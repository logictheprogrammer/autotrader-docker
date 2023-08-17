import { IDepositMethod } from './../depositMethod.interface'
import AppRepository from '../../../modules/app/app.repository'
import { request } from '../../../test'
import depositMethodModel from '../../../modules/depositMethod/depositMethod.model'
import { Types } from 'mongoose'
import { depositMethodA } from './depositMethod.payload'
import { depositMethodService } from '../../../setup'

const depositMethodRepository = new AppRepository<IDepositMethod>(
  depositMethodModel
)

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
        const depositMethod = await depositMethodRepository
          .create(depositMethodA)
          .save()

        const result = await depositMethodService.get(depositMethod._id)

        expect(result).toEqual(depositMethodRepository.toObject(depositMethod))
      })
    })
  })
})
