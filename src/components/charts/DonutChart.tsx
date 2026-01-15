import { useState, useCallback, useMemo, memo, type KeyboardEvent } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { PortfolioSummary } from '../../api/types';
import { formatCurrency, formatPercentage, getAssetTypeLabel } from '../../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

type ViewMode = 'assetClass' | 'asset';

export interface DonutSelection {
  type: 'assetClass' | 'asset';
  value: string | null; 
}

interface DonutChartProps {
  summary: PortfolioSummary;
  onSelectionChange?: (selection: DonutSelection) => void;
  selection?: DonutSelection;
}

const ASSET_CLASS_COLORS: Record<string, string> = {
  stock: '#3b82f6',
  crypto: '#8b5cf6',
  fiat: '#10b981',
};

const ASSET_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
  '#f97316', '#6366f1',
];

const CustomTooltip = memo(function CustomTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; percentage: number } }>
}) {
  if (active && payload && payload.length) {
    const tooltipData = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100" role="tooltip">
        <p className="font-medium text-gray-900">{tooltipData.name}</p>
        <p className="text-gray-600">{formatCurrency(tooltipData.value)}</p>
        <p className="text-gray-500 text-sm">{formatPercentage(tooltipData.percentage)}</p>
      </div>
    );
  }
  return null;
});

export const DonutChart = memo(function DonutChart({ summary, onSelectionChange }: DonutChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('assetClass');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = useMemo(() => {
    return viewMode === 'assetClass'
      ? summary.byAssetClass.map((item) => ({
          name: getAssetTypeLabel(item.type),
          rawValue: item.type,
          value: item.value,
          percentage: item.percentage,
          color: ASSET_CLASS_COLORS[item.type] || '#6b7280',
        }))
      : summary.byAsset.map((item, index) => ({
          name: item.asset.name,
          rawValue: item.asset.name,
          value: item.value,
          percentage: item.percentage,
          color: ASSET_COLORS[index % ASSET_COLORS.length],
        }));
  }, [summary, viewMode]);

  const handleItemClick = useCallback((index: number) => {
    const clickedItem = data[index];
    const isCurrentlySelected = activeIndex === index;

    if (isCurrentlySelected) {
      setActiveIndex(null);
      onSelectionChange?.({ type: viewMode, value: null });
    } else {
      setActiveIndex(index);
      onSelectionChange?.({ type: viewMode, value: clickedItem.rawValue });
    }
  }, [data, activeIndex, viewMode, onSelectionChange]);

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
    setActiveIndex(null);
    onSelectionChange?.({ type: newMode, value: null });
  }, [onSelectionChange]);

  const handleLegendKeyDown = useCallback((e: KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(index);
    }
  }, [handleItemClick]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle as="h2">Portfolio Balance</CardTitle>
        <div className="flex rounded-lg bg-gray-100 p-1" role="group" aria-label="View mode selection">
          <button
            onClick={() => handleViewModeChange('assetClass')}
            aria-pressed={viewMode === 'assetClass'}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              viewMode === 'assetClass'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            By Class
          </button>
          <button
            onClick={() => handleViewModeChange('asset')}
            aria-pressed={viewMode === 'asset'}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              viewMode === 'asset'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            By Asset
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalValue)}
          </p>
        </div>

        <div className="h-52" role="img" aria-label={`Pie chart showing portfolio breakdown ${viewMode === 'assetClass' ? 'by asset class' : 'by individual asset'}. Use the legend below for details.`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={activeIndex !== null ? 51 : 55}
                outerRadius={activeIndex !== null ? 89 : 85}
                paddingAngle={2}
                dataKey="value"
                onClick={(_, index) => handleItemClick(index)}
                style={{ cursor: 'pointer' }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    opacity={activeIndex !== null && activeIndex !== index ? 0.4 : 1}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <table className="sr-only">
          <caption>Portfolio breakdown {viewMode === 'assetClass' ? 'by asset class' : 'by asset'}</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Value</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, index) => (
              <tr key={index}>
                <th scope="row">{entry.name}</th>
                <td>{formatCurrency(entry.value)}</td>
                <td>{formatPercentage(entry.percentage)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 pb-2" role="listbox" aria-label={`Select ${viewMode === 'assetClass' ? 'asset class' : 'asset'} to filter`}>
          {data.map((entry, index) => (
            <li
              key={index}
              role="option"
              aria-selected={activeIndex === index}
              tabIndex={0}
              onClick={() => handleItemClick(index)}
              onKeyDown={(e) => handleLegendKeyDown(e, index)}
              className={`flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                activeIndex !== null && activeIndex !== index ? 'opacity-40' : ''
              } ${activeIndex === index ? 'bg-gray-100 ring-1 ring-gray-200' : ''}`}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="text-gray-600">{entry.name}</span>
              <span className="text-gray-500">
                ({formatPercentage(entry.percentage)})
              </span>
            </li>
          ))}
        </ul>
        {activeIndex !== null && (
          <p className="text-center text-xs text-gray-500 mt-2" aria-live="polite">
            Click again or press Enter to clear selection
          </p>
        )}
      </CardContent>
    </Card>
  );
});
