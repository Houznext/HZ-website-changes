import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraBranchRole } from './entities/infra-branch-role.entity';
import { InfraBranch } from '../infra-branch/entities/infra-branch.entity';
import { InfraBranchRolePermission } from '../infra-branch-role-permission/entities/infra-branch-role-permission.entity';
import { InfraBranchRoleService } from './infra-branch-role.service';
import { InfraBranchRoleController } from './infra-branch-role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InfraBranchRole, InfraBranch, InfraBranchRolePermission])],
  controllers: [InfraBranchRoleController],
  providers: [InfraBranchRoleService],
  exports: [InfraBranchRoleService],
})
export class InfraBranchRoleModule {}
