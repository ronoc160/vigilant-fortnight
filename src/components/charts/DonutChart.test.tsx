import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DonutChart } from './DonutChart';
import type { PortfolioSummary } from '../../api/types';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

const mockSummary: PortfolioSummary = {
  totalValue: 10000,
  byAssetClass: [
    { type: 'stock', value: 6000, percentage: 60 },
    { type: 'crypto', value: 3000, percentage: 30 },
    { type: 'fiat', value: 1000, percentage: 10 },
  ],
  byAsset: [
    { asset: { id: '1', name: 'Apple', type: 'stock' }, value: 4000, percentage: 40 },
    { asset: { id: '2', name: 'Google', type: 'stock' }, value: 2000, percentage: 20 },
    { asset: { id: '3', name: 'Bitcoin', type: 'crypto' }, value: 3000, percentage: 30 },
    { asset: { id: '4', name: 'USD', type: 'fiat' }, value: 1000, percentage: 10 },
  ],
};

describe('DonutChart', () => {
  it('renders with heading', () => {
    render(<DonutChart summary={mockSummary} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Portfolio Balance' })).toBeInTheDocument();
  });

  it('displays total value', () => {
    render(<DonutChart summary={mockSummary} />);
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
  });

  it('displays "Total Value" label', () => {
    render(<DonutChart summary={mockSummary} />);
    expect(screen.getByText('Total Value')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    render(<DonutChart summary={mockSummary} />);
    expect(screen.getByRole('button', { name: /by class/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /by asset/i })).toBeInTheDocument();
  });

  it('has By Class selected by default', () => {
    render(<DonutChart summary={mockSummary} />);
    const byClassButton = screen.getByRole('button', { name: /by class/i });
    expect(byClassButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows asset class data by default', () => {
    render(<DonutChart summary={mockSummary} />);
    expect(screen.getByRole('option', { name: /stocks/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /crypto/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /cash/i })).toBeInTheDocument();
  });

  it('switches to asset view when By Asset is clicked', async () => {
    const user = userEvent.setup();
    render(<DonutChart summary={mockSummary} />);

    await user.click(screen.getByRole('button', { name: /by asset/i }));

    expect(screen.getByRole('option', { name: /apple/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /bitcoin/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /usd/i })).toBeInTheDocument();
  });

  it('updates aria-pressed when switching view modes', async () => {
    const user = userEvent.setup();
    render(<DonutChart summary={mockSummary} />);

    const byClassButton = screen.getByRole('button', { name: /by class/i });
    const byAssetButton = screen.getByRole('button', { name: /by asset/i });

    expect(byClassButton).toHaveAttribute('aria-pressed', 'true');
    expect(byAssetButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(byAssetButton);

    expect(byClassButton).toHaveAttribute('aria-pressed', 'false');
    expect(byAssetButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelectionChange when legend item is clicked', async () => {
    const user = userEvent.setup();
    const handleSelectionChange = vi.fn();
    render(<DonutChart summary={mockSummary} onSelectionChange={handleSelectionChange} />);

    const stocksOption = screen.getByRole('option', { name: /stocks/i });
    await user.click(stocksOption);

    expect(handleSelectionChange).toHaveBeenCalledWith({
      type: 'assetClass',
      value: 'stock',
    });
  });

  it('calls onSelectionChange with null when same item is clicked again', async () => {
    const user = userEvent.setup();
    const handleSelectionChange = vi.fn();
    render(<DonutChart summary={mockSummary} onSelectionChange={handleSelectionChange} />);

    const stocksOption = screen.getByRole('option', { name: /stocks/i });
    await user.click(stocksOption);
    await user.click(stocksOption);

    expect(handleSelectionChange).toHaveBeenLastCalledWith({
      type: 'assetClass',
      value: null,
    });
  });

  it('shows clear selection hint when item is selected', async () => {
    const user = userEvent.setup();
    render(<DonutChart summary={mockSummary} />);

    const stocksOption = screen.getByRole('option', { name: /stocks/i });
    await user.click(stocksOption);

    expect(screen.getByText(/click again or press enter to clear selection/i)).toBeInTheDocument();
  });

  it('hides clear selection hint when no item is selected', () => {
    render(<DonutChart summary={mockSummary} />);
    expect(screen.queryByText(/click again or press enter to clear selection/i)).not.toBeInTheDocument();
  });

  it('renders accessible data table for screen readers', () => {
    render(<DonutChart summary={mockSummary} />);
    const table = document.querySelector('table.sr-only');
    expect(table).toBeInTheDocument();
  });

  it('renders legend as listbox for accessibility', () => {
    render(<DonutChart summary={mockSummary} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('legend items have option role', () => {
    render(<DonutChart summary={mockSummary} />);
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(3); // Three asset classes by default
  });

  it('updates aria-selected when legend item is selected', async () => {
    const user = userEvent.setup();
    render(<DonutChart summary={mockSummary} />);

    const stocksOption = screen.getByRole('option', { name: /stocks/i });
    expect(stocksOption).toHaveAttribute('aria-selected', 'false');

    await user.click(stocksOption);
    expect(stocksOption).toHaveAttribute('aria-selected', 'true');
  });

  it('supports keyboard navigation on legend items', async () => {
    const user = userEvent.setup();
    const handleSelectionChange = vi.fn();
    render(<DonutChart summary={mockSummary} onSelectionChange={handleSelectionChange} />);

    const stocksOption = screen.getByRole('option', { name: /stocks/i });
    stocksOption.focus();

    await user.keyboard('{Enter}');

    expect(handleSelectionChange).toHaveBeenCalledWith({
      type: 'assetClass',
      value: 'stock',
    });
  });

  it('supports space key on legend items', async () => {
    const handleSelectionChange = vi.fn();
    render(<DonutChart summary={mockSummary} onSelectionChange={handleSelectionChange} />);

    const stocksOption = screen.getByRole('option', { name: /stocks/i });
    fireEvent.keyDown(stocksOption, { key: ' ' });

    expect(handleSelectionChange).toHaveBeenCalledWith({
      type: 'assetClass',
      value: 'stock',
    });
  });

  it('clears selection when view mode changes', async () => {
    const user = userEvent.setup();
    const handleSelectionChange = vi.fn();
    render(<DonutChart summary={mockSummary} onSelectionChange={handleSelectionChange} />);

    const stocksOption = screen.getByRole('option', { name: /stocks/i });
    await user.click(stocksOption);
    handleSelectionChange.mockClear();

    await user.click(screen.getByRole('button', { name: /by asset/i }));

    expect(handleSelectionChange).toHaveBeenCalledWith({
      type: 'asset',
      value: null,
    });
  });

  it('displays percentages in legend', () => {
    render(<DonutChart summary={mockSummary} />);
    expect(screen.getByText('(60.0%)')).toBeInTheDocument();
    expect(screen.getByText('(30.0%)')).toBeInTheDocument();
    expect(screen.getByText('(10.0%)')).toBeInTheDocument();
  });

  it('renders chart container with accessible description', () => {
    render(<DonutChart summary={mockSummary} />);
    const chartContainer = screen.getByRole('img');
    expect(chartContainer).toHaveAttribute('aria-label');
    expect(chartContainer.getAttribute('aria-label')).toContain('Pie chart');
  });

  it('dims unselected legend items when one is selected', async () => {
    const user = userEvent.setup();
    render(<DonutChart summary={mockSummary} />);

    const stocksOption = screen.getByRole('option', { name: /stocks/i });
    await user.click(stocksOption);

    const cryptoOption = screen.getByRole('option', { name: /crypto/i });
    expect(cryptoOption).toHaveClass('opacity-40');
  });
});
