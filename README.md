# Portfolio Dashboard

A React + TypeScript application for visualizing financial portfolio data with interactive charts and responsive design.

## Features

- **Authentication**: Simple login system with local storage persistence
- **Portfolio Donut Chart**: Visualize portfolio breakdown by asset class or individual asset
- **Positions Table**: Sortable table showing all portfolio positions with detailed information
- **Historical Chart**: Interactive line chart showing portfolio performance over time (1W, 1M, 3M, 6M, 1Y)
- **Responsive Design**: Fully responsive UI that works on mobile, tablet, and desktop
- **White-labeling Support**: Tailwind CSS theme variables for easy customization

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Mock API**: MSW (Mock Service Worker)
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router v7

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd portfolio-dashboard

# Install dependencies
npm install
```

### Running the Application

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Demo Credentials

- **Email**: `demo@example.com`
- **Password**: `password123`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── api/                    # API client and types
│   ├── client.ts           # Fetch wrapper with error handling
│   └── types.ts            # TypeScript interfaces
├── components/             # Reusable UI components
│   ├── ui/                 # Generic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Skeleton.tsx
│   │   └── ErrorMessage.tsx
│   ├── charts/             # Chart components
│   │   ├── DonutChart.tsx
│   │   └── HistoricalChart.tsx
│   ├── tables/
│   │   └── PositionsTable.tsx
│   └── ProtectedRoute.tsx
├── contexts/               # React contexts
│   └── AuthContext.tsx
├── hooks/                  # Custom hooks
│   ├── useAssets.ts
│   ├── usePrices.ts
│   ├── usePortfolio.ts
│   └── useHistoricalData.ts
├── layouts/
│   └── DashboardLayout.tsx
├── mocks/                  # MSW handlers and mock data
│   ├── browser.ts
│   ├── data.ts
│   └── handlers.ts
├── pages/
│   ├── Login.tsx
│   └── Dashboard.tsx
├── test/
│   └── setup.ts
├── utils/
│   └── formatters.ts
├── App.tsx
├── main.tsx
└── index.css
```

## API Endpoints (Mocked)

The application uses MSW to mock the following API endpoints:

### GET /api/assets
Returns a list of all available financial assets.

```json
[
  { "id": "uuid", "name": "AAPL", "type": "stock" },
  { "id": "uuid", "name": "BTC", "type": "crypto" },
  { "id": "uuid", "name": "USD", "type": "fiat" }
]
```

### GET /api/prices
Returns asset prices. Supports query parameters:
- `asset`: Filter by asset name(s), comma-separated
- `asOf`: Get prices for a specific date
- `from` & `to`: Get prices for a date range

```json
[
  { "id": "uuid", "asset": "AAPL", "price": 178.50, "asOf": "2024-01-15" }
]
```

### GET /api/portfolios
Returns the user's portfolio positions. Supports:
- `asOf`: Get portfolio for a specific date

```json
{
  "id": "uuid",
  "asOf": "2024-01-15T00:00:00Z",
  "positions": [
    { "id": 1, "asset": "uuid", "quantity": 50, "price": 178.50 }
  ]
}
```

## Theming / White-labeling

The application uses CSS custom properties for theming. Edit `src/index.css` to customize:

```css
@theme {
  --color-primary-500: #3b82f6;  /* Primary brand color */
  --color-primary-600: #2563eb;
  --color-success-500: #10b981;
  --color-warning-500: #f59e0b;
  --color-error-500: #ef4444;
}
```

## Testing

```bash
# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage
```

Tests include:
- Unit tests for utility functions
- Component tests for UI components
- Integration tests for pages

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## License

MIT
