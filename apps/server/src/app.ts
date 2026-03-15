import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createLogger, errorLogger } from './middleware/logger';
import { sanitizeInput, validateRequest } from './middleware/validation';
import { createCustomerRoutes } from './modules/customers/customer.routes';

// Load environment variables
dotenv.config();

/**
 * Create and configure Express application
 * @param prisma - Prisma client instance
 * @returns Configured Express application
 */
export function createApp(prisma: PrismaClient): Application {
  const app: Application = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? false
      : ['http://localhost:3000', 'tauri://localhost'],
    credentials: true,
  }));

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });

  app.use('/api', limiter);

  // Logging middleware
  app.use(createLogger({
    skipPaths: ['/health', '/favicon.ico'],
    logBody: process.env.NODE_ENV === 'development'
  }));

  // Input sanitization
  app.use(sanitizeInput);

  // Add error logger before error handler
  app.use(errorLogger);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // API info endpoint
  app.get('/api/v1/info', (_req: Request, res: Response) => {
    res.json({
      name: 'VayBooks API',
      version: '1.0.0',
      description: 'Business Management Software API',
    });
  });

  // Test endpoint with validation
  app.post('/api/v1/test', validateRequest([
    { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 100 }
  ]), (req: Request, res: Response) => {
    res.json({
      message: 'Test successful',
      received: req.body,
    });
  });

  // API routes
  const apiPrefix = '/api/v1';

  // Customer routes
  app.use(`${apiPrefix}/customers`, createCustomerRoutes(prisma));

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
    });
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction): void => {
    // Only log errors in non-test environments to keep test output clean
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error:', err);
    }

    // Handle custom error types
    if (err.name === 'NotFoundError') {
      res.status(404).json({
        error: err.message,
      });
      return;
    }

    if (err.name === 'ValidationError' || err.name === 'DuplicateError') {
      res.status(400).json({
        error: err.message,
      });
      return;
    }

    if (err.name === 'BusinessRuleError') {
      res.status(400).json({
        error: err.message,
      });
      return;
    }

    // Handle Prisma errors
    if (err.code === 'P2002') {
      res.status(400).json({
        error: 'Duplicate entry. A record with this value already exists.',
      });
      return;
    }

    // Default error
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message,
    });
  });

  return app;
}

// Create default app instance for backward compatibility
const prisma = new PrismaClient();
const app = createApp(prisma);

export default app;
