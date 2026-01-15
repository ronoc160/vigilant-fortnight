import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCompactCurrency,
  formatPercentage,
  formatNumber,
  formatDate,
  formatChartDate,
  getAssetTypeLabel,
} from './formatters';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large numbers correctly', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });
});

describe('formatCompactCurrency', () => {
  it('formats thousands correctly', () => {
    expect(formatCompactCurrency(1500)).toBe('$1.5K');
  });

  it('formats millions correctly', () => {
    expect(formatCompactCurrency(1500000)).toBe('$1.5M');
  });
});

describe('formatPercentage', () => {
  it('formats with default decimals', () => {
    expect(formatPercentage(45.6789)).toBe('45.7%');
  });

  it('formats with custom decimals', () => {
    expect(formatPercentage(45.6789, 2)).toBe('45.68%');
  });

  it('formats zero correctly', () => {
    expect(formatPercentage(0)).toBe('0.0%');
  });
});

describe('formatNumber', () => {
  it('formats with default decimals', () => {
    expect(formatNumber(1234.5678)).toBe('1,234.57');
  });

  it('formats with custom decimals', () => {
    expect(formatNumber(1234.5678, 0)).toBe('1,235');
  });

  it('formats with zero decimals', () => {
    expect(formatNumber(1234, 0)).toBe('1,234');
  });
});

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});

describe('formatChartDate', () => {
  it('formats date for chart axis', () => {
    const result = formatChartDate('2024-01-15');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });
});

describe('getAssetTypeLabel', () => {
  it('returns correct label for stock', () => {
    expect(getAssetTypeLabel('stock')).toBe('Stocks');
  });

  it('returns correct label for crypto', () => {
    expect(getAssetTypeLabel('crypto')).toBe('Crypto');
  });

  it('returns correct label for fiat', () => {
    expect(getAssetTypeLabel('fiat')).toBe('Cash');
  });

  it('returns original type for unknown', () => {
    expect(getAssetTypeLabel('unknown')).toBe('unknown');
  });
});
