import { http, HttpResponse } from 'msw';
import {
  assets,
  getCurrentPrices,
  getPricesForDate,
  getPricesInRange,
  portfolio,
  getPortfolioForDate,
} from './data';

export const handlers = [
  http.get('/api/assets', () => {
    return HttpResponse.json(assets);
  }),

  http.get('/api/prices', ({ request }) => {
    const url = new URL(request.url);
    const assetFilter = url.searchParams.get('asset');
    const asOf = url.searchParams.get('asOf');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let prices;

    if (from && to) {
      prices = getPricesInRange(from, to);
    } else if (asOf) {
      prices = getPricesForDate(asOf);
    } else {
      prices = getCurrentPrices();
    }

    if (assetFilter) {
      const assetNames = assetFilter.split(',').map((a) => a.trim());
      prices = prices.filter((p) => assetNames.includes(p.asset));
    }

    return HttpResponse.json(prices);
  }),

  http.get('/api/portfolios', ({ request }) => {
    const url = new URL(request.url);
    const asOf = url.searchParams.get('asOf');

    if (asOf) {
      return HttpResponse.json(getPortfolioForDate(asOf));
    }

    return HttpResponse.json(portfolio);
  }),
];
