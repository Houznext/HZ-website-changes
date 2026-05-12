import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

dotenv.config({
  path: path.resolve(__dirname, '..', '..', `.env.${process.env.NODE_ENV || 'development'}`),
});
dotenv.config();

async function seedAdmins() {
  const primaryPassword = process.env.INFRA_ADMIN_SEED_PASSWORD;
  const businessEmail = process.env.INFRA_BUSINESS_ADMIN_EMAIL || 'business@houznext.com';
  const businessPassword = process.env.INFRA_BUSINESS_ADMIN_PASSWORD;

  if (!primaryPassword && !businessPassword) {
    console.error(
      'ERROR: Set INFRA_ADMIN_SEED_PASSWORD (for admin@infra.houznext.com) and/or INFRA_BUSINESS_ADMIN_PASSWORD (for business@houznext.com).',
    );
    process.exit(1);
  }

  const { buildTypeOrmOptions } = await import('../db/datasource');
  const { InfraAdmin } = await import('../admin/entities/infra-admin.entity');

  const ds = new DataSource({ ...buildTypeOrmOptions(), synchronize: true });
  await ds.initialize();

  const adminRepo = ds.getRepository(InfraAdmin);

  if (primaryPassword) {
    const primaryEmail = 'admin@infra.houznext.com';
    const existingPrimary = await adminRepo.findOne({ where: { email: primaryEmail } });
    if (existingPrimary) {
      console.log(`Primary admin already exists — skipping: ${primaryEmail}`);
    } else {
      const passwordHash = await bcrypt.hash(primaryPassword, 12);
      await adminRepo.save(
        adminRepo.create({
          email: primaryEmail,
          passwordHash,
          name: 'Infra Admin',
          role: 'admin',
        }),
      );
      console.log(`✓ Admin created: ${primaryEmail}`);
      console.log('  Password: [as set in INFRA_ADMIN_SEED_PASSWORD]');
    }
  }

  if (businessPassword) {
    const passwordHash = await bcrypt.hash(businessPassword, 12);
    const existing = await adminRepo.findOne({ where: { email: businessEmail } });
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.name = existing.name || 'Business Admin';
      existing.role = existing.role || 'admin';
      await adminRepo.save(existing);
      console.log(`✓ Business admin password updated: ${businessEmail}`);
    } else {
      await adminRepo.save(
        adminRepo.create({
          email: businessEmail,
          passwordHash,
          name: 'Business Admin',
          role: 'admin',
        }),
      );
      console.log(`✓ Business admin created: ${businessEmail}`);
    }
    console.log('  Password: [as set in INFRA_BUSINESS_ADMIN_PASSWORD]');
  }

  await ds.destroy();
}

seedAdmins().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
