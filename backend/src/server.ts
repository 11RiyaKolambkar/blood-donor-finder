import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config';
import { logger } from './utils/logger';
import { apiRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';
import { healthRouter } from './routes/health.routes';
import { setupSocketIO } from './utils/socketSetup';
import { seedInitialDonorsIfEmpty } from './utils/seedDonors';

export const app = express();
export const server = http.createServer(app);

// Initialize Socket.IO
setupSocketIO(server);

// Security & utility middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimiter);

// Routes - Support both /api/v1 and legacy /api endpoints
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Central error handler
app.use(errorHandler);

// Database connection & Server start
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(config.mongodb.uri)
    .then(async () => {
      logger.info('Connected to MongoDB');
      await seedInitialDonorsIfEmpty();
      server.listen(config.port, () => {
        logger.info(`PulseNet Backend running on port ${config.port} [${config.env}]`);
      });
    })
    .catch((err) => {
      logger.error('Failed to connect to MongoDB', { error: err.message });
      process.exit(1);
    });
}
