import { Request, Response, NextFunction } from 'express';

interface LoggerOptions {
  skipPaths?: string[];
  logBody?: boolean;
}

export function createLogger(options: LoggerOptions = {}) {
  const { skipPaths = ['/health'], logBody = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip logging for specified paths
    if (skipPaths.includes(req.path)) {
      return next();
    }

    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    // Log request
    console.log(`[${new Date().toISOString()}] ${requestId} --> ${req.method} ${req.path}`);
    
    if (logBody && req.body && Object.keys(req.body).length > 0) {
      console.log(`[${new Date().toISOString()}] ${requestId} Body:`, JSON.stringify(req.body, null, 2));
    }

    // Log response
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] ${requestId} <-- ${res.statusCode} (${duration}ms)`);
      return originalSend.call(this, data);
    };

    next();
  };
}

export function errorLogger(err: Error, req: Request, _res: Response, next: NextFunction) {
  console.error(`[${new Date().toISOString()}] ERROR:`, {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    body: req.body,
  });
  next(err);
}
