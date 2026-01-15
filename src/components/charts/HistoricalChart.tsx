import { useMemo, memo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { HistoricalDataPoint } from '../../api/types';
import type { TimePeriod } from '../../hooks/useHistoricalData';
import { formatCurrency, formatChartDate, formatCompactCurrency } from '../../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface HistoricalChartProps {
  data: HistoricalDataPoint[];
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  isLoading?: boolean;
}

const TIME_PERIODS: { value: TimePeriod; label: string; fullLabel: string }[] = [
  { value: '1W', label: '1W', fullLabel: '1 Week' },
  { value: '1M', label: '1M', fullLabel: '1 Month' },
  { value: '3M', label: '3M', fullLabel: '3 Months' },
  { value: '6M', label: '6M', fullLabel: '6 Months' },
  { value: '1Y', label: '1Y', fullLabel: '1 Year' },
];

const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string
}) {
  if (active && payload && payload.length && label) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100" role="tooltip">
        <p className="text-sm text-gray-500">{formatChartDate(label)}</p>
        <p className="text-lg font-semibold text-gray-900">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
});

export const HistoricalChart = memo(function HistoricalChart({
  data,
  period,
  onPeriodChange,
  isLoading,
}: HistoricalChartProps) {
  const performance = useMemo(() => {
    if (data.length < 2) return null;
    const startValue = data[0].value;
    const endValue = data[data.length - 1].value;
    return {
      value: endValue - startValue,
      percentage: ((endValue - startValue) / startValue) * 100,
    };
  }, [data]);

  const isPositive = performance && performance.value >= 0;

  const currentPeriod = TIME_PERIODS.find(p => p.value === period);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle as="h2">Portfolio Performance</CardTitle>
          {performance && (
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? '+' : ''}
                {formatCurrency(performance.value)}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  isPositive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                <span className="sr-only">{isPositive ? 'Gain' : 'Loss'}: </span>
                {isPositive ? '+' : ''}
                {performance.percentage.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex rounded-lg bg-gray-100 p-1" role="group" aria-label="Time period selection">
          {TIME_PERIODS.map(({ value, label, fullLabel }) => (
            <button
              key={value}
              onClick={() => onPeriodChange(value)}
              aria-pressed={period === value}
              aria-label={fullLabel}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                period === value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="h-72 flex items-center justify-center"
            role="status"
            aria-label="Loading chart data"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" aria-hidden="true" />
            <span className="sr-only">Loading chart...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-500" role="status">
            No data available
          </div>
        ) : (
          <>
            <div
              className="h-72"
              role="img"
              aria-label={`Area chart showing portfolio value over ${currentPeriod?.fullLabel || period}. ${
                performance
                  ? `Performance: ${isPositive ? 'up' : 'down'} ${formatCurrency(Math.abs(performance.value))} (${isPositive ? '+' : ''}${performance.percentage.toFixed(2)}%)`
                  : ''
              }`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isPositive ? '#10b981' : '#ef4444'}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={isPositive ? '#10b981' : '#ef4444'}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCompactCurrency(value)}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="sr-only">
              <p>
                Portfolio performance for {currentPeriod?.fullLabel || period}:
                Starting value {formatCurrency(data[0]?.value || 0)},
                ending value {formatCurrency(data[data.length - 1]?.value || 0)}.
                {performance && (
                  <> {isPositive ? 'Gain' : 'Loss'} of {formatCurrency(Math.abs(performance.value))} ({performance.percentage.toFixed(2)}%).</>
                )}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});
