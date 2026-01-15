export type AssetType = 'stock' | 'crypto' | 'fiat';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
}

export interface Price {
  id: string;
  asset: string;
  price: number;
  asOf?: string;
}

export interface Position {
  id: number;
  asset: string;
  quantity: number;
  asOf: string;
  price: number;
}

export interface Portfolio {
  id: string;
  asOf: string;
  positions: Position[];
}

export interface EnrichedPosition extends Position {
  assetDetails: Asset;
  currentPrice: number;
  value: number;
  percentageOfPortfolio: number;
}

export interface PortfolioSummary {
  totalValue: number;
  byAssetClass: { type: AssetType; value: number; percentage: number }[];
  byAsset: { asset: Asset; value: number; percentage: number }[];
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
}

export interface ApiError {
  message: string;
  status: number;
}
