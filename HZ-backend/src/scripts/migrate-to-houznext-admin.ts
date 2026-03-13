/**
 * Migrate admin user: Remove lavudyasachinchavan@gmail.com permanently.
 * Create/ensure business@houznext.com exists with full admin (Cost Estimator, Invoice, all actions).
 * Run: npm run migrate:houznext-admin
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
import { CostEstimator } from '../cost-estimator/entities/cost-estimator.entity';
import { InvoiceEstimator } from '../invoice-estimator/entities/invoice-estimator.entity';
import { UserKind, UserRole } from '../user/enum/user.enum';
import { BranchCategory, BranchLevel } from '../branch/enum/branch.enum';
import {
  PermissionResourceEnum,
  getAllResources,
} from '../permission/enum/permission.enum';
import * as bcrypt from 'bcrypt';

const OLD_ADMIN_EMAIL = 'lavudyasachinchavan@gmail.com';
const NEW_ADMIN_EMAIL = 'business@houznext.com';
const NEW_ADMIN_PASSWORD = 'Houznext@758';
const NEW_ADMIN_FIRST_NAME = 'Houznext';
const NEW_ADMIN_LAST_NAME = 'Admin';
const NEW_ADMIN_USERNAME = 'houznext-admin';
const ORG_BRANCH_NAME = process.env.ORG_BRANCH_NAME || 'Houznext';

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
  const costEstimatorRepo = app.get<Repository<CostEstimator>>(
    getRepositoryToken(CostEstimator),
  );
  const invoiceEstimatorRepo = app.get<Repository<InvoiceEstimator>>(
    getRepositoryToken(InvoiceEstimator),
  );

  // 1. Get or create ORG branch
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
    console.log(`Using ORG branch: ${branch.name} (${branch.id})`);
  }

  // 2. Get or create SuperAdmin role with ALL permissions
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
    console.log(`Using SuperAdmin role (${superAdminRole.id})`);
  }

  // 3. Find or create new admin user (business@houznext.com)
  let newUser = await userRepo.findOne({ where: { email: NEW_ADMIN_EMAIL } });

  if (!newUser) {
    const hashedPassword = await bcrypt.hash(NEW_ADMIN_PASSWORD, 10);
    newUser = userRepo.create({
      email: NEW_ADMIN_EMAIL,
      username: NEW_ADMIN_USERNAME,
      firstName: NEW_ADMIN_FIRST_NAME,
      lastName: NEW_ADMIN_LAST_NAME,
      fullName: `${NEW_ADMIN_FIRST_NAME} ${NEW_ADMIN_LAST_NAME}`,
      password: hashedPassword,
      phone: null,
      kind: UserKind.STAFF,
      role: UserRole.ADMIN,
      isVerified: true,
      currentBranch: branch,
    });
    newUser = await userRepo.save(newUser);
    console.log(`Created new ADMIN user: ${newUser.email} (${newUser.id})`);
  } else {
    const hashedPassword = await bcrypt.hash(NEW_ADMIN_PASSWORD, 10);
    newUser.password = hashedPassword;
    newUser.role = UserRole.ADMIN;
    newUser.isVerified = true;
    newUser = await userRepo.save(newUser);
    console.log(`Updated ADMIN user: ${newUser.email} (${newUser.id})`);
  }

  // 4. Ensure new user has branch membership with SuperAdmin role
  let membership = await membershipRepo.findOne({
    where: { user: { id: newUser.id }, branch: { id: branch.id } },
    relations: ['branchRoles'],
  });

  if (!membership) {
    membership = membershipRepo.create({
      user: newUser,
      branch,
      branchRoles: [superAdminRole],
      isBranchHead: true,
      isPrimary: true,
    });
    await membershipRepo.save(membership);
    console.log(`Created branch membership for ${NEW_ADMIN_EMAIL}`);
  } else {
    const hasSuperAdmin = membership.branchRoles?.some(
      (r) => r.roleName === 'SuperAdmin',
    );
    if (!hasSuperAdmin) {
      membership.branchRoles = [superAdminRole];
      membership.isBranchHead = true;
      membership.isPrimary = true;
      await membershipRepo.save(membership);
      console.log(`Updated branch membership with SuperAdmin role`);
    }
  }

  // 5. Find old user and reassign their data to new user, then delete
  const oldUser = await userRepo.findOne({
    where: { email: OLD_ADMIN_EMAIL },
  });

  if (oldUser) {
    // Reassign cost estimators to new user (so data is not lost)
    const costResult = await costEstimatorRepo
      .createQueryBuilder()
      .update(CostEstimator)
      .set({ postedById: newUser.id } as any)
      .where('postedById = :oldId', { oldId: oldUser.id })
      .execute();
    if (costResult.affected && costResult.affected > 0) {
      console.log(`Reassigned ${costResult.affected} cost estimation(s) to ${NEW_ADMIN_EMAIL}`);
    }

    // Reassign invoice estimators to new user (column name from JoinColumn)
    const invoiceResult = await invoiceEstimatorRepo
      .createQueryBuilder()
      .update(InvoiceEstimator)
      .set({ posted_by_id: newUser.id } as any)
      .where('posted_by_id = :oldId', { oldId: oldUser.id })
      .execute();
    if (invoiceResult.affected && invoiceResult.affected > 0) {
      console.log(`Reassigned ${invoiceResult.affected} invoice(s) to ${NEW_ADMIN_EMAIL}`);
    }

    // Delete old user's branch memberships
    await membershipRepo.delete({ user: { id: oldUser.id } });
    console.log(`Removed branch memberships for ${OLD_ADMIN_EMAIL}`);

    // Delete old user (other relations may cascade or need handling per your schema)
    await userRepo.remove(oldUser);
    console.log(`Permanently removed user: ${OLD_ADMIN_EMAIL}`);
  } else {
    console.log(`User ${OLD_ADMIN_EMAIL} not found in DB (already removed or never existed).`);
  }

  console.log('\n--- Migration complete ---');
  console.log(`Admin login: ${NEW_ADMIN_EMAIL}`);
  console.log(`Password:    ${NEW_ADMIN_PASSWORD}`);
  console.log(`Role:        ADMIN (full access: Cost Estimator, Invoice, all actions)`);

  await app.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
