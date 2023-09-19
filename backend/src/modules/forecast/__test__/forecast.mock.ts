import { IForecast } from '../forecast.interface'
import forecastModel from '../forecast.model'
import ForecastService from '../forecast.service'
import {
  forecastAObj,
  forecastA_id,
  forecastBObj,
  forecastB_id,
  forecastModelReturn,
} from './forecast.payload'

export const createTransactionForecastMock = jest
  .spyOn(ForecastService.prototype, '_createTransaction')
  .mockResolvedValue({
    object: forecastAObj,
    instance: {
      model: forecastModelReturn,
      onFailed: 'delete forecast',
      async callback() {},
    },
  })

export const updateStatusTransactionForecastMock = jest
  .spyOn(ForecastService.prototype, '_updateStatusTransaction')
  .mockImplementation((forecastId) => {
    if (forecastId.toString() === forecastA_id) {
      return Promise.resolve({
        object: forecastAObj,
        instance: {
          model: forecastModelReturn,
          onFailed: 'change forecast status to old status',
          async callback() {},
        },
      })
    }
    if (forecastId.toString() === forecastB_id) {
      return Promise.resolve({
        object: forecastBObj,
        instance: {
          model: forecastModelReturn,
          onFailed: 'change forecast status to old status',
          async callback() {},
        },
      })
    }
    return Promise.reject('Mock: unknown forecast status')
  })
