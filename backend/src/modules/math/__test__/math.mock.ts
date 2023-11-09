import MathService from '../math.service'

export const dynamicRangeMock = jest
  .spyOn(MathService.prototype, 'dynamicRange')
  .mockImplementation((minValue, ...restParams) => {
    return minValue
  })

export const dynamicRangeOptionsMock = jest
  .spyOn(MathService.prototype, 'dynamicRangeOptions')
  .mockImplementation((winRate) => {
    return {
      breakpoint: 1,
      spread: 2,
      probability: 0.5,
    }
  })
