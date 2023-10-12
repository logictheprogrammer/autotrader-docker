export interface IMathService {
  _getValues(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number
  ): number[]

  _getValuesProbability(
    spread: number,
    breakpoint: number,
    probability: number
  ): number[]

  _getMainProbability(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number,
    winProbability: number
  ): number

  _getNegativeUnit(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number
  ): number

  _dynamicRange(
    minValue: number,
    maxValue: number,
    spread: number,
    breakpoint: number,
    accuracy: number
  ): number

  probabilityValue(
    averageValueOne: number,
    averageValueTwo: number,
    positiveValueProbability: number
  ): number
}

export interface IMathUtility {
  getRandomNumberFromRange(num1: number, num2: number): number
  getRandomNumbersFromArray(numbers: number[]): number[]
}
