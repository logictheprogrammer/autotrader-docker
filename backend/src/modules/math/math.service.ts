import { Service } from 'typedi'
import { IMathService } from './math.interface'

@Service()
class MathService implements IMathService {
  public _getRandomValue(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  public _setRandomValues(numbers: number[]): number[] {
    const randomValues = []

    for (let i = 0; i < numbers.length - 1; i++) {
      const value = this._getRandomValue(numbers[i], numbers[i + 1])

      randomValues.push(value)
    }

    return randomValues
  }

  /**
   * Get A Random array of numbers that meets a condition
   * @param {number} averageValueOne An Average Range Values to use as a reference
   * @param {number} averageValueTwo An Average Range Values to use as a reference
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many sub values will be generated to get to the last value
   * @returns {number} An array of Random number that meets a condition
   */
  public getValues(
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

    const minAverageRange =
      averageValueOne > averageValueTwo ? averageValueTwo : averageValueOne
    const maxAverageRange =
      averageValueOne > averageValueTwo ? averageValueOne : averageValueTwo

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

    console.log('Values: ', values)

    return values
  }

  /**
   * Get half of the remaining values probability
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many sub values will be generated to get to the last value
   * @param {number} probability It should only be an auguement between 0.5 to 1
   * @returns {number} half of the remaining values probability
   */
  public getValuesProbability(
    spread: number,
    breakpoint: number,
    probability: number
  ): number[] {
    // sanitizing inputs
    breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
    spread = Math.abs(spread)
    probability = probability > 1 ? 1 : probability < 0 ? 0 : probability

    // values propability
    const valuesProbability = []

    const remainingProbability = (1 - probability) / 2

    let probSum = 0
    for (let x = 0; x < breakpoint; x++) {
      const prob = probability * (probability + 1) ** x
      valuesProbability.push(prob)
      probSum += prob
    }

    console.log('valuesProbability: ', valuesProbability)

    const probUnit = 1 / probSum
    // set values probability
    for (let i = 0; i < breakpoint; i++) {
      valuesProbability[i] =
        remainingProbability * (probUnit * valuesProbability[i])
    }

    console.log('valuesProbability: ', valuesProbability)

    return valuesProbability
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
  public getMainProbability(
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
    const negativeUnit = this.getNegativeUnit(
      averageValueOne,
      averageValueTwo,
      spread,
      breakpoint
    )
    console.log('negativeUnit: ', negativeUnit)

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
      valuesProbability = this.getValuesProbability(
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

    console.log('getMainProbability loopRan: ', loopRan)

    return probability
  }

  /**
   * Get The Negative Unit value
   * @param {number} averageValueOne Should be a positive number
   * @param {number} averageValueTwo Should be a positive number
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many unit will be generted to get to the last value
   * @returns {number} The Sum Of Negative Unit value that meets approximatly at zero
   */
  public getNegativeUnit(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number
  ): number {
    let negativeUnit: number = 0

    const values = this.getValues(
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

          if (loopRan >= 100) break
        }
      } else break
    }

    console.log('getNegativeUnit loopRan: ', loopRan)

    if (!negativeUnit) throw new Error('Values array has no negative value')
    return negativeUnit
  }

  /**
   * Get A Random number that meets the condition
   * @param {number} averageValueOne An Average Range Values to use as a reference
   * @param {number} averageValueTwo An Average Range Values to use as a reference
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many sub values will be generated to get to the last value
   * @param {number} probability The Probability value for the provided averageValueOne and averageValueTwo params
   * @returns {number} A Random number that meets the condition
   */
  public dynamicRange(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number,
    probability: number
  ): number {
    const values = this.getValues(
      averageValueOne,
      averageValueTwo,
      spread,
      breakpoint
    )
    const valuesProbability = this.getValuesProbability(
      spread,
      breakpoint,
      probability
    )

    // get random values
    const randomValues = this._setRandomValues(values)

    console.log('randomValues: ', randomValues)

    const remainder =
      1 -
      probability -
      valuesProbability.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      ) *
        2

    console.log('remainder: ', remainder)

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
}

export default MathService

const mathService = new MathService()
// console.log('negativeUnit: ', mathService.getNegativeUnit(1, 2, 4, 4))
console.log('probability: ', mathService.getMainProbability(1, -2, 2, 1, 0.76))
// console.log('value: ', mathService.dynamicRange(-2, -1, 2, 2, 0.5))

// const total = 10
// const run = 100

// for (let y = 0; y < run; y++) {
//   let sum = 0

//   for (let x = 0; x < total; x++) {
//     const curr = mathService.quickDynamicRange(min, max, total, winProbability)
//     sum += curr
//     if (curr > max) {
//       maxArr.push(curr)
//     }
//     if (curr < min) {
//       minArr.push(curr)
//     }
//   }

//   const average = sum / total

//   averageArr.push(average)
// }

// console.log('Breakpoint: ', breakpoint)
// console.log('Spread: ', spread)
// console.log('Min: ', expectedMin)
// console.log('Max: ', expectedMax)
// console.log('======================')
// console.log('Total: ', run * total)
// console.log('negative: ', minArr.filter((val) => val < 0).length)
// console.log('positive: ', maxArr.filter((val) => val >= 0).length)
// console.log(
//   'Average: ',
//   averageArr.reduce((acc, curr) => (acc += curr), 0) / averageArr.length
// )

////////////////////////////////////
///////////////////////////////////
// testing breakpoint to be ((3) * (maxAverageRange - minAverageRange)) * total/10
// and spread to be (minAverageRange / (3)) * total/10

///////////
// RUN npx ts-node .\math.service.ts

//////////
// Documentation

// minAverageRange
// maxAverageRange
// spread
// breakpoint
// probability

// the lowest value to get is = minAverageRange - (minAverageRange * spread), where 0 will make it the provided minAverageRange
// the highest value to get is = maxAverageRange - (minAverageRange * spread)

// the spread determine the steps, where 1 will be 1 step away from the provided minAverageRange to the lowest value to get

// the probability determine the rate at which the value should leave the original values, where 0 is always why 1 is never

// IMPORTANT
// @ winProbability = 1, the spread should be 1
