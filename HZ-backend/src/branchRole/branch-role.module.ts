import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchRole } from './entities/branch-role.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { BranchRoleService } from './branch-role.service';
import { BranchRoleController } from './branch-role.controller';
import { BranchRolePermission } from 'src/branch-role-permission/entities/branch-role.-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BranchRole, BranchRolePermission, Branch])],
  controllers: [BranchRoleController],
  providers: [BranchRoleService],
  exports: [BranchRoleService],
})
export class BranchRoleModule {}
