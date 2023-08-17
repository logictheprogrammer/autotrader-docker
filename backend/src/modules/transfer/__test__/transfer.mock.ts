import AppRepository from '../../app/app.repository'
import { ITransfer } from '../transfer.interface'
import transferModel from '../transfer.model'
import TransferService from '../transfer.service'
import {
  transferAObj,
  transferA_id,
  transferBObj,
  transferB_id,
  transferModelReturn,
} from './transfer.payload'

const transferRepository = new AppRepository<ITransfer>(transferModel)

export const createTransactionTransferMock = jest
  .spyOn(TransferService.prototype, '_createTransaction')
  .mockResolvedValue({
    object: transferAObj,
    instance: {
      model: transferRepository.toClass(transferModelReturn),
      onFailed: 'delete transfer',
      async callback() {},
    },
  })

export const updateStatusTransactionTransferMock = jest
  .spyOn(TransferService.prototype, '_updateStatusTransaction')
  .mockImplementation((transferId) => {
    if (transferId.toString() === transferA_id) {
      return Promise.resolve({
        object: transferAObj,
        instance: {
          model: transferRepository.toClass(transferModelReturn),
          onFailed: 'change transfer status to old status',
          async callback() {},
        },
      })
    }
    if (transferId.toString() === transferB_id) {
      return Promise.resolve({
        object: transferBObj,
        instance: {
          model: transferRepository.toClass(transferModelReturn),
          onFailed: 'change transfer status to old status',
          async callback() {},
        },
      })
    }
    return Promise.reject()
  })
