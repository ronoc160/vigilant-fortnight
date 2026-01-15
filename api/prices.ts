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

const assetNames = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'BTC', 'ETH', 'SOL', 'USD', 'GBP', 'EUR'];

function generatePricesForDate(date: string) {
  return assetNames.map((name, index) => ({
    id: `price-${name}-${date}`,
    asset: name,
    price: basePrices[name],
    asOf: date,
  }));
}

function generatePricesInRange(from: string, to: string) {
  const prices: any[] = [];
  const fromDate = new Date(from);
  const toDate = new Date(to);

  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    prices.push(...generatePricesForDate(dateStr));
  }

  return prices;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { asset, assets, asOf, from, to } = req.query;
  const assetFilter = assets || asset;

  let prices;
  const today = new Date().toISOString().split('T')[0];

  if (from && to) {
    prices = generatePricesInRange(from as string, to as string);
  } else if (asOf) {
    prices = generatePricesForDate(asOf as string);
  } else {
    prices = generatePricesForDate(today);
  }

  if (assetFilter) {
    const assetNames = (assetFilter as string).split(',').map((a) => a.trim());
    prices = prices.filter((p) => assetNames.includes(p.asset));
  }

  res.status(200).json(prices);
}
