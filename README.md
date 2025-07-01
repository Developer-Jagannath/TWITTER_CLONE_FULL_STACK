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

## Project Structure

```
src/
├── index.ts      # Application entry point
├── app.ts        # Express app configuration
└── config.ts     # Environment configuration
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
- `GET /*` - 404 handler for undefined routes

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