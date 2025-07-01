# TypeScript Node.js Backend

A production-ready TypeScript Node.js backend with Express.js, featuring security middleware, error handling, and proper project structure.

## Features

- ✅ TypeScript with strict type checking
- ✅ Express.js with security middleware (Helmet, CORS)
- ✅ Environment-based configuration
- ✅ Production-ready build process
- ✅ Development with hot reload
- ✅ Health check endpoint
- ✅ Global error handling
- ✅ Request logging (Morgan)
- ✅ Centralized error handling system
- ✅ Type-safe custom error classes
- ✅ Reusable error utilities
- ✅ Consistent error responses

## Project Structure

```
src/
├── index.ts                    # Application entry point
├── app.ts                      # Express app configuration
├── config.ts                   # Environment configuration
├── types/
│   └── errors.ts              # Error type definitions
├── errors/
│   ├── AppError.ts            # Custom error classes
│   └── index.ts               # Error exports
├── middleware/
│   └── errorHandler.ts        # Centralized error handling
├── utils/
│   └── errorUtils.ts          # Error utility functions
└── routes/
    └── example.ts             # Example routes with error handling
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

### Development

Start the development server with hot reload:
```bash
npm run dev:watch
```

Or run without watch mode:
```bash
npm run dev
```

### Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run dev:watch` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run clean` - Clean build directory

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api` - API welcome message
- `GET /api/example/validate` - Validation error example
- `GET /api/example/user/:id` - Not found error example
- `GET /api/example/protected` - Authentication error example
- `POST /api/example/data` - Bad request error example
- `GET /api/example/error` - Generic error example
- `GET /*` - 404 handler for undefined routes

## Error Handling System

### Custom Error Classes
- `AppError` - Base error class with type safety
- `ValidationError` - For input validation errors
- `AuthenticationError` - For authentication failures
- `AuthorizationError` - For permission denied errors
- `NotFoundError` - For resource not found errors
- `ConflictError` - For resource conflicts
- `BadRequestError` - For malformed requests
- `RateLimitError` - For rate limiting violations
- `DatabaseError` - For database operation errors
- `ExternalServiceError` - For third-party service errors

### Error Handling Features
- **Centralized Error Handler**: All errors are processed through a single middleware
- **Type-Safe Error Responses**: Consistent error response format with TypeScript types
- **Environment-Based Logging**: Different error details based on environment
- **Async Error Wrapper**: Automatic error catching for async route handlers
- **Reusable Utilities**: Helper functions for common error patterns

### Usage Examples

```typescript
// Throwing custom errors
throw new ValidationError('Invalid email format', { field: 'email' });
throw new NotFoundError('User', { id: '123' });
throw new AuthenticationError('Invalid token');

// Using async handler
router.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await findUser(req.params.id);
  if (!user) {
    throw new NotFoundError('User', { id: req.params.id });
  }
  res.json({ success: true, data: user });
}));

// Request validation
validateRequest(req, ['name', 'email']);
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- Request size limits
- Environment-based error handling

## Build Output

The TypeScript code is compiled to the `dist/` directory with:
- Source maps for debugging
- Declaration files for type support
- Optimized for production

## License

ISC 