export interface IMathService {
  _getValues(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number
  ): number[]

  _getValuesProbability(breakpoint: number, probability: number): number[]

  _getNegativeUnit(spread: number, breakpoint: number): number

  _getPercentageLoss(
    spread: number,
    breakpoint: number,
    probability: number
  ): number

  dynamicRangeOptions(winRate: number): {
    spread: number
    breakpoint: number
    probability: number
  }

  dynamicRange(
    minValue: number,
    maxValue: number,
    spread: number,
    breakpoint: number,
    accuracy: number
  ): number
}

export interface IMathUtility {
  getRandomNumberFromRange(num1: number, num2: number): number
  getRandomNumbersFromArray(numbers: number[]): number[]
}
