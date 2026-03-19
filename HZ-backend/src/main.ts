import * as dotenv from 'dotenv';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

dotenv.config({
  path: path.resolve(
    __dirname,
    '..',
    `.env.${process.env.NODE_ENV || 'development'}`,
  ),
});
dotenv.config();

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
  ];

  const allowedOrigins = [...staticLocalOrigins, ...envOrigins].map((s) =>
    s.replace(/\/$/, ''),
  );

  app.enableCors({
    origin: (origin, cb) => {
      // Server-to-server (no Origin header) or no restrictions configured → allow
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === staticLocalOrigins.length && !isProd) {
        return cb(null, true);
      }
      const normalized = origin.replace(/\/$/, '');
      // Always allow Vercel preview URLs for this project
      const isVercelPreview = normalized.endsWith('.vercel.app');
      if (allowedOrigins.includes(normalized) || isVercelPreview) {
        return cb(null, true);
      }
      // Return null (not an Error) so Express does NOT throw a 500;
      // the browser will see missing CORS headers and block the request cleanly.
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
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
