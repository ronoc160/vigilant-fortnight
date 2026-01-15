import type { VercelRequest, VercelResponse } from '@vercel/node';

const assets = [
  { id: 'asset-aapl', name: 'AAPL', type: 'stock' },
  { id: 'asset-googl', name: 'GOOGL', type: 'stock' },
  { id: 'asset-msft', name: 'MSFT', type: 'stock' },
  { id: 'asset-tsla', name: 'TSLA', type: 'stock' },
  { id: 'asset-btc', name: 'BTC', type: 'crypto' },
  { id: 'asset-eth', name: 'ETH', type: 'crypto' },
  { id: 'asset-sol', name: 'SOL', type: 'crypto' },
  { id: 'asset-usd', name: 'USD', type: 'fiat' },
  { id: 'asset-gbp', name: 'GBP', type: 'fiat' },
  { id: 'asset-eur', name: 'EUR', type: 'fiat' },
];

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json(assets);
}
