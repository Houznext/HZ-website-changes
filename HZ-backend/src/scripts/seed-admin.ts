/**
 * Seed script: Create the initial ADMIN super-user + ORG branch + SuperAdmin role.
 * Run: npm run seed:admin
 */
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
import { Branch } from '../branch/entities/branch.entity';
import { BranchRole } from '../branchRole/entities/branch-role.entity';
import { BranchRolePermission } from '../branch-role-permission/entities/branch-role.-permission.entity';
import { UserBranchMembership } from '../branch/entities/user-branch-membership.entity';
import { UserKind, UserRole } from '../user/enum/user.enum';
import { BranchCategory, BranchLevel } from '../branch/enum/branch.enum';
import {
  PermissionResourceEnum,
  getAllResources,
} from '../permission/enum/permission.enum';
import * as bcrypt from 'bcrypt';

const isProd = process.env.NODE_ENV === 'production';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || (isProd ? '' : 'business@houznext.com');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProd ? '' : 'Houznext@758');
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Houznext';
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'Admin';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '9999999999';
const ORG_BRANCH_NAME = process.env.ORG_BRANCH_NAME || 'OneCasa';

if (isProd && (!ADMIN_EMAIL || !ADMIN_PASSWORD)) {
  console.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD are required in production.');
  console.error('Pass them as environment variables.');
  process.exit(1);
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const branchRepo = app.get<Repository<Branch>>(getRepositoryToken(Branch));
  const branchRoleRepo = app.get<Repository<BranchRole>>(
    getRepositoryToken(BranchRole),
  );
  const brPermRepo = app.get<Repository<BranchRolePermission>>(
    getRepositoryToken(BranchRolePermission),
  );
  const membershipRepo = app.get<Repository<UserBranchMembership>>(
    getRepositoryToken(UserBranchMembership),
  );

  // 1. Create or find ORG branch
  let branch = await branchRepo.findOne({
    where: { level: BranchLevel.ORG, name: ORG_BRANCH_NAME },
  });

  if (!branch) {
    branch = branchRepo.create({
      name: ORG_BRANCH_NAME,
      level: BranchLevel.ORG,
      category: BranchCategory.ORGANIZATION,
      isActive: true,
      isHeadOffice: true,
      path: '',
    });
    branch = await branchRepo.save(branch);
    branch.path = branch.id;
    await branchRepo.save(branch);
    console.log(`Created ORG branch: ${branch.name} (${branch.id})`);
  } else {
    console.log(`ORG branch already exists: ${branch.name} (${branch.id})`);
  }

  // 2. Create SuperAdmin BranchRole with ALL permissions
  let superAdminRole = await branchRoleRepo.findOne({
    where: { branch: { id: branch.id }, roleName: 'SuperAdmin' },
    relations: ['permissions'],
  });

  if (!superAdminRole) {
    superAdminRole = branchRoleRepo.create({
      roleName: 'SuperAdmin',
      branch: { id: branch.id } as any,
      isBranchHead: true,
    });
    superAdminRole = await branchRoleRepo.save(superAdminRole);

    const allResources = getAllResources();
    const permEntities = allResources.map((resource) =>
      brPermRepo.create({
        branchRole: { id: superAdminRole!.id } as any,
        resource,
        view: true,
        create: true,
        edit: true,
        delete: true,
      }),
    );
    await brPermRepo.save(permEntities);
    console.log(
      `Created SuperAdmin role with ${allResources.length} permissions`,
    );
  } else {
    console.log(`SuperAdmin role already exists (${superAdminRole.id})`);
  }

  // 3. Create ADMIN user
  let user = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });

  if (!user) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const username = `${ADMIN_FIRST_NAME}.${ADMIN_LAST_NAME}.admin`;

    user = userRepo.create({
      email: ADMIN_EMAIL,
      username,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      fullName: `${ADMIN_FIRST_NAME} ${ADMIN_LAST_NAME}`,
      password: hashedPassword,
      phone: ADMIN_PHONE,
      kind: UserKind.STAFF,
      role: UserRole.ADMIN,
      isVerified: true,
      currentBranch: branch,
    });
    user = await userRepo.save(user);
    console.log(`Created ADMIN user: ${user.email} (${user.id})`);
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    user.password = hashedPassword;
    if (user.role !== UserRole.ADMIN) {
      user.role = UserRole.ADMIN;
    }
    user.isVerified = true;
    user = await userRepo.save(user);
    console.log(`Updated ADMIN user password & role: ${user.email} (${user.id})`);
  }

  // 4. Create membership
  let membership = await membershipRepo.findOne({
    where: { user: { id: user.id }, branch: { id: branch.id } },
  });

  if (!membership) {
    membership = membershipRepo.create({
      user,
      branch,
      branchRoles: [superAdminRole],
      isBranchHead: true,
      isPrimary: true,
    });
    await membershipRepo.save(membership);
    console.log(`Created branch membership for ADMIN user`);
  } else {
    console.log(`Branch membership already exists`);
  }

  const isProd = process.env.NODE_ENV === 'production';
  console.log('\n--- Seed complete ---');
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${isProd ? '********' : ADMIN_PASSWORD}`);
  console.log(`Role:     ADMIN`);
  console.log(`Branch:   ${ORG_BRANCH_NAME} (ORG)`);

  await app.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
