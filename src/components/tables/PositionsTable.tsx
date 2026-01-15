import { useState, useMemo, useCallback, memo, type KeyboardEvent } from 'react';
import type { EnrichedPosition } from '../../api/types';
import { formatCurrency, formatPercentage, formatNumber, getAssetTypeLabel } from '../../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

type SortField = 'name' | 'type' | 'quantity' | 'price' | 'value' | 'percentage';
type SortDirection = 'asc' | 'desc';

interface PositionsTableProps {
  positions: EnrichedPosition[];
}

const FIELD_LABELS: Record<SortField, string> = {
  name: 'Asset',
  type: 'Type',
  quantity: 'Quantity',
  price: 'Price',
  value: 'Value',
  percentage: '% of Portfolio',
};

export const PositionsTable = memo(function PositionsTable({ positions }: PositionsTableProps) {
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedPositions = useMemo(() => {
    return [...positions].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'name':
          aVal = a.assetDetails.name;
          bVal = b.assetDetails.name;
          break;
        case 'type':
          aVal = a.assetDetails.type;
          bVal = b.assetDetails.type;
          break;
        case 'quantity':
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        case 'price':
          aVal = a.currentPrice;
          bVal = b.currentPrice;
          break;
        case 'value':
          aVal = a.value;
          bVal = b.value;
          break;
        case 'percentage':
          aVal = a.percentageOfPortfolio;
          bVal = b.percentageOfPortfolio;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [positions, sortField, sortDirection]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, sortDirection]);

  const handleKeyDown = useCallback((e: KeyboardEvent, field: SortField) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(field);
    }
  }, [handleSort]);

  const getAriaSort = (field: SortField): 'ascending' | 'descending' | 'none' => {
    if (sortField !== field) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sortField === field;

    if (!isActive) {
      return (
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg
        className="w-4 h-4 text-primary-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-primary-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const HeaderCell = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      scope="col"
      aria-sort={getAriaSort(field)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
    >
      <button
        type="button"
        onClick={() => handleSort(field)}
        onKeyDown={(e) => handleKeyDown(e, field)}
        className="flex items-center gap-1 hover:bg-gray-100 -m-1 p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={`Sort by ${FIELD_LABELS[field]}, currently ${getAriaSort(field) === 'none' ? 'not sorted' : getAriaSort(field)}`}
      >
        {children}
        <SortIcon field={field} />
      </button>
    </th>
  );

  const getAssetTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      stock: 'bg-blue-100 text-blue-800',
      crypto: 'bg-purple-100 text-purple-800',
      fiat: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Positions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Portfolio positions">
            <caption className="sr-only">
              Portfolio positions table. Click column headers to sort. Currently sorted by {FIELD_LABELS[sortField]} in {sortDirection === 'asc' ? 'ascending' : 'descending'} order.
            </caption>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <HeaderCell field="name">Asset</HeaderCell>
                <HeaderCell field="type">Type</HeaderCell>
                <HeaderCell field="quantity">Quantity</HeaderCell>
                <HeaderCell field="price">Price</HeaderCell>
                <HeaderCell field="value">Value</HeaderCell>
                <HeaderCell field="percentage">% of Portfolio</HeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <th scope="row" className="px-4 py-3 whitespace-nowrap text-left">
                    <span className="font-medium text-gray-900">
                      {position.assetDetails.name}
                    </span>
                  </th>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAssetTypeBadge(position.assetDetails.type)}`}>
                      {getAssetTypeLabel(position.assetDetails.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {formatNumber(position.quantity, position.assetDetails.type === 'crypto' ? 4 : 0)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {formatCurrency(position.currentPrice)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                    {formatCurrency(position.value)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 bg-gray-100 rounded-full h-2 w-20"
                        role="progressbar"
                        aria-valuenow={Math.round(position.percentageOfPortfolio)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${position.assetDetails.name} is ${formatPercentage(position.percentageOfPortfolio)} of portfolio`}
                      >
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${Math.min(position.percentageOfPortfolio, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right" aria-hidden="true">
                        {formatPercentage(position.percentageOfPortfolio)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
