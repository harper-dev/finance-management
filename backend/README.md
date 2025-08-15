# Finance Management Backend

A Node.js backend API for personal finance management built with Hono, TypeORM, and PostgreSQL.

## Features

- **Modern Architecture**: Built with Hono framework and TypeORM
- **Type Safety**: Full TypeScript support
- **Database**: PostgreSQL with TypeORM entities
- **Authentication**: JWT-based authentication
- **Analytics**: Comprehensive financial analytics and reporting
- **Performance**: Built-in caching and optimization

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-management/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   SUPABASE_HOST=localhost
   SUPABASE_PORT=5432
   SUPABASE_USER=postgres
   SUPABASE_PASSWORD=your_password
   SUPABASE_DB=finance_management
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   
   # Server Configuration
   PORT=3002
   NODE_ENV=development
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
   
   # Logging Configuration
   LOG_LEVEL=info
   LOG_FILE_PATH=logs/app.log
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb finance_management
   
   # Run migrations (if available)
   npm run migrate:up
   ```

## Development

1. **Start development server**
   ```bash
   npm run dev
   ```
   Server will start on http://localhost:3002

2. **Type checking**
   ```bash
   npm run type-check
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Workspaces
- `GET /api/v1/workspaces` - Get user workspaces
- `POST /api/v1/workspaces` - Create workspace

### Accounts
- `GET /api/v1/accounts` - Get workspace accounts
- `POST /api/v1/accounts` - Create account
- `GET /api/v1/accounts/:id` - Get account details
- `PUT /api/v1/accounts/:id` - Update account
- `DELETE /api/v1/accounts/:id` - Delete account

### Transactions
- `GET /api/v1/transactions` - Get transactions
- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions/:id` - Get transaction details
- `PUT /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Delete transaction

### Budgets
- `GET /api/v1/budgets` - Get workspace budgets
- `POST /api/v1/budgets` - Create budget
- `GET /api/v1/budgets/:id` - Get budget details
- `PUT /api/v1/budgets/:id` - Update budget
- `DELETE /api/v1/budgets/:id` - Delete budget

### Analytics
- `GET /api/v1/analytics/workspace/:id/overview` - Workspace overview
- `GET /api/v1/analytics/workspace/:id/trends` - Financial trends
- `GET /api/v1/analytics/workspace/:id/spending` - Spending analysis

## Architecture

```
src/
├── config/          # Configuration files
├── entities/        # TypeORM entities
├── repositories/    # Data access layer
├── services/        # Business logic
├── routes/          # API routes
├── middleware/      # Request/response middleware
├── utils/           # Utility functions
└── types/           # TypeScript type definitions
```

## Database Schema

The application uses TypeORM entities with the following main tables:
- `users` - User accounts and profiles
- `workspaces` - Financial workspaces
- `accounts` - Financial accounts
- `transactions` - Financial transactions
- `budgets` - Budget management
- `savings_goals` - Savings goals tracking

## Performance Features

- **Caching**: Multi-level caching strategy
- **Query Optimization**: TypeORM query optimization
- **Parallel Processing**: Concurrent operations where possible
- **Memory Management**: Efficient memory usage and cleanup

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 