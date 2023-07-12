import type { Plan } from "@/types/plan";

export const DUMMY_PLANS: Plan[] = [
  {
    _id: "1",
    name: "standard package",
    icon: "standard.png",
    network: "TRC20",
    coins: [
      {
        name: "bitcoin",
        symbol: "BTC",
        icon: "btc.svg",
      },
      {
        name: "ethereum",
        symbol: "ETH",
        icon: "eth.svg",
      },
      {
        name: "litcoin",
        symbol: "LTC",
        icon: "ltc.svg",
      },
    ],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    freeGas: 259,
    gasRate: 2,
    minAmount: 50,
    maxAmount: 1999,
    profit: 76,
    hours: 168,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    name: "silver package",
    icon: "silver.png",
    network: "TRC20",
    coins: [
      {
        name: "tether",
        symbol: "USDT",
        icon: "usdt.svg",
      },
      {
        name: "ethereum",
        symbol: "ETH",
        icon: "eth.svg",
      },
      {
        name: "litcoin",
        symbol: "LTC",
        icon: "ltc.svg",
      },
    ],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    freeGas: 259,
    gasRate: 2,
    minAmount: 2000,
    maxAmount: 5999,
    profit: 76,
    hours: 228,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    name: "gold package",
    icon: "gold.png",
    network: "TRC20",
    coins: [
      {
        name: "litcoin",
        symbol: "LTC",
        icon: "ltc.svg",
      },
      {
        name: "ethereum",
        symbol: "ETH",
        icon: "eth.svg",
      },
      {
        name: "tether",
        symbol: "USDT",
        icon: "usdt.svg",
      },
    ],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    freeGas: 259,
    gasRate: 2,
    minAmount: 6000,
    maxAmount: 29999,
    profit: 76,
    hours: 94,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
