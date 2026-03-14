import app from './app';
import { createServer } from 'http';

// Get port from environment or use default
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(Number(PORT), HOST, () => {
  const env = process.env.NODE_ENV || 'development';
  const serverUrl = `http://${HOST}:${PORT}`;
  const healthUrl = `http://${HOST}:${PORT}/health`;
  
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║     VayBooks Server Started! 🚀       ║
║                                        ║
║     Environment: ${env.padEnd(22)}║
║     Server: ${serverUrl.padEnd(32)}║
║     Health: ${healthUrl.padEnd(32)}║
║                                        ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;
