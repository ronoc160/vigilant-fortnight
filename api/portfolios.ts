import type { VercelRequest, VercelResponse } from '@vercel/node';

const basePrices: Record<string, number> = {
  AAPL: 178.5,
  GOOGL: 141.8,
  MSFT: 378.9,
  TSLA: 248.5,
  BTC: 43250.0,
  ETH: 2280.0,
  SOL: 98.5,
  USD: 1.0,
  GBP: 1.27,
  EUR: 1.09,
};

function getPortfolio(asOf?: string) {
  const date = asOf || new Date().toISOString();

  return {
    id: 'portfolio-1',
    asOf: date,
    positions: [
      { id: 1, asset: 'asset-aapl', quantity: 50, asOf: date, price: basePrices.AAPL },
      { id: 2, asset: 'asset-googl', quantity: 30, asOf: date, price: basePrices.GOOGL },
      { id: 3, asset: 'asset-msft', quantity: 25, asOf: date, price: basePrices.MSFT },
      { id: 4, asset: 'asset-tsla', quantity: 15, asOf: date, price: basePrices.TSLA },
      { id: 5, asset: 'asset-btc', quantity: 0.5, asOf: date, price: basePrices.BTC },
      { id: 6, asset: 'asset-eth', quantity: 5, asOf: date, price: basePrices.ETH },
      { id: 7, asset: 'asset-sol', quantity: 100, asOf: date, price: basePrices.SOL },
      { id: 8, asset: 'asset-usd', quantity: 10000, asOf: date, price: basePrices.USD },
      { id: 9, asset: 'asset-gbp', quantity: 2000, asOf: date, price: basePrices.GBP },
    ],
  };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { asOf } = req.query;
  const portfolio = getPortfolio(asOf as string | undefined);
  res.status(200).json(portfolio);
}
