export interface IMathService {
  dynamicRange(
    minValue: number,
    maxValue: number,
    spread: number,
    breakpoint: number,
    accuracy: number
  ): number

  quickDynamicRange(
    minValue: number,
    maxValue: number,
    total: number,
    probability: number
  ): number
}
