# Finance Management Frontend

Modern React frontend for the personal finance management system.

## Features

- **Dashboard**: Overview of financial data with analytics
- **Accounts**: Manage different account types and balances
- **Transactions**: Track income and expenses with filtering
- **Budgets**: Set and monitor budget goals (Coming Soon)
- **Analytics**: Detailed financial insights and trends (Coming Soon)
- **Multi-workspace**: Collaborate with family or teams

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** + **shadcn/ui** for styling
- **React Query** for data fetching and caching
- **Zustand** for state management
- **React Router** for navigation
- **Supabase** for authentication
- **Recharts** for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Running backend API (see ../backend/README.md)
- Supabase instance configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update environment variables:
```env
VITE_API_URL=http://localhost:8787/api/v1
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

```bash
npm run build
```

### Deployment

#### Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Add environment variables in Cloudflare Pages dashboard

#### Manual Deployment

```bash
npm run build
npx wrangler pages deploy dist --project-name finance-management-frontend
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── common/         # Common components
├── pages/              # Page components
├── stores/             # Zustand stores
├── services/           # API services
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Authentication

The app uses Supabase Auth with Google OAuth support. Users can:
- Sign in with Google
- Create and manage workspaces
- Invite team members
- Switch between workspaces

## Features Overview

### Dashboard
- Account balance overview
- Recent transactions
- Spending analytics
- Budget progress (Coming Soon)

### Accounts
- Multiple account types (Cash, Bank, Investment, Asset, Debt)
- Balance tracking and history
- Account management

### Transactions
- Income and expense tracking
- Category-based filtering
- Bulk operations
- Receipt attachment support (Coming Soon)

### Collaboration
- Multi-user workspaces
- Role-based permissions (Owner, Admin, Member)
- Team member management

## Contributing

1. Follow the existing code style
2. Use TypeScript strict mode
3. Add proper error handling
4. Include loading states for async operations
5. Follow the component structure patterns

## License

Private project - All rights reserved