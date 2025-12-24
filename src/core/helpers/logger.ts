import winston from 'winston';
import * as path from 'path';
import { env } from '@config/environment.config';

const logDir = path.resolve(process.cwd(), 'logs');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  }),
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
    level: env.get('logLevel'),
  }),
];

if (env.get('logToFile')) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880,
      maxFiles: 5,
    }),
  );
}

const logger = winston.createLogger({
  level: env.get('logLevel'),
  format: logFormat,
  transports,
  exitOnError: false,
});

export const createLogger = (context: string): winston.Logger => {
  return logger.child({ context });
};

export default logger;
