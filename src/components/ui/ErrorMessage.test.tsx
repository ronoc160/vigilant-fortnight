import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders with default title', () => {
    render(<ErrorMessage message="An error occurred" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ErrorMessage title="Connection Error" message="Unable to connect" />);
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
  });

  it('displays the error message', () => {
    render(<ErrorMessage message="Failed to load data" />);
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live="polite" for screen readers', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders retry button when onRetry is provided', () => {
    render(<ErrorMessage message="Error" onRetry={() => {}} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const handleRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={handleRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders error icon with aria-hidden', () => {
    render(<ErrorMessage message="Error" />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies error styling', () => {
    render(<ErrorMessage message="Error" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('displays title with correct styling', () => {
    render(<ErrorMessage title="Error Title" message="Details" />);
    expect(screen.getByText('Error Title')).toHaveClass('text-red-900');
  });

  it('displays message with correct styling', () => {
    render(<ErrorMessage message="Error details here" />);
    expect(screen.getByText('Error details here')).toHaveClass('text-red-700');
  });
});
