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

export const createTransactionTradeMock = jest
  .spyOn(TradeService.prototype, '_createTransaction')
  .mockResolvedValue({
    object: tradeAObj,
    instance: {
      model: tradeModelReturn,
      onFailed: 'delete trade',
      async callback() {},
    },
  })

export const updateStatusTransactionTradeMock = jest
  .spyOn(TradeService.prototype, '_updateStatusTransaction')
  .mockImplementation((tradeId) => {
    if (tradeId.toString() === tradeA_id) {
      return Promise.resolve({
        object: tradeAObj,
        instance: {
          model: tradeModelReturn,
          onFailed: 'change trade status to old status',
          async callback() {},
        },
      })
    }
    if (tradeId.toString() === tradeB_id) {
      return Promise.resolve({
        object: tradeBObj,
        instance: {
          model: tradeModelReturn,
          onFailed: 'change trade status to old status',
          async callback() {},
        },
      })
    }
    return Promise.reject('Mock: unknown trade status')
  })
