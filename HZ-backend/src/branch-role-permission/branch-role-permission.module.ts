import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchRolePermissionService } from './branch-role-permission.service';
import { BranchRolePermissionController } from './branch-role-permission.controller';
import { BranchRole } from 'src/branchRole/entities/branch-role.entity';
import { BranchRolePermission } from './entities/branch-role.-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BranchRolePermission, BranchRole])],
  controllers: [BranchRolePermissionController],
  providers: [BranchRolePermissionService],
  exports: [BranchRolePermissionService],
})
export class BranchRolePermissionModule {}
