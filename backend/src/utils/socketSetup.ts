import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { logger } from './logger';

let io: Server;

export const setupSocketIO = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim()),
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info('Socket.IO client connected', { socketId: socket.id });

    socket.on('join:emergency', (emergencyId: string) => {
      socket.join(`emergency:${emergencyId}`);
    });

    socket.on('join:request', (requestId: string) => {
      socket.join(`request:${requestId}`);
    });

    socket.on('disconnect', () => {
      logger.info('Socket.IO client disconnected', { socketId: socket.id });
    });
  });

  return io;
};

export const emitEmergencyUpdate = (emergencyId: string, data: Record<string, unknown>): void => {
  if (io) {
    io.to(`emergency:${emergencyId}`).emit('emergency:update', { emergencyId, ...data });
  }
};

export const emitBloodRequestUpdate = (requestId: string, data: Record<string, unknown>): void => {
  if (io) {
    io.to(`request:${requestId}`).emit('request:update', { requestId, ...data });
  }
};

export { io };
