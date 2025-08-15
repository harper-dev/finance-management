# Finance Management API Documentation

## Overview

The Finance Management API is a RESTful service built with Hono and TypeORM, providing comprehensive financial management capabilities including accounts, transactions, budgets, savings goals, and analytics.

## Base URL

```
http://localhost:3002/api/v1
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Endpoints

### Health Check

#### GET /health
Returns the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "port": 3002
}
```

### Authentication

#### POST /auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "displayName": "John Doe"
    }
  },
  "message": "Login successful"
}
```

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

### Workspaces

#### GET /workspaces
Get all workspaces for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "workspace-id",
      "name": "Personal Finance",
      "type": "personal",
      "currency": "USD",
      "timezone": "UTC",
      "dateFormat": "YYYY-MM-DD"
    }
  ]
}
```

#### POST /workspaces
Create a new workspace.

**Request Body:**
```json
{
  "name": "Personal Finance",
  "type": "personal",
  "currency": "USD",
  "timezone": "UTC",
  "dateFormat": "YYYY-MM-DD"
}
```

### Accounts

#### GET /accounts
Get all accounts for a workspace.

**Query Parameters:**
- `workspace_id` (required): Workspace ID
- `is_active` (optional): Filter by active status
- `type` (optional): Filter by account type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "account-id",
      "name": "Main Bank Account",
      "type": "bank",
      "currency": "USD",
      "balance": 5000.00,
      "isActive": true
    }
  ]
}
```

#### POST /accounts
Create a new account.

**Request Body:**
```json
{
  "name": "Main Bank Account",
  "type": "bank",
  "currency": "USD",
  "balance": 5000.00
}
```

**Query Parameters:**
- `workspace_id` (required): Workspace ID

#### GET /accounts/:id
Get a specific account by ID.

#### PUT /accounts/:id
Update an account.

#### DELETE /accounts/:id
Delete an account.

### Transactions

#### GET /transactions
Get transactions for a workspace with optional filtering.

**Query Parameters:**
- `workspace_id` (required): Workspace ID
- `account_id` (optional): Filter by account
- `type` (optional): Filter by transaction type
- `category` (optional): Filter by category
- `start_date` (optional): Start date for range
- `end_date` (optional): End date for range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "transaction-id",
      "type": "expense",
      "amount": 50.00,
      "currency": "USD",
      "category": "Food",
      "description": "Grocery shopping",
      "transactionDate": "2024-01-01",
      "accountId": "account-id"
    }
  ]
}
```

#### POST /transactions
Create a new transaction.

**Request Body:**
```json
{
  "type": "expense",
  "amount": 50.00,
  "currency": "USD",
  "category": "Food",
  "description": "Grocery shopping",
  "transactionDate": "2024-01-01",
  "accountId": "account-id"
}
```

**Query Parameters:**
- `workspace_id` (required): Workspace ID

### Budgets

#### GET /budgets
Get all budgets for a workspace.

**Query Parameters:**
- `workspace_id` (required): Workspace ID
- `is_active` (optional): Filter by active status
- `period` (optional): Filter by budget period

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "budget-id",
      "name": "Food Budget",
      "category": "Food",
      "amount": 500.00,
      "period": "monthly",
      "startDate": "2024-01-01",
      "isActive": true
    }
  ]
}
```

#### POST /budgets
Create a new budget.

**Request Body:**
```json
{
  "name": "Food Budget",
  "category": "Food",
  "amount": 500.00,
  "period": "monthly",
  "startDate": "2024-01-01"
}
```

**Query Parameters:**
- `workspace_id` (required): Workspace ID

#### GET /budgets/:id/spending
Get budget with spending details.

#### GET /budgets/workspace/:workspaceId/active
Get active budgets with spending for a workspace.

#### GET /budgets/workspace/:workspaceId/summary
Get budget summary for a workspace.

### Savings Goals

#### GET /savings-goals
Get all savings goals for a workspace.

**Query Parameters:**
- `workspace_id` (required): Workspace ID
- `is_active` (optional): Filter by active status
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "goal-id",
      "name": "Vacation Fund",
      "targetAmount": 5000.00,
      "currentAmount": 2500.00,
      "targetDate": "2024-12-31",
      "progressPercentage": 50.0,
      "isCompleted": false
    }
  ]
}
```

#### POST /savings-goals
Create a new savings goal.

**Request Body:**
```json
{
  "name": "Vacation Fund",
  "targetAmount": 5000.00,
  "targetDate": "2024-12-31",
  "category": "Travel"
}
```

**Query Parameters:**
- `workspace_id` (required): Workspace ID

### Analytics

#### GET /analytics/workspace/:workspaceId/overview
Get comprehensive workspace overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalBalance": 10000.00,
      "accountsCount": 3,
      "monthlyIncome": 5000.00,
      "monthlyExpenses": 3000.00,
      "monthlyNet": 2000.00
    },
    "accounts": [...],
    "monthlySummary": {...},
    "activeBudgets": [...],
    "activeSavingsGoals": [...]
  }
}
```

#### GET /analytics/workspace/:workspaceId/trends
Get financial trends for a workspace.

**Query Parameters:**
- `months_back` (optional): Number of months to analyze (default: 12)

#### GET /analytics/workspace/:workspaceId/spending
Get spending analysis for a workspace.

**Query Parameters:**
- `start_date` (required): Start date for analysis
- `end_date` (required): End date for analysis

#### GET /analytics/workspace/:workspaceId/patterns
Get spending patterns for a workspace.

**Query Parameters:**
- `months_back` (optional): Number of months to analyze (default: 6)

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Validation Error - Invalid data format |
| 500 | Internal Server Error |

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Data retrieval endpoints: 100 requests per minute
- Data modification endpoints: 20 requests per minute

## Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

## Filtering and Sorting

Most list endpoints support filtering and sorting:

**Filtering:**
- Use query parameters to filter results
- Multiple filters can be combined

**Sorting:**
- Use `sort_by` parameter to specify sort field
- Use `sort_order` parameter (asc/desc)

## Data Types

### Currency
Supported currency codes: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY

### Account Types
- `cash`: Physical cash
- `bank`: Bank accounts
- `investment`: Investment accounts
- `asset`: Other assets
- `debt`: Liabilities

### Transaction Types
- `income`: Money received
- `expense`: Money spent
- `transfer`: Money moved between accounts

### Budget Periods
- `monthly`: Monthly budget
- `quarterly`: Quarterly budget
- `yearly`: Yearly budget

### Workspace Types
- `personal`: Individual workspace
- `family`: Family workspace
- `team`: Team workspace

## Webhooks

The API supports webhooks for real-time notifications:

### Available Events
- `transaction.created`
- `transaction.updated`
- `transaction.deleted`
- `budget.exceeded`
- `goal.completed`

### Webhook Configuration
```json
{
  "url": "https://your-app.com/webhooks",
  "events": ["transaction.created", "budget.exceeded"],
  "secret": "webhook-secret-key"
}
```

## SDKs and Libraries

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- Java
- .NET

## Support

For API support and questions:
- Documentation: [Link to docs]
- Email: support@finance-management.com
- GitHub Issues: [Repository link]

## Changelog

### v2.0.0 (Current)
- Complete TypeORM refactoring
- New analytics services
- Performance optimizations
- Enhanced caching
- Improved error handling

### v1.0.0
- Initial release
- Basic CRUD operations
- Simple analytics 