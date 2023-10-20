import { Inject, Service } from 'typedi'
import ServiceToken from '@/core/serviceToken'
import { IMathService, IMathUtility } from './math.interface'

@Service()
class MathService implements IMathService {
  public constructor(
    @Inject(ServiceToken.MATH_UTILITY) private mathUtility: IMathUtility
  ) {}

  /**
   * Get A Random array of numbers that meets a condition
   * @param {number} averageValueOne An Average Range Values to use as a reference
   * @param {number} averageValueTwo An Average Range Values to use as a reference
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many sub values will be generated to get to the last value
   * @returns {number} An array of Random number that meets a condition
   */
  public _getValues(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number
  ): number[] {
    // sanitizing inputs
    breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
    spread = Math.abs(spread)
    averageValueOne = Math.abs(averageValueOne)
    averageValueTwo = Math.abs(averageValueTwo)

    const minAverageRange = Math.min(averageValueOne, averageValueTwo)
    const maxAverageRange = Math.max(averageValueOne, averageValueTwo)

    // constants
    const difference = Math.abs(minAverageRange * spread)
    const unit = difference / breakpoint

    // get the smallest and largest possible value
    const min = minAverageRange - difference
    const max = maxAverageRange + difference

    // min/max values
    const minAverageRanges = []
    const maxAverageRanges = []

    for (let x = 0; x < breakpoint && spread > 0; x++) {
      const minAverageRange = min + unit * x
      const maxAverageRange = max - unit * (breakpoint - (x + 1))

      minAverageRanges.push(minAverageRange)
      maxAverageRanges.push(maxAverageRange)
    }

    // values array
    const values = [
      ...minAverageRanges,
      minAverageRange,
      maxAverageRange,
      ...maxAverageRanges,
    ]

    // console.log('Values: ', values)

    return values
  }

  /**
   * Get half of the remaining values probability
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many sub values will be generated to get to the last value
   * @param {number} probability It should only be an auguement between 0.5 to 1
   * @returns {number} half of the remaining values probability
   */
  public _getValuesProbability(
    spread: number,
    breakpoint: number,
    probability: number
  ): number[] {
    // sanitizing inputs
    breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
    spread = Math.abs(spread)
    probability = probability > 1 ? 1 : probability < 0.5 ? 0.5 : probability

    // values propability
    const valuesProbability = []

    const remainingProbability = (1 - probability) / 2

    let probSum = 0
    for (let x = 0; x < breakpoint; x++) {
      const prob = probability * (probability + 1) ** x
      valuesProbability.push(prob)
      probSum += prob
    }

    // console.log('valuesProbability: ', valuesProbability)

    const probUnit = 1 / probSum
    // set values probability
    for (let i = 0; i < breakpoint; i++) {
      valuesProbability[i] =
        remainingProbability * (probUnit * valuesProbability[i])
    }

    // console.log('valuesProbability: ', valuesProbability)

    return valuesProbability
  }

  /**
   * Get The Negative Unit value
   * @param {number} averageValueOne Should be a positive number
   * @param {number} averageValueTwo Should be a positive number
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many unit will be generted to get to the last value
   * @returns {number} The Sum Of Negative Unit value that meets approximatly at zero
   */
  public _getNegativeUnit(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number
  ): number {
    let negativeUnit: number = 0

    const values = this._getValues(
      averageValueOne,
      averageValueTwo,
      spread,
      breakpoint
    )

    const valuesCommonDifference = spread / breakpoint

    let currNegativeValue,
      nextNegativeValue,
      inbetweenNegativeValue,
      lowInbetweenNegativeValue,
      highInbetweenNegativeValue,
      loopRan = 0

    for (let x = 0; x < values.length; x++) {
      currNegativeValue = values[x]
      nextNegativeValue = values[x + 1]
      if (
        currNegativeValue < 0 &&
        (!nextNegativeValue || nextNegativeValue < 0)
      ) {
        negativeUnit += 1
      } else if (
        currNegativeValue < 0 &&
        nextNegativeValue &&
        nextNegativeValue === 0
      ) {
        negativeUnit += 1
      } else if (
        currNegativeValue < 0 &&
        nextNegativeValue &&
        nextNegativeValue > 0
      ) {
        // Using binary search to find zero in the values so as to set the correct inbetweenNegativeValue
        lowInbetweenNegativeValue = currNegativeValue
        highInbetweenNegativeValue = nextNegativeValue
        inbetweenNegativeValue =
          0.5 * valuesCommonDifference + currNegativeValue

        // console.log('lowInbetweenNegativeValue: ', lowInbetweenNegativeValue)
        // console.log('highInbetweenNegativeValue: ', highInbetweenNegativeValue)
        // console.log('inbetweenNegativeValue: ', inbetweenNegativeValue)

        while (true) {
          loopRan++
          if (
            inbetweenNegativeValue === 0 ||
            (inbetweenNegativeValue < 0.000001 &&
              inbetweenNegativeValue > -0.000001)
          ) {
            // value is just right
            negativeUnit +=
              (inbetweenNegativeValue - lowInbetweenNegativeValue) /
              valuesCommonDifference
            break
          } else if (inbetweenNegativeValue > 0) {
            // value is higher
            highInbetweenNegativeValue = inbetweenNegativeValue
            inbetweenNegativeValue =
              inbetweenNegativeValue -
              (inbetweenNegativeValue - lowInbetweenNegativeValue) * 0.5
          } else {
            // value is lower
            lowInbetweenNegativeValue = inbetweenNegativeValue
            inbetweenNegativeValue =
              inbetweenNegativeValue +
              (highInbetweenNegativeValue - inbetweenNegativeValue) * 0.5
          }

          if (loopRan >= 30) break
        }
      } else break
    }

    // console.log('getNegativeUnit loopRan: ', loopRan)

    return negativeUnit
  }

  /**
   * Get The Probability value for the provided averageValueOne and averageValueTwo params
   * @param {number} averageValueOne Should be a positive number
   * @param {number} averageValueTwo Should be a positive number
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many sub values will be generated to get to the last value
   * @param {number} winProbability It should only be an auguement between 0.5 to 1
   * @returns {number} The Probability value for the provided averageValueOne and averageValueTwo params
   */
  public _getMainProbability(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number,
    winProbability: number
  ): number {
    // sanitizing inputs
    winProbability =
      winProbability < 0.5 ? 0.5 : winProbability > 1 ? 1 : winProbability

    const negativeProbability = 1 - winProbability
    const negativeUnit = this._getNegativeUnit(
      averageValueOne,
      averageValueTwo,
      spread,
      breakpoint
    )
    // console.log('negativeUnit: ', negativeUnit)

    const lowNegativeUnit = Math.floor(negativeUnit)
    const highNegativeUnit = Math.ceil(negativeUnit)

    let lowProbability = 0
    let probability = 0.5
    let highProbability = 1
    let negativeUnitProbability = 0
    let valuesProbability: number[]
    let loopRan = 0

    // Using binary search to find the right probability to that we make the "negativeUnitProbability" = "negativeProbability"
    while (true) {
      loopRan++

      // value is just right
      if (
        negativeUnitProbability === negativeProbability ||
        (negativeUnitProbability > negativeProbability * 0.99999 &&
          negativeUnitProbability < negativeProbability * 1.00001)
      )
        break
      else if (negativeUnitProbability > negativeProbability) {
        // value is higher
        lowProbability = probability
        probability = probability + (highProbability - probability) * 0.5
      } else {
        // value is lower
        highProbability = probability
        probability = probability - (probability - lowProbability) * 0.5
      }

      if (loopRan >= 30) break

      negativeUnitProbability = 0
      // Get A new values probability after updating the probability variable
      valuesProbability = this._getValuesProbability(
        spread,
        breakpoint,
        probability
      )

      for (let x = 0; x < lowNegativeUnit; x++) {
        negativeUnitProbability += valuesProbability[x]
      }
      if (highNegativeUnit > lowNegativeUnit) {
        negativeUnitProbability +=
          valuesProbability[highNegativeUnit - 1] *
          (negativeUnit - lowNegativeUnit)
      }
    }

    // console.log('getMainProbability loopRan: ', loopRan)

    return probability
  }

  /**
   * Get A Random number that meets the condition
   * @param {number} averageValueOne An Average Range Value to use as a reference
   * @param {number} averageValueTwo An Average Range Value to use as a reference
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many sub values will be generated to get to the last value
   * @param {number} probability The Probability value for the provided averageValueOne and averageValueTwo params
   * @returns {number} A Random number that meets the condition
   */
  public _dynamicRange(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number,
    probability: number
  ): number {
    const values = this._getValues(
      averageValueOne,
      averageValueTwo,
      spread,
      breakpoint
    )
    const valuesProbability = this._getValuesProbability(
      spread,
      breakpoint,
      probability
    )

    // get random values
    const randomValues = this.mathUtility.getRandomNumbersFromArray(values)

    // console.log('randomValues: ', randomValues)

    const remainder =
      1 -
      probability -
      valuesProbability.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      ) *
        2

    // console.log('remainder: ', remainder)

    let accumulatedProbability = 0
    const finalValuesProbability = [
      ...valuesProbability,
      probability + remainder,
      ...[...valuesProbability].reverse(),
    ].map((currentProbability) => {
      accumulatedProbability += currentProbability

      return accumulatedProbability
    })

    const probabilityPicked = Math.random()

    const probabilityIndex = finalValuesProbability.findIndex(
      (currentProbability, i, arr) => {
        const prevProbability = arr[i - 1] !== undefined ? arr[i - 1] : 0

        return (
          prevProbability < probabilityPicked &&
          probabilityPicked <= currentProbability
        )
      }
    )

    return randomValues[probabilityIndex]
  }

  /**
   * Get A Random number that meets the condition
   * @param {number} averageValueOne a positive number as An Average Range Value to use as a reference
   * @param {number} averageValueTwo a positive number as An Average Range Value to use as a reference
   * @param {number} positiveValueProbability The probability of getting a positive number, It should be a number between 0.55 to 0.99
   * @returns {number} A Random number that meets the condition
   */
  public probabilityValue(
    averageValueOne: number,
    averageValueTwo: number,
    positiveValueProbability: number
  ): number {
    // sanitizing inputs
    positiveValueProbability =
      positiveValueProbability < 0.55
        ? 0.55
        : positiveValueProbability > 0.99
        ? 0.99
        : positiveValueProbability

    const spread = 10
    const breakpoint = 100

    const probability = this._getMainProbability(
      averageValueOne,
      averageValueTwo,
      spread,
      breakpoint,
      positiveValueProbability
    )

    const randomValue = this._dynamicRange(
      averageValueOne,
      averageValueTwo,
      spread,
      breakpoint,
      probability
    )

    return randomValue
  }
}

export default MathService

////////////////////////////
///////////////////////////
// EXPERIMENTAL TESTING
////////////////////////////
///////////////////////////

// import MathUtility from './math.utility'
// const mathService = new MathService(new MathUtility())

// console.log('values: ', mathService._getValues(1, 2, 3, 2))
// console.log('value: ', mathService._getNegativeUnit(1, 2, 3, 2))

// const run = 10000
// const negativeValues = []
// const positiveValues = []

// let sum = 0
// const startTime = new Date().getTime()
// for (let x = 0; x < run; x++) {
//   const curr = mathService.probabilityValue(1, 2, 0.55)
//   sum += curr
//   if (curr > 0) {
//     positiveValues.push(curr)
//   }
//   if (curr < 0) {
//     negativeValues.push(curr)
//   }
// }
// const average = sum / run

// console.log('=====================')
// console.log('negative: ', negativeValues.filter((val) => val < 0).length / run)
// console.log('Average: ', average)
// console.log('=====================')
// console.log('max: ', Math.max(...positiveValues))
// console.log('min: ', Math.min(...negativeValues))
// console.log('=====================')
// console.log('Time: ', (new Date().getTime() - startTime) / 1000)

////////////////////////////////////
///////////////////////////////////
// RUN npx ts-node .\math.service.ts
////////////////////////////////////
///////////////////////////////////
