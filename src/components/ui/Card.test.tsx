import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardTitle } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm');
  });

  it('accepts custom className', () => {
    render(<Card className="custom-card">Content</Card>);
    expect(screen.getByText('Content')).toHaveClass('custom-card');
  });

  it('passes through additional props', () => {
    render(<Card data-testid="test-card">Content</Card>);
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText('Header')).toHaveClass('px-6', 'py-4', 'border-b');
  });

  it('accepts custom className', () => {
    render(<CardHeader className="flex justify-between">Header</CardHeader>);
    expect(screen.getByText('Header')).toHaveClass('flex', 'justify-between');
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Content here</CardContent>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<CardContent>Content</CardContent>);
    expect(screen.getByText('Content')).toHaveClass('p-6');
  });

  it('accepts custom className', () => {
    render(<CardContent className="p-0">Content</CardContent>);
    expect(screen.getByText('Content')).toHaveClass('p-0');
  });
});

describe('CardTitle', () => {
  it('renders children', () => {
    render(<CardTitle>Title text</CardTitle>);
    expect(screen.getByText('Title text')).toBeInTheDocument();
  });

  it('renders as h3 by default', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title');
  });

  it('renders as h2 when specified', () => {
    render(<CardTitle as="h2">Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Title');
  });

  it('renders as h1 when specified', () => {
    render(<CardTitle as="h1">Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title');
  });

  it('renders as h4 when specified', () => {
    render(<CardTitle as="h4">Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Title');
  });

  it('applies default styling', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');
  });

  it('accepts custom className', () => {
    render(<CardTitle className="text-xl">Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('text-xl');
  });
});

describe('Card composition', () => {
  it('renders complete card with header, title, and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle as="h2">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dashboard content goes here</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Dashboard content goes here')).toBeInTheDocument();
  });
});
