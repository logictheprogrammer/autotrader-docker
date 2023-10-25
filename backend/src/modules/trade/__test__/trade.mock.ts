import { ITrade } from '../trade.interface'
import tradeModel from '../trade.model'
import TradeService from '../trade.service'
import {
  tradeAObj,
  tradeA_id,
  tradeBObj,
  tradeB_id,
  tradeModelReturn,
} from './trade.payload'

export const createTradeMock = jest
  .spyOn(TradeService.prototype, 'create')
  .mockResolvedValue(tradeAObj)

// export const updateStatusTradeMock = jest
//   .spyOn(TradeService.prototype, 'updateStatus')
//   .mockImplementation(({ _id: tradeId }) => {
//     if (tradeId.toString() === tradeA_id) {
//       return Promise.resolve(tradeAObj)
//     }
//     if (tradeId.toString() === tradeB_id) {
//       return Promise.resolve(tradeBObj)
//     }
//     return Promise.reject('Mock: unknown trade Id')
//   })
