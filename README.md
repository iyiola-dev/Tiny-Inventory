# Tiny Inventory

A full-stack inventory management system for tracking stores and their products. Built with Fastify, PostgreSQL, React, and TypeScript, this project demonstrates modern web development practices.

## Quick Start

### Docker Deployment

```bash
# Start everything with a single command
docker compose up --build
```

The application will automatically:
1. Start PostgreSQL database
2. Run database migrations
3. Seed sample data (5 stores, 60 products)
4. Start the API server
5. Start the React frontend

**Access URLs:**
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

**Note:** First run takes 1-2 minutes for all services to initialize.

### Running Tests Locally

```bash
cd server
npm install
npm test             # Run all tests (requires Docker for service tests)
npm run test:routes  # Fast route tests only (no Docker needed)
```

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                     React 18 + TypeScript                       │
│              TanStack Query + React Router + Tailwind           │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Fastify)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Routes    │  │  Validation  │  │   Response   │         │
│  │   (HTTP)     │─▶│    (Zod)     │─▶│   Formatter  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (Business Logic)               │
│         ┌──────────────┐              ┌──────────────┐         │
│         │   Stores     │              │   Products   │         │
│         │   Service    │              │   Service    │         │
│         └──────────────┘              └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │ Drizzle ORM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL 16)                      │
│              Stores Table  │  Products Table                    │
│              (UUID, Soft Delete Support)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack Summary

**Backend:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Fastify (high-performance HTTP server)
- **Database:** PostgreSQL 16 with UUID primary keys
- **ORM:** Drizzle ORM (type-safe SQL query builder)
- **Validation:** Zod (runtime type validation)
- **Testing:** Vitest + Testcontainers (54 tests)

**Frontend:**
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **State Management:** TanStack Query (server state)
- **Routing:** React Router
- **Styling:** Tailwind CSS

**Infrastructure:**
- **Containerization:** Docker + Docker Compose
- **Database Migrations:** Drizzle Kit
- **Logging:** Pino (structured JSON logging)

### Design Principles

1. **Type Safety First** - TypeScript end-to-end from database to UI
2. **Clear Separation of Concerns** - Layered architecture (Routes → Services → Data)
3. **API Contracts** - Standardized response format across all endpoints
4. **Real-World Patterns** - Soft deletes, pagination, filtering, aggregations
5. **Test-Driven Development** - Two-tier testing (fast route tests + integration tests with real DB)
6. **Production-Ready Practices** - Structured logging, error handling, validation, Docker deployment

## API Documentation

### Endpoints

```
GET    /stores                    # List stores (paginated)
POST   /stores                    # Create store
GET    /stores/:id                # Get store details
GET    /stores/:id/products       # List store products (paginated)
GET    /stores/:id/analytics      # Store analytics (non-trivial: aggregations, metrics)
GET    /products?category=X       # List products (filtered, paginated)
GET    /products/:id              # Get product details
POST   /products                  # Create product
PATCH  /products/:id              # Update product
DELETE /products/:id              # Soft delete product
```

### Standardized Response Format

All API responses follow a consistent structure:

**Success Response (Single Resource):**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Store Name",
    "location": "New York"
  }
}
```

**Success Response (Paginated List):**
```json
{
  "success": true,
  "data": {
    "stores": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Resource not found",
    "code": "NOT_FOUND",
    "details": { ... }
  }
}
```

**Benefits:**
- Consistent structure across all endpoints
- Easy to handle on frontend with `response.success` check
- Standardized error codes (NOT_FOUND, VALIDATION_ERROR, BAD_REQUEST)
- Pagination and data together in one object
- Self-documenting resource names (stores, products)

### Error Handling

All errors return appropriate HTTP status codes with consistent error objects:

- **400 Bad Request** - `VALIDATION_ERROR`, `BAD_REQUEST`
- **404 Not Found** - `NOT_FOUND`
- **500 Internal Server Error** - `INTERNAL_ERROR`

Example validation error:
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": ["price"],
        "message": "Expected number, received string"
      }
    ]
  }
}
```

## Frontend Application

### Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Full type safety from API to UI
- **Vite** - Lightning-fast build tool and dev server
- **TanStack Query** - Server state management with caching and automatic refetching
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Fetch API** - Type-safe API client with standardized error handling

### Features

**Store Management:**
- List all stores with pagination
- Real-time analytics dashboard per store
- Category breakdown with visual metrics
- Product inventory per store with filtering

**Product Management:**
- Search and filter products by category
- Paginated product listings
- Category-based filtering
- Responsive card-based UI

**User Experience:**
- Loading states with skeleton screens
- Error boundaries and error states
- Automatic refetching and cache invalidation
- Fully responsive design (mobile, tablet, desktop)
- Clean, modern UI with Tailwind CSS

### Design Decisions

**TanStack Query over Redux/Context**
- Eliminates boilerplate for server state management
- Automatic caching, refetching, and background updates
- Built-in loading/error states
- Perfect for server-driven applications

**Functional Components with Hooks**
- Modern React architecture
- Simpler than class components
- Easier to test and understand
- Better code reuse with custom hooks

**Tailwind CSS over Custom CSS**
- Faster development with utility classes
- Consistent design system
- No CSS file bloat or specificity issues
- Trade-off: HTML can look verbose, but benefits outweigh costs

**Type-Safe API Client**
- Centralized API client with error handling
- TypeScript interfaces for all API responses
- Automatic parsing of standardized response format
- Consistent error handling across the application

## Testing Strategy

### Test Types

**1. Route Tests** (`test/*.test.ts`) - 21 tests
- Fast execution (~150ms total)
- Full HTTP request/response cycle using Fastify's `inject`
- Service layer mocked to isolate route logic
- Tests API contracts, validation, and error handling
- No database required

**2. Service Integration Tests** (`test/services/*.test.ts`) - 33 tests
- Real PostgreSQL database via Testcontainers (~5s total)
- Tests actual SQL queries and transactions
- Verifies business logic with real data
- Tests soft delete, pagination, filtering, and analytics
- Database migrations run automatically

**Total: 54 tests covering routes and services**

### How to Run

```bash
cd server

# Run all tests (routes + services)
npm test

# Run only route tests (fast, no database)
npm run test:routes

# Run only service integration tests (with Testcontainers)
npm run test:services
npm run test:integration  # alias

# Watch mode for development
npm run test:watch
```

**Requirements:**
- Docker must be running for service tests (Testcontainers)
- Route tests have no external dependencies

### Coverage Approach

**Route Tests Cover:**
- Standardized API response format verification
- HTTP status codes (200, 201, 400, 404)
- Request validation with Zod schemas
- Error responses with proper error codes
- Pagination metadata in responses
- CRUD operations end-to-end (mocked services)

**Service Integration Tests Cover:**
- Database CRUD operations with real PostgreSQL
- Soft delete functionality (deletedAt timestamp)
- Complex SQL aggregations (analytics endpoint)
- Pagination logic with real data
- Filtering and search combinations
- Data integrity and constraints
- Edge cases (empty results, boundary conditions)

**Rationale:**
- Two-tier strategy provides comprehensive coverage
- Route tests are fast for TDD workflow
- Service tests catch real-world database issues
- Testcontainers ensure consistent test environment
- No database mocking = higher confidence in SQL correctness

## Decisions & Trade-offs

### Technology Choices

**Fastify over Express**
- Faster performance (2x throughput in benchmarks)
- Built-in schema validation support
- Modern TypeScript support out of the box
- Trade-off: Smaller ecosystem than Express, but sufficient for this use case

**Drizzle ORM over Prisma/TypeORM**
- Lightweight and closer to SQL
- Better TypeScript inference
- Easier to write complex queries when needed
- Trade-off: Less mature than Prisma, fewer community resources

**PostgreSQL over SQLite/In-memory**
- Production-realistic database
- Proper UUID support with `gen_random_uuid()`
- Better for demonstrating real-world patterns
- Trade-off: Requires Docker, but docker-compose handles this

**UUID over Auto-increment IDs**
- Better for distributed systems and merging data
- No ID enumeration security concerns
- Suitable for microservices architecture
- Trade-off: Larger storage footprint, but negligible for this scale and uuidV7() solves this

### Architecture Decisions

**No Repository Layer**
- Services handle both business logic and data access
- Appropriate for this scale - avoids unnecessary abstraction
- Drizzle ORM already provides good separation from raw SQL
- Would add repositories if: multiple data sources, complex query reuse, or stricter test isolation needed

**Service Layer Pattern**
- Clear separation: Routes (HTTP) → Services (Logic) → Database
- Makes business logic testable without HTTP overhead
- Easy to understand and navigate
- Single responsibility: routes handle HTTP, services handle business logic

**Zod for Validation**
- Type-safe validation with TypeScript inference
- Validates at the API boundary (routes)
- Clear, actionable error messages for clients
- Schema reuse for request/response types

**Structured Logging with Pino**
- Fastify's built-in logger for performance
- Pretty logging in development with `pino-pretty`
- JSON logs in production for log aggregation (Datadog, CloudWatch, etc.)
- Request/response logging with timing information

**Standardized API Response Format**
- Consistent `{ success, data, error }` structure across all endpoints
- Frontend can rely on predictable response shape
- Error handling simplified with standard codes (NOT_FOUND, VALIDATION_ERROR, etc.)
- Pagination and resource data together in `data` object (e.g., `{ stores: [...], pagination: {...} }`)
- Self-documenting resource names instead of generic wrappers
- Easier to build API client and error handling utilities

**Soft Deletes over Hard Deletes**
- `deletedAt` timestamp instead of removing records
- Preserves data for audit trails and recovery
- Filtered out in queries using `isNull(deletedAt)`
- Production-ready pattern for data integrity

### Non-trivial Operation

**Store Analytics Endpoint** (`GET /stores/:id/analytics`)

Goes beyond basic CRUD by computing business metrics with SQL aggregations:
- **Total inventory value** - Sum of (price × quantity) across all products
- **Average product price** - Mean price using `AVG()` aggregation
- **Low stock alerts** - Count of products with 1-9 units using `CASE` statements
- **Out of stock items** - Count of products with 0 quantity
- **Category metrics** - Groups products by category with count and value per category
- **Distinct category count** - Uses `COUNT(DISTINCT)` for unique categories

**Technical approach:** Single query with multiple aggregations (SUM, AVG, COUNT, DISTINCT, CASE, GROUP BY) for efficiency rather than multiple database round-trips.

**Example response:**
```json
{
  "totalProducts": 12,
  "totalValue": 15789.88,
  "avgProductPrice": 449.99,
  "lowStockItems": 3,
  "outOfStockItems": 1,
  "categories": 4,
  "categoryBreakdown": [
    { "category": "Laptops", "count": 2, "totalValue": 5600.00 },
    { "category": "Audio", "count": 3, "totalValue": 2100.00 }
  ]
}
```

## Production Readiness

### What's Implemented

**Core Functionality:**
- Full CRUD operations for stores and products
- Real-time analytics with SQL aggregations
- Pagination across all list endpoints
- Filtering and search capabilities
- Soft delete functionality for data recovery

**Quality & Reliability:**
- Comprehensive testing (54 tests with 100% critical path coverage)
- Type safety end-to-end with TypeScript
- Input validation with Zod schemas
- Standardized error handling and responses
- Structured logging for debugging

**DevOps & Deployment:**
- Docker containerization with Docker Compose
- Database migrations with Drizzle Kit
- Health check endpoint for monitoring
- Environment-based configuration
- Seed data for demo/testing

**Developer Experience:**
- Hot reload in development (Vite + tsx watch)
- Clear project structure and separation of concerns
- Testcontainers for reliable integration testing
- TypeScript for autocomplete and refactoring

### What's Missing

**API:**
- Authentication & authorization (JWT, sessions, RBAC)
- API versioning (v1, v2 routing strategy)
- Swagger/OpenAPI documentation (auto-generated from Zod schemas)
- Database indexes on frequently queried fields (category, storeId)
- Rate limiting and CORS configuration
- Metrics, logging, and observability

**Frontend:**
- Component testing (React Testing Library)
- E2E tests (Playwright for critical flows)
- Product create/update UI forms with validation
- Store create/update UI forms



### If I Had More Time

- **Frontend Testing** - Component tests with React Testing Library, E2E tests with Playwright
- **Store CRUD Forms** - Create and update store forms with validation
- **Product CRUD Forms** - Create and update product forms with validation
- **Authentication** - User accounts, JWT sessions, role-based access control
