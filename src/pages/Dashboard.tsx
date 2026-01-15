import { useState, useMemo, lazy, Suspense } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import type { DonutSelection } from '../components/charts/DonutChart';
import { ChartSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAssets } from '../hooks/useAssets';
import { usePortfolio } from '../hooks/usePortfolio';
import { useHistoricalData, type TimePeriod } from '../hooks/useHistoricalData';

const DonutChart = lazy(() => import('../components/charts/DonutChart').then(m => ({ default: m.DonutChart })));
const HistoricalChart = lazy(() => import('../components/charts/HistoricalChart').then(m => ({ default: m.HistoricalChart })));
const PositionsTable = lazy(() => import('../components/tables/PositionsTable').then(m => ({ default: m.PositionsTable })));

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1M');
  const [donutSelection, setDonutSelection] = useState<DonutSelection>({ type: 'assetClass', value: null });

  const {
    assets,
    assetsMap,
    isLoading: assetsLoading,
    error: assetsError,
    refetch: refetchAssets,
  } = useAssets();

  const {
    enrichedPositions,
    summary,
    isLoading: portfolioLoading,
    error: portfolioError,
    refetch: refetchPortfolio,
  } = usePortfolio({ assets, assetsMap });

  const { filteredPositions, positionQuantities } = useMemo(() => {
    if (!donutSelection.value) {
      return {
        filteredPositions: enrichedPositions,
        positionQuantities: new Map(enrichedPositions.map(p => [p.asset, p.quantity])),
      };
    }

    const filtered = enrichedPositions.filter((pos) => {
      if (donutSelection.type === 'assetClass') {
        return pos.assetDetails.type === donutSelection.value;
      }
      return pos.assetDetails.name === donutSelection.value;
    });

    return {
      filteredPositions: filtered,
      positionQuantities: new Map(filtered.map(p => [p.asset, p.quantity])),
    };
  }, [enrichedPositions, donutSelection]);

  const {
    data: historicalData,
    isLoading: historicalLoading,
    refetch: refetchHistorical,
  } = useHistoricalData({
    period: timePeriod,
    assets,
    positionQuantities,
  });

  const isLoading = assetsLoading || portfolioLoading;
  const error = assetsError || portfolioError;

  const handleRetry = () => {
    refetchAssets();
    refetchPortfolio();
    refetchHistorical();
  };

  if (error) {
    return (
      <DashboardLayout>
        <ErrorMessage
          title="Failed to load portfolio"
          message={error}
          onRetry={handleRetry}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="sr-only">Portfolio Dashboard</h1>

      <div className="space-y-6">
        <section aria-label="Portfolio charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading || !summary ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : (
              <Suspense fallback={<><ChartSkeleton /><ChartSkeleton /></>}>
                <DonutChart
                  summary={summary}
                  selection={donutSelection}
                  onSelectionChange={setDonutSelection}
                />
                <HistoricalChart
                  data={historicalData}
                  period={timePeriod}
                  onPeriodChange={setTimePeriod}
                  isLoading={historicalLoading}
                />
              </Suspense>
            )}
          </div>
        </section>

        <section aria-label="Portfolio positions">
          {isLoading ? (
            <TableSkeleton rows={6} />
          ) : (
            <Suspense fallback={<TableSkeleton rows={6} />}>
              <PositionsTable positions={filteredPositions} />
            </Suspense>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
