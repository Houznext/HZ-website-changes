import * as dotenv from 'dotenv';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression = require('compression');
import cookieParser = require('cookie-parser');

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false }));
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

  const envOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\/$/, ''));

  const staticOrigins = ['http://localhost:3002', 'http://localhost:3003'];
  const allowedOrigins = [...staticOrigins, ...envOrigins].map((s) => s.replace(/\/$/, ''));
  const allowVercelOrigins = process.env.ALLOW_VERCEL_ORIGINS !== 'false';

  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalized)) return cb(null, true);
      if (allowVercelOrigins && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized)) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token'],
  });

  const config = new DocumentBuilder()
    .setTitle('Houznext Infra API')
    .setDescription('Backend API for infra.houznext.com')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`Houznext Infra backend running on port ${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Loaded' : 'MISSING — check .env'}`);
}

bootstrap();
