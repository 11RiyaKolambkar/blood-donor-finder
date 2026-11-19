import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, json, colorize, simple, errors } = winston.format;

// NEVER log: passwords, tokens, full coords, card data, medical details
const sanitizeMessage = winston.format((info) => {
  if (info.password) info.password = '[REDACTED]';
  if (info.passwordHash) info.passwordHash = '[REDACTED]';
  if (info.token) info.token = '[REDACTED]';
  if (info.refreshToken) info.refreshToken = '[REDACTED]';
  if (info.cardNumber) info.cardNumber = '[REDACTED]';
  return info;
});

const devFormat = combine(
  errors({ stack: true }),
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  simple(),
);

const prodFormat = combine(
  errors({ stack: true }),
  sanitizeMessage(),
  timestamp(),
  json(),
);

export const logger = winston.createLogger({
  level: config.logLevel,
  format: config.env === 'development' ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
    ...(config.env === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});
