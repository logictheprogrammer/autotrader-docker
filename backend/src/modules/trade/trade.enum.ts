export enum TradeStatus {
  WAITING = 'waiting',
  PREPARING = 'preparing',
  START = 'start',
  ACTIVE = 'active',
  RUNNING = 'running',
  ON_HOLD = 'on hold',
  MARKET_CLOSED = 'market closed',
  MARKET_OPENED = 'market opened',
  SETTLED = 'settled',
}

export enum TradeMove {
  LONG = 'long',
  SHORT = 'short',
}
