# Tiny Inventory

A full-stack inventory management system for tracking stores and their products.

## Run Instructions

```bash
# Start everything with a single command
docker compose up --build

# The application will:
# 1. Start PostgreSQL
# 2. Run migrations
# 3. Seed sample data
# 4. Start the API server on http://localhost:3000
```

**Note:** First run may take 30-60 seconds for database initialization and seeding.

### Development Setup

```bash
# Install dependencies
cd server
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Start dev server (requires local PostgreSQL)
npm run dev
```

## API Sketch

```
GET    /stores                    # List stores (paginated)
POST   /stores                    # Create store
GET    /stores/:id/analytics      # Store analytics (non-trivial: aggregations, metrics)
GET    /products?category=X       # List products (filtered, paginated)
POST   /products                  # Create product
PATCH  /products/:id              # Update product
DELETE /products/:id              # Delete product
```

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
- Trade-off: Larger storage footprint, but negligible for this scale

### Architecture Decisions

**No Repository Layer**
- Services handle both business logic and data access
- Appropriate for this scale - avoids unnecessary abstraction
- Drizzle already provides good separation from raw SQL
- Would add repositories if: multiple data sources, complex query reuse, or stricter test isolation needed

**Service Layer Pattern**
- Clear separation: Routes (HTTP) → Services (Logic) → DB
- Makes business logic testable without HTTP overhead
- Easy to understand and navigate

**Zod for Validation**
- Type-safe validation with TypeScript inference
- Validates at the API boundary
- Clear error messages for clients

**Structured Logging (Pino)**
- Fastify's built-in logger for performance
- Pretty logging in development with `pino-pretty`
- JSON logs in production for log aggregation
- Request/response logging with timing

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
  "summary": {
    "totalProducts": 12,
    "totalValue": 15789.88,
    "avgProductPrice": 449.99,
    "lowStockItems": 3,
    "outOfStockItems": 1,
    "categories": 4
  },
  "categoryBreakdown": [
    { "category": "Laptops", "count": 2, "totalValue": 5600.00 },
    { "category": "Audio", "count": 3, "totalValue": 2100.00 }
  ]
}
```

## Testing Approach

### Implementation

**Unit Tests** (Services) - `src/services/*.test.ts`
- Core business logic (pagination calculations, offsets)
- Edge cases (empty results, boundary conditions)
- Pure function testing without complex mocking
- Example: Pagination math verification

**Integration Tests** (Routes) - `src/routes/*.test.ts`
- Full HTTP request/response cycle using Fastify's inject
- Validation error handling (400s)
- Not found scenarios (404s)
- CRUD operations end-to-end
- Example: Products API contract tests

**Test Framework: Vitest**
- Fast, modern test runner with native ESM support
- TypeScript support out of the box
- Easy mocking with `vi.mock()`
- Familiar Jest-like API

### Run Tests

```bash
cd server
npm test              # Run all tests once
npm run test:watch    # Watch mode
```

### Coverage Focus
- API contracts (request/response shapes, status codes)
- Error handling (validation, not found, server errors)
- Pagination logic (correct page calculations)
- Filtering combinations

### Rationale
Tests focus on **API contracts** and **business logic** rather than implementation details:
- **Service tests** verify calculations (pagination math) without mocking database internals
- **Route tests** verify HTTP behavior and error handling with service mocks
- Avoids brittle tests tied to ORM query builder implementation
- Fast, simple, and easy to understand for reviewers

## If I Had More Time

- **Frontend React application** - Product list/detail views with React Query, store management dashboard, analytics visualization, loading/error states, responsive design with Tailwind CSS
- **Expand test coverage** - Add E2E tests for critical user flows, test analytics calculation accuracy with real data scenarios, add database integration tests with test containers
- **API documentation with Swagger/OpenAPI** - Auto-generated interactive docs from Zod schemas, request/response examples, API versioning strategy
