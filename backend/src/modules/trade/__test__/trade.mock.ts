import { tradeService } from '../../../setup'

import { tradeAObj } from './trade.payload'

export const createTradeMock = jest
  .spyOn(tradeService, 'create')
  .mockResolvedValue(tradeAObj)

export const updateStatusTradeMock = jest
  .spyOn(tradeService, 'updateStatus')
  .mockResolvedValue(tradeAObj)

export const updateTradeMock = jest
  .spyOn(tradeService, 'update')
  .mockResolvedValue(tradeAObj)

export const deleteTradeMock = jest
  .spyOn(tradeService, 'delete')
  .mockResolvedValue(tradeAObj)
