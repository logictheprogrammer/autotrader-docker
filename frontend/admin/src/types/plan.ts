export interface Plan {
  _id: string;
  name: string;
  icon: string;
  network: string;
  coins: {
    name: string;
    symbol: string;
    icon: string;
  }[];
  description: string;
  freeGas: number;
  gasRate: number;
  minAmount: number;
  maxAmount: number;
  profit: number;
  hours: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
