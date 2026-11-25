import { createApp } from './app';
import { env } from './config/env';
import { testDbConnection } from './config/database';
import './models'; // Ensure models and associations are registered

const startServer = async () => {
  try {
    await testDbConnection();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log(`
🚀 ===================================================
   2NOMADS API Server is running!
   Environment: ${env.NODE_ENV}
   Port:        ${env.PORT}
   URL:         http://localhost:${env.PORT}
   API v1 Root: http://localhost:${env.PORT}/api/v1
   Health:      http://localhost:${env.PORT}/api/v1/health
===================================================
      `);
    });

    const shutdown = () => {
      console.log('\nGracefully shutting down server...');
      server.close(() => {
        console.log('Server stopped.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
