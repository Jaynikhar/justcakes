import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  // app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  // app.use(
  //   cors({
  //     origin: [env.clientUrl],
  //     credentials: true,
  //   }),
  // );
    // Change your current app.use(cors(...)) setup to look exactly like this:
  const allowedOrigins = [
    env.clientUrl, 
    'https://justcakes-seven.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, postman, or curl)
        if (!origin) return callback(null, true);
        
        // check if origin is in our allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error('Not allowed by CORS'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (!env.isProd) app.use(morgan('dev'));

  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many attempts. Try again in a few minutes.' },
    }),
  );

  app.use(
    '/api',
    rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }),
  );

  // Only the public uploads folder is served statically.
  // Payment screenshots live in uploads/private and are streamed through an
  // authorised route instead.
  app.use(
    '/uploads/public',
    express.static(path.resolve(here, '../uploads/public'), {
      maxAge: '7d',
      setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
    }),
  );

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
