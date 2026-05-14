import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraAdmin } from '../admin/entities/infra-admin.entity';
import { InfraDeveloper } from '../developer/entities/infra-developer.entity';
import { InfraCustomer } from '../customer/entities/infra-customer.entity';
import { InfraUser } from '../infra-user/entities/infra-user.entity';
import { InfraUserBranchMembership } from '../infra-branch/entities/infra-user-branch-membership.entity';
import { InfraBranch } from '../infra-branch/entities/infra-branch.entity';
import { InfraBranchRole } from '../infra-branch-role/entities/infra-branch-role.entity';
import { InfraBranchRolePermission } from '../infra-branch-role-permission/entities/infra-branch-role-permission.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InfraAdmin,
      InfraDeveloper,
      InfraCustomer,
      InfraUser,
      InfraUserBranchMembership,
      InfraBranch,
      InfraBranchRole,
      InfraBranchRolePermission,
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || process.env.INFRA_JWT_SECRET || 'dev-secret-change-me',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
