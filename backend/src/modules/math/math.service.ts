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

  public getValues(
    minAverageRange: number,
    maxAverageRange: number,
    spread: number,
    breakpoint: number
  ): number[] {
    // validating input
    if (minAverageRange > maxAverageRange)
      throw new Error(
        'minAverageRange aguement should be lesser than the maxAverageRange aguement'
      )
    if (minAverageRange <= 0)
      throw new Error('minAverageRange aguement should not be lesser than zero')
    if (spread < 0) throw new Error('spread aguement should not be negative')
    if (breakpoint <= 0)
      throw new Error('breakpoint aguement should be greater than zero')

    // sanitizing inputs
    breakpoint = Math.ceil(breakpoint)

    // constants
    const difference = minAverageRange * spread
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

  public getValuesProbability(
    minAverageRange: number,
    maxAverageRange: number,
    spread: number,
    breakpoint: number,
    probability: number
  ): number[] {
    // validating input
    if (probability > 1 || probability <= 0)
      throw new Error(
        'probability aguement should be greater than 0 and lesser than or equal to 1'
      )
    if (minAverageRange > maxAverageRange)
      throw new Error(
        'minAverageRange aguement should be lesser than the maxAverageRange aguement'
      )
    if (minAverageRange <= 0)
      throw new Error('minAverageRange aguement should not be lesser than zero')
    if (spread < 0) throw new Error('spread aguement should not be negative')
    if (breakpoint <= 0)
      throw new Error('breakpoint aguement should be greater than zero')

    // sanitizing inputs
    breakpoint = Math.ceil(breakpoint)

    // values propability
    const valuesProbability = []

    const failureChance = (1 - probability) / 2

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
      valuesProbability[i] = failureChance * (probUnit * valuesProbability[i])
    }

    console.log('valuesProbability: ', valuesProbability)

    const remainder =
      1 -
      probability -
      valuesProbability.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      ) *
        2

    console.log('remainder: ', remainder * 1000000)

    return valuesProbability
  }

  public getMainProbability(
    minAverageRange: number,
    maxAverageRange: number,
    spread: number,
    breakpoint: number,
    winProbability: number
  ): number {
    // if (winProbability < 0.5 || winProbability > 1.1)
    //   throw new Error(
    //     'WinProbability most be greater than or equal to 0.5 and lesser than or equal to 1'
    //   )

    const lossProbability = 1 - winProbability
    const negativeUnit = this.getNegativeUnit(
      minAverageRange,
      maxAverageRange,
      spread,
      breakpoint
    )
    const lowNegativeUnit = Math.floor(negativeUnit)
    const highNegativeUnit = Math.ceil(negativeUnit)

    let lowProbability = 0
    let probability = 0.5
    let highProbability = 1
    let negativeUnitProbability = 0
    let valuesProbability: number[]
    let loopRan = 0

    // Using binary search to find the right probability to that we make the "negativeUnitProbability" = "lossProbability"
    while (true) {
      loopRan++
      negativeUnitProbability = 0

      valuesProbability = this.getValuesProbability(
        minAverageRange,
        maxAverageRange,
        spread,
        breakpoint,
        probability
      )

      for (let x = 0; x < lowNegativeUnit; x++) {
        if (lowNegativeUnit) {
          negativeUnitProbability += valuesProbability[x]
        }
      }
      if (highNegativeUnit > lowNegativeUnit) {
        negativeUnitProbability +=
          valuesProbability[highNegativeUnit - 1] *
          (negativeUnit - lowNegativeUnit)
      }

      // value is is just right
      if (
        negativeUnitProbability === lossProbability ||
        (negativeUnitProbability > lossProbability * 0.99999 &&
          negativeUnitProbability < lossProbability * 1.00001)
      )
        break
      else if (negativeUnitProbability > lossProbability) {
        // value is higher
        lowProbability = probability
        probability = probability + (highProbability - probability) * 0.5
      } else {
        // value is lower
        highProbability = probability
        probability = probability - (probability - lowProbability) * 0.5
      }

      if (loopRan >= 100) break
    }

    console.log('getMainProbability loopRan: ', loopRan)

    return probability
  }

  public getNegativeUnit(
    minAverageRange: number,
    maxAverageRange: number,
    spread: number,
    breakpoint: number
  ): number {
    let negativeUnit: number = 0

    const values = this.getValues(
      minAverageRange,
      maxAverageRange,
      spread,
      breakpoint
    )
    const valuesCommonDifference = spread / breakpoint // Alternatively = values[1] - values[0]

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

  // spread - how far away from the provide value should be possible: min 0
  // breakpoint - breakpoints to get to the provided values: more than zero
  public dynamicRange(
    minAverageRange: number,
    maxAverageRange: number,
    spread: number,
    breakpoint: number,
    probability: number
  ): number {
    const valuesProbability = this.getValuesProbability(
      minAverageRange,
      maxAverageRange,
      spread,
      breakpoint,
      probability
    )

    const values = this.getValues(
      minAverageRange,
      maxAverageRange,
      spread,
      breakpoint
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
console.log(
  'probability: ',
  mathService.getMainProbability(1, 2, 100, 100, 0.5)
)
// console.log('value: ', mathService.dynamicRange(1, 2, 2, 1, 0.04))

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
