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
# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/twitter_clone

# JWT
JWT_ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
JWT_REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Email (for OTP and notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Gmail Setup for Email Service

To use Gmail for sending emails (OTP, welcome emails, etc.), you need to set up an App Password:

1. **Enable 2-Factor Authentication** on your Google Account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security → 2-Step Verification
   - Scroll down and click "App passwords"
   - Select "Mail" as the app and "Other" as the device
   - Generate the password
3. **Use the App Password** in your `.env` file:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

**Note**: The email service is optional. If email credentials are not provided or invalid, the application will continue to work without email functionality (registration, login, etc. will still work, but no emails will be sent).

## API Endpoints

### Public Endpoints
- `GET /health` - Health check endpoint
- `GET /api` - API welcome message

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout-all` - Logout from all devices (protected)
- `GET /api/auth/check-token` - Check token validity

### Example Endpoints
- `GET /api/example/validate` - Validation error example
- `GET /api/example/user/:id` - Not found error example
- `GET /api/example/protected` - Authentication error example
- `POST /api/example/data` - Bad request error example
- `GET /api/example/error` - Generic error example

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
- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- OTP-based password reset with database storage
- Secure token management with blacklisting
- Input validation with Joi schemas

## Authentication System

### Features
- **User Registration**: Secure registration with email, username, and strong password validation
- **User Login**: Email and password-based authentication
- **JWT Management**: Access tokens (15min) and refresh tokens (7 days) with secure storage
- **Password Reset**: OTP-based password reset flow with database storage
- **Token Refresh**: Automatic token refresh mechanism
- **Secure Logout**: Token blacklisting and revocation
- **Rate Limiting**: Protection against brute force attacks

### Database Schema
- **Users**: Email, username, password (hashed), profile info
- **Refresh Tokens**: Secure token storage with expiration and revocation
- **Password Reset OTPs**: OTP storage for password reset flow

### Security Measures
- Password hashing with bcrypt (12 rounds)
- JWT tokens with issuer and audience validation
- Database-based OTP storage with expiration
- Rate limiting on sensitive endpoints
- Input validation with comprehensive schemas
- Secure error handling (no information leakage)

### Usage Examples

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Request password reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'

# Reset password with OTP
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "NewSecurePass123!"
  }'

# Get current user (protected route)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Build Output

The TypeScript code is compiled to the `dist/` directory with:
- Source maps for debugging
- Declaration files for type support
- Optimized for production

## License

ISC 