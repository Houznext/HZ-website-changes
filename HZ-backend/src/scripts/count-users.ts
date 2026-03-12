import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || 'development'}`,
  ),
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const total = await userRepo.count();
    console.log(`TOTAL_USERS=${total}`);

    if (total > 0) {
      const users = await userRepo.find({
        select: ['id', 'email', 'username', 'firstName', 'lastName'],
        take: 5,
        order: { createdAt: 'ASC' } as any,
      });
      console.log(
        'USERS_SUMMARY=',
        users.map((u) => ({
          id: u.id,
          email: u.email,
          username: (u as any).username ?? null,
          name: `${(u as any).firstName ?? ''} ${(u as any).lastName ?? ''}`.trim(),
        })),
      );
    }
  } catch (err) {
    console.error('Failed to count users:', err);
  } finally {
    await app.close();
  }
}

run();

