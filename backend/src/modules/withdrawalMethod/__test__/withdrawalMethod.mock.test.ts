import { request } from '../../../test'
import withdrawalMethodModel from '../../../modules/withdrawalMethod/withdrawalMethod.model'
import { withdrawalMethodA } from './withdrawalMethod.payload'
import { withdrawalMethodService } from '../../../setup'
import AppRepository from '../../app/app.repository'
import { IWithdrawalMethod } from '../withdrawalMethod.interface'
import AppObjectId from '../../app/app.objectId'

const withdrawalMethodRepository = new AppRepository<IWithdrawalMethod>(
  withdrawalMethodModel
)

describe('withdrawal method', () => {
  request
  describe('get withdrawal method', () => {
    describe('given withdrawal method those not exist', () => {
      it('should throw an error', async () => {
        await expect(
          withdrawalMethodService.get(new AppObjectId())
        ).rejects.toThrow('Withdrawal method not found')
      })
    })

    describe('given withdrawal method exist', () => {
      it('should return the withdrawalMethod payload', async () => {
        const withdrawalMethod = await withdrawalMethodRepository
          .create(withdrawalMethodA)
          .save()

        const result = await withdrawalMethodService.get(withdrawalMethod._id)

        expect(result).toEqual(withdrawalMethod.toObject())
      })
    })
  })
})
