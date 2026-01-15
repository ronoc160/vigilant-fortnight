import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoricalChart } from './HistoricalChart';
import type { HistoricalDataPoint } from '../../api/types';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

const mockData: HistoricalDataPoint[] = [
  { date: '2024-01-01', value: 10000 },
  { date: '2024-01-15', value: 10500 },
  { date: '2024-01-31', value: 11000 },
];

const mockNegativeData: HistoricalDataPoint[] = [
  { date: '2024-01-01', value: 10000 },
  { date: '2024-01-15', value: 9500 },
  { date: '2024-01-31', value: 9000 },
];

describe('HistoricalChart', () => {
  it('renders with heading', () => {
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Portfolio Performance' })).toBeInTheDocument();
  });

  it('renders time period selector', () => {
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /1 week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1 month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3 months/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /6 months/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1 year/i })).toBeInTheDocument();
  });

  it('marks current period as pressed', () => {
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    const oneMonthButton = screen.getByRole('button', { name: /1 month/i });
    expect(oneMonthButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onPeriodChange when period button is clicked', async () => {
    const user = userEvent.setup();
    const handlePeriodChange = vi.fn();
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={handlePeriodChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /3 months/i }));
    expect(handlePeriodChange).toHaveBeenCalledWith('3M');
  });

  it('displays positive performance with gain styling', () => {
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    expect(screen.getByText('+$1,000.00')).toBeInTheDocument();
    expect(screen.getByText('+10.00%')).toBeInTheDocument();
  });

  it('displays negative performance with loss styling', () => {
    render(
      <HistoricalChart
        data={mockNegativeData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    expect(screen.getByText('-$1,000.00')).toBeInTheDocument();
    expect(screen.getByText('-10.00%')).toBeInTheDocument();
  });

  it('applies green color for positive performance', () => {
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    const performanceValue = screen.getByText('+$1,000.00');
    expect(performanceValue).toHaveClass('text-green-600');
  });

  it('applies red color for negative performance', () => {
    render(
      <HistoricalChart
        data={mockNegativeData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    const performanceValue = screen.getByText('-$1,000.00');
    expect(performanceValue).toHaveClass('text-red-600');
  });

  it('shows loading state', () => {
    render(
      <HistoricalChart
        data={[]}
        period="1M"
        onPeriodChange={() => {}}
        isLoading={true}
      />
    );
    expect(screen.getByRole('status', { name: /loading chart data/i })).toBeInTheDocument();
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('shows no data message when empty and not loading', () => {
    render(
      <HistoricalChart
        data={[]}
        period="1M"
        onPeriodChange={() => {}}
        isLoading={false}
      />
    );
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('does not show performance when data has less than 2 points', () => {
    render(
      <HistoricalChart
        data={[{ date: '2024-01-01', value: 10000 }]}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    expect(screen.queryByText(/\+\$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/-\$/)).not.toBeInTheDocument();
  });

  it('renders chart with accessible description', () => {
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    const chartContainer = screen.getByRole('img');
    expect(chartContainer).toHaveAttribute('aria-label');
    const ariaLabel = chartContainer.getAttribute('aria-label');
    expect(ariaLabel).toContain('Area chart');
    expect(ariaLabel).toContain('1 Month');
  });

  it('has screen reader accessible summary', () => {
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    const srSummary = document.querySelector('.sr-only p');
    expect(srSummary).toBeInTheDocument();
    expect(srSummary?.textContent).toContain('Starting value');
    expect(srSummary?.textContent).toContain('ending value');
  });

  it('includes gain/loss indicator for screen readers', () => {
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    const srOnlyElements = document.querySelectorAll('.sr-only');
    const hasGainText = Array.from(srOnlyElements).some(el => el.textContent?.includes('Gain'));
    expect(hasGainText).toBe(true);
  });

  it('includes loss indicator for screen readers when negative', () => {
    render(
      <HistoricalChart
        data={mockNegativeData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    const srOnlyElements = document.querySelectorAll('.sr-only');
    const hasLossText = Array.from(srOnlyElements).some(el => el.textContent?.includes('Loss'));
    expect(hasLossText).toBe(true);
  });

  it('period selector has proper group role', () => {
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    const group = screen.getByRole('group', { name: /time period selection/i });
    expect(group).toBeInTheDocument();
  });

  it('updates aria-pressed when period changes', () => {
    const { rerender } = render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /1 month/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /3 months/i })).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <HistoricalChart
        data={mockData}
        period="3M"
        onPeriodChange={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /1 month/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /3 months/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders percentage badge with correct styling for gains', () => {
    render(
      <HistoricalChart
        data={mockData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    const percentageBadge = screen.getByText('+10.00%');
    expect(percentageBadge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('renders percentage badge with correct styling for losses', () => {
    render(
      <HistoricalChart
        data={mockNegativeData}
        period="1M"
        onPeriodChange={() => {}}
      />
    );
    const percentageBadge = screen.getByText('-10.00%');
    expect(percentageBadge).toHaveClass('bg-red-100', 'text-red-700');
  });
});
