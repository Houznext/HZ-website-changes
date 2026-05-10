import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

dotenv.config({
  path: path.resolve(__dirname, '..', '..', `.env.${process.env.NODE_ENV || 'development'}`),
});
dotenv.config();

async function seedAdmin() {
  const password = process.env.INFRA_ADMIN_SEED_PASSWORD;
  if (!password) {
    console.error('ERROR: Set INFRA_ADMIN_SEED_PASSWORD env var before running this script.');
    process.exit(1);
  }

  const { buildTypeOrmOptions } = await import('../db/datasource');
  const { InfraAdmin } = await import('../admin/entities/infra-admin.entity');

  const ds = new DataSource({ ...buildTypeOrmOptions(), synchronize: true });
  await ds.initialize();

  const adminRepo = ds.getRepository(InfraAdmin);

  const existing = await adminRepo.findOne({ where: { email: 'admin@infra.houznext.com' } });
  if (existing) {
    console.log('Admin already exists — skipping seed.');
    await ds.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = adminRepo.create({
    email: 'admin@infra.houznext.com',
    passwordHash,
    name: 'Infra Admin',
    role: 'admin',
  });
  await adminRepo.save(admin);

  console.log('✓ Admin created: admin@infra.houznext.com');
  console.log('  Password: [as set in INFRA_ADMIN_SEED_PASSWORD]');
  await ds.destroy();
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
