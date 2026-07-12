import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/** Project root (works for `nest start` from src/ and `node dist/main.js` from dist/). */
const rootDir = path.resolve(__dirname, '..');
const nodeEnv = process.env.NODE_ENV || 'development';

function loadEnvFile(relPath: string) {
  const full = path.join(rootDir, relPath);
  if (!fs.existsSync(full)) return false;
  dotenv.config({ path: full });
  return true;
}

// Order: mode-specific first, then base `.env` (dotenv does not override keys already set).
loadEnvFile(`.env.${nodeEnv}.local`);
loadEnvFile(`.env.${nodeEnv}`);
loadEnvFile('.env.local');
loadEnvFile('.env');

if (process.env.RESEND_API_KEY?.trim() || process.env.SMTP_PASS?.trim()?.startsWith('re_')) {
  console.log('[Env] Resend API key detected (outbound mail via Resend HTTPS API).');
} else if (process.env.SMTP_PASS?.trim()) {
  console.log('[Env] SMTP_PASS is set (outbound mail via SMTP).');
} else {
  console.warn(
    `[Env] Neither RESEND_API_KEY nor SMTP_PASS is set under ${rootDir}. ` +
      `Local: set SMTP_USER + SMTP_PASS in .env.development. ` +
      `Railway: set RESEND_API_KEY=re_… + SMTP_FROM.`,
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const isProd = process.env.NODE_ENV === 'production';

  const envOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\/$/, ''));

  const staticLocalOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ];

  /** Public website + admin on Vercel / custom domain — must match browser Origin */
  const publicSiteOrigins = [
    'https://houznext.com',
    'https://www.houznext.com',
    'https://store.houznext.com',
  ];

  const allowedOrigins = [
    ...staticLocalOrigins,
    ...publicSiteOrigins,
    ...envOrigins,
  ].map((s) => s.replace(/\/$/, ''));

  app.enableCors({
    origin: (origin, cb) => {
      // Server-to-server (no Origin) → allow
      if (!origin) return cb(null, true);
      // Dev: permissive CORS when ALLOWED_ORIGINS is not set (local admin + many ports)
      if (!isProd && envOrigins.length === 0) {
        return cb(null, true);
      }
      const normalized = origin.replace(/\/$/, '');
      const isVercelPreview = normalized.endsWith('.vercel.app');
      if (allowedOrigins.includes(normalized) || isVercelPreview) {
        return cb(null, true);
      }
      // Avoid high-volume [CORS] logs on Railway (rate limit) — set CORS_LOG_BLOCKED=1 to debug
      if (process.env.CORS_LOG_BLOCKED === '1') {
        console.warn(`[CORS] Blocked origin: ${origin}`);
      }
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-LB-Token',
    ],
    maxAge: 86400,
  });

  app
    .getHttpAdapter()
    .get('/healthz', (_req, res) => res.status(200).send({ ok: true }));

  // if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('Houznext API')
    .setDescription('API documentation for Houznext backend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'access-token',
    ).addSecurityRequirements('access-token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  // }

  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 4000;

  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Houznext backend running on port ${port}`);
  console.log('🌐 Health check: /healthz');
}
bootstrap();
