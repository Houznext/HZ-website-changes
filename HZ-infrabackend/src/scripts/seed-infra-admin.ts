import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';

dotenv.config({
  path: path.resolve(__dirname, '..', '..', `.env.${process.env.NODE_ENV || 'development'}`),
});
dotenv.config();

async function main() {
  const email = process.env.INFRA_ADMIN_EMAIL?.trim() || 'admin@infra.houznext.com';
  const password =
    process.env.INFRA_ADMIN_PASSWORD?.trim() ||
    process.env.INFRA_ADMIN_SEED_PASSWORD?.trim();
  const username = process.env.INFRA_ADMIN_USERNAME?.trim() || 'infra_admin';

  if (!password) {
    console.error('Set INFRA_ADMIN_PASSWORD or INFRA_ADMIN_SEED_PASSWORD.');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const auth = app.get(AuthService);
    await auth.seedInfraPortalAdmin(email, password, username);
    console.log(`Seeded infra portal admin: ${email} (username: ${username})`);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
