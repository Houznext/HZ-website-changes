import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InfraUser } from './entities/infra-user.entity';
import { InfraUserBranchMembership } from '../infra-branch/entities/infra-user-branch-membership.entity';
import { InfraUserService } from './infra-user.service';
import { InfraUserController } from './infra-user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InfraUser, InfraUserBranchMembership]),
    AuthModule,
  ],
  controllers: [InfraUserController],
  providers: [InfraUserService],
  exports: [InfraUserService],
})
export class InfraUserModule {}
