import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pulsenet',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    enabled: !!process.env.REDIS_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_min_32_chars_placeholder!!',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_min_32_chars_!!',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    origins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },

  logLevel: process.env.LOG_LEVEL || 'info',

  features: {
    redis: process.env.NODE_ENV !== 'test' && !!process.env.REDIS_URL,
    payments: !!process.env.RAZORPAY_KEY_ID,
    maps: !!process.env.GOOGLE_MAPS_API_KEY,
    fcm: !!process.env.FCM_SERVER_KEY,
  },
};
