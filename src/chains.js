import { defineChain } from 'viem'

export const teaSepolia = defineChain({
  id: 10218,
  name: 'Tea Sepolia',
  network: 'tea-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'TEA',
    symbol: 'TEA',
  },
  rpcUrls: {
    default: {
      http: ['https://tea-sepolia.g.alchemy.com/public'],
    },
    public: {
      http: ['https://tea-sepolia.g.alchemy.com/public'],
    },
  },
})