import { tradeService } from '../../../setup'

import { tradeAObj } from './trade.payload'

export const createTradeMock = jest
  .spyOn(tradeService, 'create')
  .mockResolvedValue(tradeAObj)

export const updateStatusTradeMock = jest
  .spyOn(tradeService, 'updateStatus')
  .mockResolvedValue(tradeAObj)

// export const updateStatusTradeMock = jest
//   .spyOn(tradeService, 'updateStatus')
//   .mockImplementation(({ _id: tradeId }) => {
//     if (tradeId.toString() === tradeA_id) {
//       return Promise.resolve(tradeAObj)
//     }
//     if (tradeId.toString() === tradeB_id) {
//       return Promise.resolve(tradeBObj)
//     }
//     return Promise.reject('Mock: unknown trade Id')
//   })
