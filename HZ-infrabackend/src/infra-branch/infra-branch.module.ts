import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraBranch } from './entities/infra-branch.entity';
import { InfraUserBranchMembership } from './entities/infra-user-branch-membership.entity';
import { InfraUser } from '../infra-user/entities/infra-user.entity';
import { InfraBranchRole } from '../infra-branch-role/entities/infra-branch-role.entity';
import { InfraBranchService } from './infra-branch.service';
import { InfraBranchController } from './infra-branch.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InfraBranch, InfraUserBranchMembership, InfraUser, InfraBranchRole]),
  ],
  controllers: [InfraBranchController],
  providers: [InfraBranchService],
  exports: [InfraBranchService],
})
export class InfraBranchModule {}
