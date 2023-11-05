import { mathService, mathUtility } from '../../../setup'
import { request } from '../../../test'

describe('Math Service', () => {
  // _getValues
  describe('_getValues(averageValueOne, averageValueTwo, spread, breakpoint)', () => {
    request

    const testCase = [
      {
        ref: 1,
        averageValueOne: 1,
        averageValueTwo: 2,
        spread: 1,
        breakpoint: -2,
      },
      {
        ref: 2,
        averageValueOne: -3,
        averageValueTwo: 5,
        spread: -2,
        breakpoint: 1,
      },
      {
        ref: 3,
        averageValueOne: -3,
        averageValueTwo: -10,
        spread: 5,
        breakpoint: 10.8,
      },
      {
        ref: 4,
        averageValueOne: 3,
        averageValueTwo: 0.8,
        spread: 7,
        breakpoint: 3,
      },
      {
        ref: 5,
        averageValueOne: 8,
        averageValueTwo: 8,
        spread: 3.985,
        breakpoint: 3,
      },
      {
        ref: 6,
        averageValueOne: 0,
        averageValueTwo: 0,
        spread: 8,
        breakpoint: 4,
      },
    ]

    test.each(testCase)(
      'should return an array of random number for the aguements of ref-$ref',
      ({ averageValueOne, averageValueTwo, spread, breakpoint }) => {
        const expectedNumbers = mathService._getValues(
          averageValueOne,
          averageValueTwo,
          spread,
          breakpoint
        )

        // sanitizing inputs
        breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
        spread = Math.abs(spread)
        averageValueOne = Math.abs(averageValueOne)
        averageValueTwo = Math.abs(averageValueTwo)

        const minAverageRange = Math.min(averageValueOne, averageValueTwo)
        const maxAverageRange = Math.max(averageValueOne, averageValueTwo)

        // constants
        const difference = Math.abs(minAverageRange * spread)

        // get the smallest and largest possible value
        const min = minAverageRange - difference
        const max = maxAverageRange + difference

        expect(expectedNumbers[expectedNumbers.length / 2 - 1]).toBe(
          minAverageRange
        )
        expect(expectedNumbers[expectedNumbers.length / 2]).toBe(
          maxAverageRange
        )
        expect(Math.max(...expectedNumbers)).toBeGreaterThanOrEqual(max)
        expect(Math.min(...expectedNumbers)).toBeLessThanOrEqual(min)
        expect(expectedNumbers.length).toBe(2 + breakpoint * 2)
      }
    )
  })

  // _getValuesProbability
  describe('_getValuesProbability(breakpoint, probability)', () => {
    request

    const testCase = [
      {
        ref: 1,
        breakpoint: 2,
        probability: 0.76,
      },
      {
        ref: 2,
        breakpoint: -1,
        probability: 0.9,
      },
      {
        ref: 3,
        breakpoint: 10.9,
        probability: 1,
      },
      {
        ref: 4,
        breakpoint: 3,
        probability: 0.5,
      },
      {
        ref: 5,
        breakpoint: 3,
        probability: 2,
      },
      {
        ref: 6,
        breakpoint: 4,
        probability: 0,
      },
      {
        ref: 7,
        breakpoint: 4,
        probability: -1,
      },
    ]

    test.each(testCase)(
      'should return half of the remaining values probability for the aguements of ref-$ref',
      ({ breakpoint, probability }) => {
        const expectedNumbers = mathService._getValuesProbability(
          breakpoint,
          probability
        ) as number[]

        // sanitizing inputs
        breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
        probability =
          probability > 1 ? 1 : probability < 0.5 ? 0.5 : probability

        const totalSum = expectedNumbers.reduce((acc, curr) => (acc += curr), 0)

        expect(totalSum).toBeGreaterThanOrEqual(0)
        expect(totalSum).toBeLessThanOrEqual(1)
        expect(1 - totalSum * 2).toBe(probability)
        expect(expectedNumbers.length).toBe(breakpoint)
      }
    )
  })

  // _getNegativeUnit
  describe('_getNegativeUnit(spread, breakpoint)', () => {
    request

    const testCase = [
      {
        ref: 1,
        spread: 1,
        breakpoint: -2,
      },
      {
        ref: 2,
        spread: -2,
        breakpoint: 1,
      },
      {
        ref: 3,
        spread: 5,
        breakpoint: 10.8,
      },
      {
        ref: 4,
        spread: 7,
        breakpoint: 3,
      },
      {
        ref: 5,
        spread: 3.985,
        breakpoint: 3,
      },
      {
        ref: 6,
        spread: 8,
        breakpoint: 4,
      },
      {
        ref: 6,
        spread: 0,
        breakpoint: 4,
      },
    ]

    test.each(testCase)(
      'should return the sum of negative unit value (from the left to the right) that meets approximatly at zero for the aguements of ref-$ref',
      ({ spread, breakpoint }) => {
        const result = mathService._getNegativeUnit(spread, breakpoint)

        // sanitizing inputs
        breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
        spread = Math.abs(spread)
        spread = spread < 2 ? 2 : spread

        const expectedValue = ((spread - 1) / spread) * breakpoint

        expect(result).toBe(expectedValue)
        expect(result).toBeLessThan(breakpoint)
      }
    )
  })

  // _getPercentageLoss
  describe('_getPercentageLoss(spread, breakpoint, probability)', () => {
    request

    const testCase = [
      {
        ref: 1,
        spread: 1,
        breakpoint: -2,
        probability: 0.76,
      },
      {
        ref: 2,
        spread: -2,
        breakpoint: 1,
        probability: 0.9,
      },
      {
        ref: 3,
        spread: 5,
        breakpoint: 10.8,
        probability: 0.5,
      },
      {
        ref: 4,
        spread: 7,
        breakpoint: 3,
        probability: 0.5,
      },
      {
        ref: 5,
        spread: 3.985,
        breakpoint: 3,
        probability: 2,
      },
      {
        ref: 6,
        spread: 8,
        breakpoint: 4,
        probability: 0,
      },
    ]

    test.each(testCase)(
      'should return a the rate at which a loss will occure of ref-$ref',
      ({ spread, breakpoint, probability }) => {
        const result = mathService._getPercentageLoss(
          spread,
          breakpoint,
          probability
        )

        // sanitizing inputs
        breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
        spread = Math.abs(spread)
        spread = spread < 2 ? 2 : spread
        probability =
          probability > 1 ? 1 : probability < 0.5 ? 0.5 : probability

        const maxValue = ((spread - 1) / spread) * (1 - probability)

        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThanOrEqual(0.23)
        expect(result).toBeLessThanOrEqual(maxValue)
      }
    )
  })

  // dynamicRangeOptions
  describe('dynamicRangeOptions(winRate)', () => {
    request

    const testCase = [
      {
        ref: 1,
        winRate: mathUtility.getRandomNumberFromRange(0.77, 0.95),
      },
      {
        ref: 2,
        winRate: mathUtility.getRandomNumberFromRange(0.77, 0.95),
      },
      {
        ref: 3,
        winRate: mathUtility.getRandomNumberFromRange(0.77, 0.95),
      },
      {
        ref: 4,
        winRate: mathUtility.getRandomNumberFromRange(0.77, 0.95),
      },
      {
        ref: 5,
        winRate: mathUtility.getRandomNumberFromRange(0.77, 0.95),
      },
      {
        ref: 6,
        winRate: mathUtility.getRandomNumberFromRange(0.77, 0.95),
      },
    ]

    test.each(testCase)(
      'should return a dynamic value based of the provided averages of ref-$ref',
      ({ winRate }) => {
        const result = mathService.dynamicRangeOptions(winRate)

        expect(result.spread).toBeGreaterThanOrEqual(2)
        expect(result.spread).toBeLessThanOrEqual(12.5)

        expect(result.breakpoint).toBeGreaterThanOrEqual(1)
        expect(result.breakpoint).toBeLessThanOrEqual(7)

        expect(result.probability).toBeGreaterThanOrEqual(0.5)
        expect(result.probability).toBeLessThanOrEqual(0.9)
      }
    )
  })

  // dynamicRange
  describe('dynamicRange(averageValueOne, averageValueTwo, spread, breakpoint, probability)', () => {
    request

    const testCase = [
      {
        ref: 1,
        averageValueOne: 1,
        averageValueTwo: 2,
        spread: 1,
        breakpoint: -2,
        probability: 0.76,
      },
      {
        ref: 2,
        averageValueOne: -3,
        averageValueTwo: 5,
        spread: -2,
        breakpoint: 1,
        probability: 0.9,
      },
      {
        ref: 3,
        averageValueOne: -3,
        averageValueTwo: -10,
        spread: 5,
        breakpoint: 10.8,
        probability: 1,
      },
      {
        ref: 4,
        averageValueOne: 3,
        averageValueTwo: 0.8,
        spread: 7,
        breakpoint: 3,
        probability: 0.5,
      },
      {
        ref: 5,
        averageValueOne: 8,
        averageValueTwo: 8,
        spread: 3.985,
        breakpoint: 3,
        probability: 2,
      },
      {
        ref: 6,
        averageValueOne: 0,
        averageValueTwo: 0,
        spread: 8,
        breakpoint: 4,
        probability: 0,
      },
    ]

    test.each(testCase)(
      'should return a dynamic value based of the provided averages of ref-$ref',
      ({
        averageValueOne,
        averageValueTwo,
        spread,
        breakpoint,
        probability,
      }) => {
        const expectedValue = mathService.dynamicRange(
          averageValueOne,
          averageValueTwo,
          spread,
          breakpoint,
          probability
        )

        // sanitizing inputs
        breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
        spread = Math.abs(spread)
        averageValueOne = Math.abs(averageValueOne)
        averageValueTwo = Math.abs(averageValueTwo)

        const minAverageRange = Math.min(averageValueOne, averageValueTwo)
        const maxAverageRange = Math.max(averageValueOne, averageValueTwo)

        // constants
        const difference = Math.abs(minAverageRange * spread)

        // get the smallest and largest possible value
        const min = minAverageRange - difference
        const max = maxAverageRange + difference

        expect(min).toBeLessThanOrEqual(expectedValue)
        expect(max).toBeGreaterThanOrEqual(expectedValue)
      }
    )
  })
})
