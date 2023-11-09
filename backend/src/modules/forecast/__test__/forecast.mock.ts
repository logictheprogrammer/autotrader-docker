import { forecastService } from '../../../setup'

import { forecastAObj } from './forecast.payload'

export const autoCreateForecastMock = jest
  .spyOn(forecastService, 'autoCreate')
  .mockResolvedValue(forecastAObj)

export const autoUpdateForecastStatusTradeMock = jest
  .spyOn(forecastService, 'autoUpdateStatus')
  .mockResolvedValue(forecastAObj)
