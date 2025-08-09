# Personal Finance Management System

A modern, full-stack personal finance management application built with React, TypeScript, Cloudflare Workers, and Supabase.

## 🚀 Features

### Core Features
- **Multi-workspace support** - Personal, family, and team financial management
- **Account management** - Track cash, bank accounts, investments, assets, and debts
- **Transaction tracking** - Income, expenses, and transfers with categorization
- **Budget management** - Monthly, quarterly, and yearly budgets with spending tracking
- **Savings goals** - Set and track progress toward financial goals
- **Real-time analytics** - Spending analysis, income tracking, and financial trends

### Collaborative Features
- **Multi-user workspaces** - Invite family members and collaborators
- **Role-based permissions** - Owner, admin, member, and viewer roles
- **Shared budgets and goals** - Collaborative financial planning
- **Privacy controls** - Granular data sharing permissions

### Security Features
- **Row-level security** - Database-level access control
- **OAuth authentication** - Google Sign-In integration
- **Data encryption** - Sensitive data encrypted at rest
- **Audit logging** - Track all financial data changes

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- React Query (data fetching)
- Vite (build tool)

**Backend:**
- Cloudflare Workers (serverless)
- Hono.js (web framework)
- TypeScript
- Supabase (database & auth)

**Database:**
- Supabase PostgreSQL
- Row-level security (RLS)
- Real-time subscriptions

**Deployment:**
- Frontend: Cloudflare Pages
- Backend: Cloudflare Workers
- Database: Supabase Cloud

### System Architecture

```
React Frontend (Cloudflare Pages)
         ↓
Cloudflare Workers API (Hono.js)
         ↓
Supabase PostgreSQL Database
         ↓
Supabase Auth (Google OAuth)
```

## 📁 Project Structure

```
finance-management/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── ui/         # Base UI components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── features/   # Feature-specific components
│   │   │   └── charts/     # Chart components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client services
│   │   ├── stores/         # Zustand stores
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── pages/          # Page components
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/                  # Cloudflare Workers API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Authentication & CORS
│   │   ├── services/       # Business logic services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Main application entry
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml       # Cloudflare Workers config
├── supabase/                # Database schema and migrations
│   ├── migrations/         # SQL migration files
│   ├── seed.sql            # Sample data
│   └── config.toml         # Supabase local config
├── docs/                    # Project documentation
│   ├── feature_analysis.md
│   ├── technical_architecture.md
│   └── functions.md
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase CLI
- Cloudflare account (for deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-management
   ```

2. **Setup Supabase locally**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Start local Supabase
   supabase start
   
   # Apply database migrations
   supabase db push
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file with Supabase credentials
   cp .env.example .env
   
   # Start development server
   npm run dev
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Start development server
   npm run dev
   ```

5. **Configure Environment Variables**
   
   **Backend (.env):**
   ```
   SUPABASE_URL=http://localhost:54321
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   JWT_SECRET=your-jwt-secret
   ```
   
   **Frontend (.env):**
   ```
   VITE_API_URL=http://localhost:8787/api/v1
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Database Setup

The database schema is automatically created when you run `supabase db push`. This includes:

- **User profiles and workspaces**
- **Accounts and transactions**
- **Budgets and savings goals**
- **Row-level security policies**
- **Database functions and triggers**

### Google OAuth Setup

1. Create a Google Cloud Project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:54321/auth/v1/callback` (local)
   - `https://your-project.supabase.co/auth/v1/callback` (production)
5. Update Supabase Auth settings with Google credentials

## 🚢 Deployment

### Frontend Deployment (Cloudflare Pages)

1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - Build command: `cd frontend && npm run build`
   - Build output directory: `frontend/dist`
3. Configure environment variables in Cloudflare Pages dashboard

### Backend Deployment (Cloudflare Workers)

1. Install Wrangler CLI: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Deploy: `cd backend && npm run deploy`
4. Set environment secrets:
   ```bash
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_ANON_KEY
   wrangler secret put SUPABASE_SERVICE_KEY
   wrangler secret put JWT_SECRET
   ```

### Production Database (Supabase Cloud)

1. Create a new Supabase project
2. Run migrations: `supabase db push --linked`
3. Configure Google OAuth in Supabase Auth settings
4. Update environment variables with production URLs

## 📊 Cost Analysis

### Free Tier Limits

**Cloudflare:**
- Pages: 500 builds/month, unlimited bandwidth
- Workers: 100,000 requests/day
- KV: 100,000 read ops/day

**Supabase:**
- Database: 500MB storage
- Auth: 50,000 monthly active users
- API: 500,000 requests/month

**Estimated Capacity:**
- **Users**: 6,000-7,000 registered users
- **Monthly Active**: 2,000-3,000 users
- **Storage**: ~500MB (primary limitation)

**Upgrade Cost:** ~$25-30/month for Supabase Pro when limits exceeded

## 🔒 Security

### Authentication
- Supabase Auth with Google OAuth
- JWT tokens with automatic refresh
- Row-level security (RLS) policies

### Data Protection
- All sensitive financial data encrypted at rest
- HTTPS/TLS for all data in transit
- Role-based access control (RBAC)
- Audit logging for all transactions

### Privacy Controls
- Granular permission system
- Data sharing controls for multi-user workspaces
- GDPR-compliant data export/deletion
- Local data storage options

## 🧪 Testing

```bash
# Run frontend tests
cd frontend && npm run test

# Run backend tests
cd backend && npm run test

# Run type checking
npm run type-check
```

## 📖 API Documentation

### Authentication Endpoints
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/profile` - Create user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Core Endpoints
- **Workspaces**: `/api/v1/workspaces`
- **Accounts**: `/api/v1/accounts`
- **Transactions**: `/api/v1/transactions`
- **Budgets**: `/api/v1/budgets`
- **Analytics**: `/api/v1/analytics`

All endpoints require Bearer token authentication and support standard CRUD operations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@finance-app.com or join our Discord community.

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with banks and financial institutions
- [ ] AI-powered financial insights
- [ ] Multi-currency support improvements
- [ ] Receipt scanning and OCR
- [ ] Investment portfolio tracking
- [ ] Tax preparation features