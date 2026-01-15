import type { Asset, Portfolio, Price } from '../api/types';

const uuid = () => crypto.randomUUID();

export const assets: Asset[] = [
  { id: uuid(), name: 'AAPL', type: 'stock' },
  { id: uuid(), name: 'GOOGL', type: 'stock' },
  { id: uuid(), name: 'MSFT', type: 'stock' },
  { id: uuid(), name: 'TSLA', type: 'stock' },
  { id: uuid(), name: 'BTC', type: 'crypto' },
  { id: uuid(), name: 'ETH', type: 'crypto' },
  { id: uuid(), name: 'SOL', type: 'crypto' },
  { id: uuid(), name: 'USD', type: 'fiat' },
  { id: uuid(), name: 'GBP', type: 'fiat' },
  { id: uuid(), name: 'EUR', type: 'fiat' },
];

export const assetMap = new Map(assets.map((a) => [a.id, a]));
export const assetByName = new Map(assets.map((a) => [a.name, a]));

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

function generateHistoricalPrices(
  _assetName: string,
  basePrice: number,
  days: number
): { date: string; price: number }[] {
  const prices: { date: string; price: number }[] = [];
  const today = new Date();
  let currentPrice = basePrice * 0.85;

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const change = (Math.random() - 0.45) * 0.04;
    currentPrice = currentPrice * (1 + change);

    if (i === 0) {
      currentPrice = basePrice;
    }

    prices.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(currentPrice * 100) / 100,
    });
  }

  return prices;
}

export const historicalPrices: Map<string, { date: string; price: number }[]> =
  new Map();

assets.forEach((asset) => {
  const basePrice = basePrices[asset.name] || 100;
  historicalPrices.set(asset.name, generateHistoricalPrices(asset.name, basePrice, 365));
});

export function getPricesForDate(date: string): Price[] {
  return assets.map((asset) => {
    const history = historicalPrices.get(asset.name) || [];
    const priceData = history.find((p) => p.date === date) || history[history.length - 1];

    return {
      id: uuid(),
      asset: asset.name,
      price: priceData?.price || basePrices[asset.name] || 100,
      asOf: date,
    };
  });
}

export function getCurrentPrices(): Price[] {
  const today = new Date().toISOString().split('T')[0];
  return getPricesForDate(today);
}

export function getPricesInRange(from: string, to: string): Price[] {
  const prices: Price[] = [];
  const fromDate = new Date(from);
  const toDate = new Date(to);

  for (let d = fromDate; d <= toDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    prices.push(...getPricesForDate(dateStr));
  }

  return prices;
}

export const portfolio: Portfolio = {
  id: uuid(),
  asOf: new Date().toISOString(),
  positions: [
    { id: 1, asset: assetByName.get('AAPL')!.id, quantity: 50, asOf: new Date().toISOString(), price: basePrices.AAPL },
    { id: 2, asset: assetByName.get('GOOGL')!.id, quantity: 30, asOf: new Date().toISOString(), price: basePrices.GOOGL },
    { id: 3, asset: assetByName.get('MSFT')!.id, quantity: 25, asOf: new Date().toISOString(), price: basePrices.MSFT },
    { id: 4, asset: assetByName.get('TSLA')!.id, quantity: 15, asOf: new Date().toISOString(), price: basePrices.TSLA },
    { id: 5, asset: assetByName.get('BTC')!.id, quantity: 0.5, asOf: new Date().toISOString(), price: basePrices.BTC },
    { id: 6, asset: assetByName.get('ETH')!.id, quantity: 5, asOf: new Date().toISOString(), price: basePrices.ETH },
    { id: 7, asset: assetByName.get('SOL')!.id, quantity: 100, asOf: new Date().toISOString(), price: basePrices.SOL },
    { id: 8, asset: assetByName.get('USD')!.id, quantity: 10000, asOf: new Date().toISOString(), price: basePrices.USD },
    { id: 9, asset: assetByName.get('GBP')!.id, quantity: 2000, asOf: new Date().toISOString(), price: basePrices.GBP },
  ],
};

export function getPortfolioForDate(date: string): Portfolio {
  const prices = getPricesForDate(date);
  const priceMap = new Map(prices.map((p) => [p.asset, p.price]));

  return {
    id: portfolio.id,
    asOf: new Date(date).toISOString(),
    positions: portfolio.positions.map((pos) => {
      const asset = assetMap.get(pos.asset);
      const price = priceMap.get(asset?.name || '') || pos.price;
      return {
        ...pos,
        asOf: new Date(date).toISOString(),
        price,
      };
    }),
  };
}
