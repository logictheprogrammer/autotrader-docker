import TransferService from '../transfer.service'
import {
  transferAObj,
  transferA_id,
  transferBObj,
  transferB_id,
  transferInstance,
  transferModelReturn,
} from './transfer.payload'

export const createTransactionTransferMock = jest
  .spyOn(TransferService.prototype, '_createTransaction')
  .mockResolvedValue({
    object: transferAObj,
    instance: transferInstance,
  })

export const updateStatusTransactionTransferMock = jest
  .spyOn(TransferService.prototype, '_updateStatusTransaction')
  .mockImplementation((transferId) => {
    if (transferId.toString() === transferA_id) {
      return Promise.resolve({
        object: transferAObj,
        instance: {
          model: transferModelReturn,
          onFailed: 'change transfer status to old status',
          async callback() {},
        },
      })
    }
    if (transferId.toString() === transferB_id) {
      return Promise.resolve({
        object: transferBObj,
        instance: {
          model: transferModelReturn,
          onFailed: 'change transfer status to old status',
          async callback() {},
        },
      })
    }
    return Promise.reject()
  })