const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ DB Connected: MongoDB connection successful');
    logger.info('Connected to MongoDB successfully');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server Running: http://localhost:${PORT}`);
      console.log(`📊 API Endpoints: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    });
  })
  .catch(error => {
    console.error('❌ DB Connection Failed:', error.message);
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });
