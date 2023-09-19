export enum InvestmentStatus {
  RUNNING = 'running',
  AWAITING_TRADE = 'awaiting trade',
  PROCESSING_TRADE = 'preparing new trade',
  SUSPENDED = 'suspended',
  INSUFFICIENT_GAS = 'out of gas',
  REFILLING = 'refilling',
  ON_MAINTAINACE = 'on maintainace',
  FINALIZING = 'finalizing',
  COMPLETED = 'completed',
}
