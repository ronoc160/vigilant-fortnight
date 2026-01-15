import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PositionsTable } from './PositionsTable';
import type { EnrichedPosition } from '../../api/types';

const mockPositions: EnrichedPosition[] = [
  {
    id: 1,
    asset: 'asset-1',
    quantity: 10,
    asOf: '2024-01-15',
    price: 150,
    assetDetails: { id: 'asset-1', name: 'Apple', type: 'stock' },
    currentPrice: 150,
    value: 1500,
    percentageOfPortfolio: 30,
  },
  {
    id: 2,
    asset: 'asset-2',
    quantity: 5,
    asOf: '2024-01-15',
    price: 500,
    assetDetails: { id: 'asset-2', name: 'Google', type: 'stock' },
    currentPrice: 500,
    value: 2500,
    percentageOfPortfolio: 50,
  },
  {
    id: 3,
    asset: 'asset-3',
    quantity: 2.5,
    asOf: '2024-01-15',
    price: 400,
    assetDetails: { id: 'asset-3', name: 'Bitcoin', type: 'crypto' },
    currentPrice: 400,
    value: 1000,
    percentageOfPortfolio: 20,
  },
];

describe('PositionsTable', () => {
  it('renders table with correct heading', () => {
    render(<PositionsTable positions={mockPositions} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Positions' })).toBeInTheDocument();
  });

  it('renders all positions', () => {
    render(<PositionsTable positions={mockPositions} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
  });

  it('renders table with accessible caption', () => {
    render(<PositionsTable positions={mockPositions} />);
    const caption = document.querySelector('caption');
    expect(caption).toBeInTheDocument();
    expect(caption).toHaveClass('sr-only');
  });

  it('renders all column headers', () => {
    render(<PositionsTable positions={mockPositions} />);
    expect(screen.getByRole('columnheader', { name: /asset/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /type/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /quantity/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /price/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /^value/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% of portfolio/i })).toBeInTheDocument();
  });

  it('displays asset type badges correctly', () => {
    render(<PositionsTable positions={mockPositions} />);
    const stockBadges = screen.getAllByText('Stocks');
    expect(stockBadges.length).toBe(2);
    expect(screen.getByText('Crypto')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    render(<PositionsTable positions={mockPositions} />);
    expect(screen.getByText('$1,500.00')).toBeInTheDocument();
    expect(screen.getByText('$2,500.00')).toBeInTheDocument();
  });

  it('formats percentages correctly', () => {
    render(<PositionsTable positions={mockPositions} />);
    expect(screen.getByText('30.0%')).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('renders progress bars with proper ARIA attributes', () => {
    render(<PositionsTable positions={mockPositions} />);
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(3);

    progressBars.forEach((bar) => {
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
      expect(bar).toHaveAttribute('aria-valuenow');
    });
  });

  it('sorts by value descending by default', () => {
    render(<PositionsTable positions={mockPositions} />);
    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);

    expect(within(dataRows[0]).getByText('Google')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('Apple')).toBeInTheDocument();
    expect(within(dataRows[2]).getByText('Bitcoin')).toBeInTheDocument();
  });

  it('toggles sort direction when clicking same column header', async () => {
    const user = userEvent.setup();
    render(<PositionsTable positions={mockPositions} />);

    const valueHeader = screen.getByRole('button', { name: /sort by value/i });
    await user.click(valueHeader);

    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);

    expect(within(dataRows[0]).getByText('Bitcoin')).toBeInTheDocument();
    expect(within(dataRows[2]).getByText('Google')).toBeInTheDocument();
  });

  it('sorts by different column when clicking new header', async () => {
    const user = userEvent.setup();
    render(<PositionsTable positions={mockPositions} />);

    const nameHeader = screen.getByRole('button', { name: /sort by asset/i });
    await user.click(nameHeader);

    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);

    expect(within(dataRows[0]).getByText('Google')).toBeInTheDocument();
  });

  it('updates aria-sort attribute on column headers', async () => {
    const user = userEvent.setup();
    render(<PositionsTable positions={mockPositions} />);

    expect(screen.getByRole('columnheader', { name: /^value/i })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByRole('columnheader', { name: /asset/i })).toHaveAttribute('aria-sort', 'none');

    const nameButton = screen.getByRole('button', { name: /sort by asset/i });
    await user.click(nameButton);

    expect(screen.getByRole('columnheader', { name: /asset/i })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByRole('columnheader', { name: /^value/i })).toHaveAttribute('aria-sort', 'none');
  });

  it('handles keyboard navigation on sort buttons', async () => {
    const user = userEvent.setup();
    render(<PositionsTable positions={mockPositions} />);

    const nameButton = screen.getByRole('button', { name: /sort by asset/i });
    nameButton.focus();
    await user.keyboard('{Enter}');

    const nameHeader = screen.getByRole('columnheader', { name: /asset/i });
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
  });

  it('handles empty positions array', () => {
    render(<PositionsTable positions={[]} />);
    expect(screen.getByRole('heading', { name: 'Positions' })).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1);
  });

  it('formats crypto quantities with more decimal places', () => {
    render(<PositionsTable positions={mockPositions} />);
    expect(screen.getByText('2.5000')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('applies correct badge colors for asset types', () => {
    render(<PositionsTable positions={mockPositions} />);

    const stockBadges = screen.getAllByText('Stocks');
    expect(stockBadges[0]).toHaveClass('bg-blue-100', 'text-blue-800');

    const cryptoBadge = screen.getByText('Crypto');
    expect(cryptoBadge).toHaveClass('bg-purple-100', 'text-purple-800');
  });
});
