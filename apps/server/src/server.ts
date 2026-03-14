import app from './app';
import { createServer } from 'http';
import { initializeDatabase, closeDatabase } from './core/database';

// Get port from environment or use default
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const server = createServer(app);

// Start server with database initialization
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await closeDatabase();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await closeDatabase();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await closeDatabase();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await closeDatabase();
  process.exit(1);
});

export default server;
