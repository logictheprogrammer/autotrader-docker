export interface IMathService {
  dynamicRange(
    minValue: number,
    maxValue: number,
    spread: number,
    breakpoint: number,
    accuracy: number
  ): number
}
