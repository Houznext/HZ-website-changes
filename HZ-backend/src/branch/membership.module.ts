import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { UserBranchMembership } from './entities/user-branch-membership.entity';
import { User } from 'src/user/entities/user.entity';
import { Branch } from './entities/branch.entity';
import { BranchRole } from 'src/branchRole/entities/branch-role.entity';
import { UserModule } from 'src/user/user.module';
import { BranchModule } from './branch.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserBranchMembership, User, Branch, BranchRole]),
    forwardRef(() => BranchModule), 
    forwardRef(() => UserModule),   
  ],
  controllers: [MembershipController],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
