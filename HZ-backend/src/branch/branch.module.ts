import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { UserBranchMembership } from './entities/user-branch-membership.entity';
import { BranchService } from './branch.service';
import { MembershipService } from './membership.service';
import { BranchController } from './branch.controller';
import { MembershipController } from './membership.controller';
import { MembershipModule } from './membership.module';
import { UserModule } from 'src/user/user.module';
import { BranchRole } from 'src/branchRole/entities/branch-role.entity';
import { BranchRolePermission } from 'src/branch-role-permission/entities/branch-role.-permission.entity';
import { BranchRoleService } from 'src/branchRole/branch-role.service';
import { OtpModule } from 'src/otp/otp.module';
import { User } from 'src/user/entities/user.entity';
import { AuthModule } from 'src/authSession/auth.module';
import { BranchLegalServiceModule } from '../legalServices/branch-legal-service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Branch,
      UserBranchMembership,
      BranchRole,
      BranchRolePermission,
      User,
    ]),
    forwardRef(() => MembershipModule),
    forwardRef(() => UserModule),
    forwardRef(() => OtpModule),
    forwardRef(() => BranchLegalServiceModule),
    AuthModule,
  ],
  controllers: [BranchController, MembershipController],
  providers: [BranchService, MembershipService, BranchRoleService],
  exports: [BranchService, MembershipService, TypeOrmModule, BranchRoleService],
})
export class BranchModule {}
